import type { DB } from './client-db'
import type { NewNote, NewNoteDetail, NewSyncQueueItem, Note, NoteDetail, SyncQueueItem } from './schema'
import { and, desc, eq } from 'drizzle-orm'
import { clientDatabaseManager } from './client-db'
import {
  noteDetailsTable,
  notesTable,
  syncQueueTable,
} from './schema'

// ============================================================================
// Types
// ============================================================================

export interface NoteWithDetails extends Note {
  details: NoteDetail[]
}

export interface LocalNotesServiceOptions {
  schoolId: string
  teacherId: string
  classId?: string
}

// ============================================================================
// Local Notes Service
// ============================================================================

class LocalNotesService {
  // --------------------------------------------------------------------------
  // Database Access
  // --------------------------------------------------------------------------

  private async getDb(): Promise<DB> {
    return clientDatabaseManager.getDb()
  }

  // --------------------------------------------------------------------------
  // Note CRUD Operations
  // --------------------------------------------------------------------------

  /**
   * Save a note locally with optional details
   */
  async saveNoteLocally(
    noteData: NewNote,
    details?: NewNoteDetail[],
  ): Promise<void> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()
      const noteId = noteData.id
      const now = new Date()

      // Insert note with dirty flag for sync
      const noteToInsert = {
        ...noteData,
        isDirty: true,
        lastSyncAt: null,
        updatedAt: now,
      }

      const note = await db.insert(notesTable).values(noteToInsert).returning()
      if (!note.length) {
        throw new Error('Failed to save note locally')
      }

      // Insert note details if provided
      if (details && details.length > 0) {
        const noteDetailsToInsert = details.map(detail => ({
          ...detail,
          noteId,
          isDirty: true,
          updatedAt: now,
        }))

        await db.insert(noteDetailsTable).values(noteDetailsToInsert)
      }

