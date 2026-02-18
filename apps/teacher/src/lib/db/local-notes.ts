import type { DB } from './client-db'
import type { NewNote, NewNoteDetail } from './schema'
import { and, eq } from 'drizzle-orm'
import { clientDatabaseManager } from './client-db'
import {
  countUnpublishedNotes as countUnpublishedNotesQuery,
  findNote as findNoteQuery,
  findUnpublishedNote as findUnpublishedNoteQuery,
  getGradesByNote as getGradesByNoteQuery,
  getNoteById as getNoteByIdQuery,
  getNotesByClass as getNotesByClassQuery,
  getNotesByTeacher as getNotesByTeacherQuery,
  getUnpublishedNotes as getUnpublishedNotesQuery,
} from './local-notes-queries'
import {
  addToSyncQueue as addToSyncQueueAction,
  clearLocalDataAfterPublish as clearLocalDataAfterPublishAction,
  clearOldSyncItems as clearOldSyncItemsAction,
  getPendingSyncCount as getPendingSyncCountAction,
  getPendingSyncItems as getPendingSyncItemsAction,
  markSyncItemCompleted as markSyncItemCompletedAction,
  markSyncItemFailed as markSyncItemFailedAction,
  publishNote as publishNoteAction,
  updateNoteSyncTimestamp as updateNoteSyncTimestampAction,
} from './local-notes-sync'
import { noteDetailsTable, notesTable } from './schema'

export type { NoteWithDetails } from './local-notes-types'

export interface LocalNotesServiceOptions {
  schoolId: string
  teacherId: string
  classId?: string
}

class LocalNotesService {
  private async getDb(): Promise<DB> {
    return clientDatabaseManager.getDb()
  }

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

      if (details && details.length > 0) {
        const noteDetailsToInsert = details.map(detail => ({
          ...detail,
          noteId,
          isDirty: true,
          updatedAt: now,
        }))

        await db.insert(noteDetailsTable).values(noteDetailsToInsert)
      }

      await this.addToSyncQueue('create', 'notes', noteId!, noteData)
    }
    catch (error) {
      throw new Error(
        `Failed to save note locally: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

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

      await db
        .update(notesTable)
        .set({
          ...updates,
          isDirty: true,
          updatedAt: now,
        })
        .where(eq(notesTable.id, noteId))

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

      await this.addToSyncQueue('update', 'notes', noteId, updates)
    }
    catch (error) {
      throw new Error(
        `Failed to update note locally: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  async deleteNoteLocally(noteId: string): Promise<void> {
    try {
      if (!clientDatabaseManager.isReady()) {
        throw new Error('Database is not ready for use')
      }

      const db = await this.getDb()
      const now = new Date()

      await db
        .update(notesTable)
        .set({
          isDeleted: true,
          isDirty: true,
          updatedAt: now,
        })
        .where(eq(notesTable.id, noteId))

      await db
        .update(noteDetailsTable)
        .set({
          isDeleted: true,
          isDirty: true,
          updatedAt: now,
        })
        .where(eq(noteDetailsTable.noteId, noteId))

      await this.addToSyncQueue('delete', 'notes', noteId, { id: noteId })
    }
    catch (error) {
      throw new Error(
        `Failed to delete note locally: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  getNoteById = getNoteByIdQuery
  findNote = findNoteQuery
  getNotesByClass = getNotesByClassQuery
  getNotesByTeacher = getNotesByTeacherQuery
  getUnpublishedNotes = getUnpublishedNotesQuery
  findUnpublishedNote = findUnpublishedNoteQuery
  countUnpublishedNotes = countUnpublishedNotesQuery
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

  getGradesByNote = getGradesByNoteQuery
  addToSyncQueue = addToSyncQueueAction
  getPendingSyncItems = getPendingSyncItemsAction
  markSyncItemCompleted = markSyncItemCompletedAction
  markSyncItemFailed = markSyncItemFailedAction
  updateNoteSyncTimestamp = updateNoteSyncTimestampAction
  clearOldSyncItems = clearOldSyncItemsAction
  getPendingSyncCount = getPendingSyncCountAction
  publishNote = publishNoteAction
  clearLocalDataAfterPublish = clearLocalDataAfterPublishAction
}
export const localNotesService = new LocalNotesService()