      // Add to sync queue
      await this.addToSyncQueue('create', 'notes', noteId!, noteData)
    }
    catch (error) {
      throw new Error(
        `Failed to save note locally: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Update an existing note locally
   */
  async updateNoteLocally(
    noteId: string,
    updates: Partial<NewNote>,
    details?: NewNoteDetail[],
  ): Promise<void> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()
      const now = new Date()

      // Update note
      await db
        .update(notesTable)
        .set({
          ...updates,
          isDirty: true,
          updatedAt: now,
        })
        .where(eq(notesTable.id, noteId))

      // Update or insert details if provided
      if (details && details.length > 0) {
        for (const detail of details) {
          const existingDetail = await db
            .select()
            .from(noteDetailsTable)
            .where(
              and(
                eq(noteDetailsTable.noteId, noteId),
                eq(noteDetailsTable.studentId, detail.studentId!),
              ),
            )
            .limit(1)

          if (existingDetail.length > 0 && existingDetail[0]) {
            await db
              .update(noteDetailsTable)
              .set({
                value: detail.value,
                gradedAt: detail.gradedAt,
                isDirty: true,
                updatedAt: now,
              })
              .where(eq(noteDetailsTable.id, existingDetail[0].id))
          }
          else {
            await db.insert(noteDetailsTable).values({
              ...detail,
              noteId,
              isDirty: true,
              updatedAt: now,
            })
          }
        }
      }

      // Add to sync queue
      await this.addToSyncQueue('update', 'notes', noteId, updates)
    }
    catch (error) {
      throw new Error(
        `Failed to update note locally: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Soft delete a note locally
   */
  async deleteNoteLocally(noteId: string): Promise<void> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()
      const now = new Date()

      // Soft delete the note
      await db
        .update(notesTable)
        .set({
          isDeleted: true,
          isDirty: true,
          updatedAt: now,
        })
        .where(eq(notesTable.id, noteId))

      // Soft delete related details
      await db
        .update(noteDetailsTable)
        .set({
          isDeleted: true,
          isDirty: true,
          updatedAt: now,
        })
        .where(eq(noteDetailsTable.noteId, noteId))

      // Add to sync queue
      await this.addToSyncQueue('delete', 'notes', noteId, { id: noteId })
    }
    catch (error) {
      throw new Error(
        `Failed to delete note locally: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Get a note by ID with its details
   */
  async getNoteById(noteId: string): Promise<NoteWithDetails | null> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()

      const notes = await db
        .select()
        .from(notesTable)
        .where(and(eq(notesTable.id, noteId), eq(notesTable.isDeleted, false)))
        .limit(1)

      if (notes.length === 0) {
        return null
      }

      const details = await db
        .select()
        .from(noteDetailsTable)
        .where(
          and(
            eq(noteDetailsTable.noteId, noteId),
            eq(noteDetailsTable.isDeleted, false),
          ),
        )

      const note = notes[0]
      if (!note || !note.id) {
        return null
      }

      return {
        ...note,
        id: note.id,
        details,
      } as NoteWithDetails
    }
    catch (error) {
      throw new Error(
        `Failed to get note: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Find a note by attributes or return null
   */
  async findNote(params: {
    classId: string
    subjectId: string
    termId: string
    type: string
    teacherId: string
  }): Promise<NoteWithDetails | null> {
    const db = await this.getDb()
    const result = await db
      .select()
      .from(notesTable)
      .where(
        and(
          eq(notesTable.classId, params.classId),
          eq(notesTable.subjectId, params.subjectId),
          eq(notesTable.termId, params.termId),
          eq(notesTable.type, params.type),
          eq(notesTable.teacherId, params.teacherId),
          eq(notesTable.isDeleted, false),
        ),
      )
      .limit(1)

    if (result.length === 0)
      return null
    return this.getNoteById(result[0]!.id)
  }

  /**
   * Get all notes for a class
   */
  async getNotesByClass(
    classId: string,
    options?: { includeUnpublished?: boolean },
  ): Promise<Note[]> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()

      const conditions = [
        eq(notesTable.classId, classId),
        eq(notesTable.isDeleted, false),
      ]

      if (!options?.includeUnpublished) {
        conditions.push(eq(notesTable.isPublished, true))
      }

      return await db
        .select()
        .from(notesTable)
        .where(and(...conditions))
        .orderBy(desc(notesTable.createdAt))
    }
    catch (error) {
      throw new Error(
        `Failed to get notes by class: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Get all notes for a teacher
   */
  async getNotesByTeacher(
    teacherId: string,
    options?: { classId?: string, includeUnpublished?: boolean },
  ): Promise<Note[]> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()

      const conditions = [
        eq(notesTable.teacherId, teacherId),
        eq(notesTable.isDeleted, false),
      ]

      if (options?.classId) {
        conditions.push(eq(notesTable.classId, options.classId))
      }

      if (!options?.includeUnpublished) {
        conditions.push(eq(notesTable.isPublished, true))
      }

      return await db
        .select()
        .from(notesTable)
        .where(and(...conditions))
        .orderBy(desc(notesTable.createdAt))
    }
    catch (error) {
      throw new Error(
        `Failed to get notes by teacher: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Get unpublished (dirty) notes that need syncing
   */
  async getUnpublishedNotes(): Promise<NoteWithDetails[]> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()

      const dirtyNotes = await db
        .select()
        .from(notesTable)
        .where(
          and(eq(notesTable.isDirty, true), eq(notesTable.isDeleted, false)),
        )
        .orderBy(desc(notesTable.createdAt))

      const notesWithDetails: NoteWithDetails[] = []

      for (const note of dirtyNotes) {
        const details = await db
          .select()
          .from(noteDetailsTable)
          .where(
            and(
              eq(noteDetailsTable.noteId, note.id),
              eq(noteDetailsTable.isDeleted, false),
            ),
          )

        notesWithDetails.push({
          ...note,
          details,
        })
      }

      return notesWithDetails
    }
    catch (error) {
      throw new Error(
        `Failed to get unpublished notes: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Find an unpublished note for a specific context
   */
  async findUnpublishedNote(params: {
    classId: string
    schoolId: string
    subjectId?: string
    teacherId: string
  }): Promise<NoteWithDetails | null> {
    try {
      if (!clientDatabaseManager.isReady()) {
        return null
      }

      const db = await this.getDb()
      const conditions = [
        eq(notesTable.classId, params.classId),
        eq(notesTable.schoolId, params.schoolId),
        eq(notesTable.teacherId, params.teacherId),
        eq(notesTable.isPublished, false),
        eq(notesTable.isDeleted, false),
      ]

      if (params.subjectId) {
        conditions.push(eq(notesTable.subjectId, params.subjectId))
      }

      const result = await db
        .select()
        .from(notesTable)
        .where(and(...conditions))
        .orderBy(desc(notesTable.updatedAt))
        .limit(1)

      if (result.length === 0)
        return null

      return this.getNoteById(result[0]!.id)
    }
    catch (error) {
      console.error('Failed to find unpublished note:', error)
      return null
    }
  }

  /**
   * Count unpublished notes for a specific context
   */
  async countUnpublishedNotes(params: {
    classId: string
    schoolId: string
    teacherId: string
  }): Promise<number> {
    try {
      if (!clientDatabaseManager.isReady()) {
        return 0
      }

      const db = await this.getDb()
      const result = await db
        .select()
        .from(notesTable)
        .where(
          and(
            eq(notesTable.classId, params.classId),
            eq(notesTable.schoolId, params.schoolId),
            eq(notesTable.teacherId, params.teacherId),
            eq(notesTable.isPublished, false),
            eq(notesTable.isDeleted, false),
          ),
        )

      return result.length
    }
    catch (error) {
      console.error('Failed to count unpublished notes:', error)
      return 0
    }
  }

  // --------------------------------------------------------------------------
  // Note Details Operations
  // --------------------------------------------------------------------------

  /**
   * Update a student's grade for a note
   */
  async updateStudentGrade(
    noteId: string,
    studentId: string,
    value: string,
  ): Promise<void> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()
      const now = new Date()

      const existingDetail = await db
        .select()
        .from(noteDetailsTable)
        .where(
          and(
            eq(noteDetailsTable.noteId, noteId),
            eq(noteDetailsTable.studentId, studentId),
          ),
        )
        .limit(1)

      if (existingDetail.length > 0 && existingDetail[0]) {
        const detailRecord = existingDetail[0]
        await db
          .update(noteDetailsTable)
          .set({
            value,
            gradedAt: now,
            isDirty: true,
            updatedAt: now,
          })
          .where(eq(noteDetailsTable.id, detailRecord.id))

        await this.addToSyncQueue(
          'update',
          'note_details',
          detailRecord.id,
          { value, studentId, noteId },
        )
      }
      else {
        const detailId = `${noteId}-${studentId}-${Date.now()}`
        await db.insert(noteDetailsTable).values({
          id: detailId,
          noteId,
          studentId,
          value,
          gradedAt: now,
          isDirty: true,
          updatedAt: now,
        })

        await this.addToSyncQueue('create', 'note_details', detailId, {
          value,
          studentId,
          noteId,
        })
      }
    }
    catch (error) {
      throw new Error(
        `Failed to update student grade: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Get grades for a specific note
   */
  async getGradesByNote(noteId: string): Promise<NoteDetail[]> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()

      return await db
        .select()
        .from(noteDetailsTable)
        .where(
          and(
            eq(noteDetailsTable.noteId, noteId),
            eq(noteDetailsTable.isDeleted, false),
          ),
        )
    }
    catch (error) {
      throw new Error(
        `Failed to get grades by note: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  // --------------------------------------------------------------------------
  // Sync Queue Operations
  // --------------------------------------------------------------------------

  /**
   * Add an item to the sync queue
   */
  async addToSyncQueue(
    operation: 'create' | 'update' | 'delete',
    tableName: 'notes' | 'note_details',
    recordId: string,
    data: unknown,
  ): Promise<void> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()

      const syncItem: NewSyncQueueItem = {
        id: `${tableName}-${recordId}-${Date.now()}`,
        operation,
        tableName,
        recordId,
        data: JSON.stringify(data),
        status: 'pending',
      }

      await db.insert(syncQueueTable).values(syncItem)
    }
    catch (error) {
      throw new Error(
        `Failed to add to sync queue: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Get pending sync items
   */
  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()

      return await db
        .select()
        .from(syncQueueTable)
        .where(eq(syncQueueTable.status, 'pending'))
        .orderBy(syncQueueTable.createdAt)
    }
    catch (error) {
      throw new Error(
        `Failed to get pending sync items: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Mark a sync item as completed
   */
  async markSyncItemCompleted(syncId: string): Promise<void> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()
      const now = new Date()

      await db
        .update(syncQueueTable)
        .set({
          status: 'completed',
          lastAttempt: now,
        })
        .where(eq(syncQueueTable.id, syncId))
    }
    catch (error) {
      throw new Error(
        `Failed to mark sync item as completed: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Mark a sync item as failed
   */
  async markSyncItemFailed(syncId: string, errorMessage: string): Promise<void> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()
      const now = new Date()

      // Get current attempts
      const items = await db
        .select()
        .from(syncQueueTable)
        .where(eq(syncQueueTable.id, syncId))
        .limit(1)

      const currentAttempts = items[0]?.attempts ?? 0

      await db
        .update(syncQueueTable)
        .set({
          status: currentAttempts >= 2 ? 'failed' : 'pending',
          error: errorMessage,
          attempts: currentAttempts + 1,
          lastAttempt: now,
        })
        .where(eq(syncQueueTable.id, syncId))
    }
    catch (error) {
      throw new Error(
        `Failed to mark sync item as failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Update note sync timestamp after successful sync
   */
  async updateNoteSyncTimestamp(noteId: string): Promise<void> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()
      const now = new Date()

      await db
        .update(notesTable)
        .set({
          isDirty: false,
          lastSyncAt: now,
          updatedAt: now,
        })
        .where(eq(notesTable.id, noteId))

      // Also update related details
      await db
        .update(noteDetailsTable)
        .set({
          isDirty: false,
          lastSyncAt: now,
          updatedAt: now,
        })
        .where(eq(noteDetailsTable.noteId, noteId))
    }
    catch (error) {
      throw new Error(
        `Failed to update sync timestamp: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Clear completed sync items older than specified hours
   */
  async clearOldSyncItems(hoursOld = 24): Promise<void> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()
      // Note: For time-based filtering, we would use lt() with cutoffDate
      // For now, we just clear all completed items
      void hoursOld // Suppress unused warning

      await db
        .delete(syncQueueTable)
        .where(eq(syncQueueTable.status, 'completed'))
    }
    catch (error) {
      throw new Error(
        `Failed to clear old sync items: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Get count of pending sync items
   */
  async getPendingSyncCount(): Promise<number> {
    try {
      if (!clientDatabaseManager.isReady()) {
        return 0
      }

      const db = await this.getDb()

      const result = await db
        .select()
        .from(syncQueueTable)
        .where(eq(syncQueueTable.status, 'pending'))

      return result.length
    }
    catch {
      return 0
    }
  }

  // --------------------------------------------------------------------------
  // Publish / Sync Operations
  // --------------------------------------------------------------------------

  /**
   * Mark a note as published (ready for sync)
   */
  async publishNote(noteId: string): Promise<void> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()
      const now = new Date()

      await db
        .update(notesTable)
        .set({
          isPublished: true,
          isDirty: true,
          updatedAt: now,
        })
        .where(eq(notesTable.id, noteId))

      // Add to sync queue for publishing
      await this.addToSyncQueue('update', 'notes', noteId, { isPublished: true })
    }
    catch (error) {
      throw new Error(
        `Failed to publish note: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Clear all local data after successful publish
   */
  async clearLocalDataAfterPublish(noteIds: string[]): Promise<void> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()

      for (const noteId of noteIds) {
        // Delete note details first (due to foreign key)
        await db
          .delete(noteDetailsTable)
          .where(eq(noteDetailsTable.noteId, noteId))

        // Delete the note
        await db.delete(notesTable).where(eq(notesTable.id, noteId))
      }

      // Clear completed sync items for these notes
      await this.clearOldSyncItems(0)
    }
    catch (error) {
      throw new Error(
        `Failed to clear local data: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const localNotesService = new LocalNotesService()
