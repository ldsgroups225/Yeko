import type { NewSyncQueueItem, SyncQueueItem } from './schema'
import { and, eq } from 'drizzle-orm'
import { clientDatabaseManager } from './client-db'
import {
  getActionablePendingSyncCount,
  removeSyncQueueEntriesForPublishedNote,
} from './local-notes-sync-helpers'
import {
  noteDetailsTable,
  notesTable,
  syncQueueTable,
} from './schema'

// ============================================================================
// Sync Queue Operations
// ============================================================================

async function getDb() {
  return clientDatabaseManager.getDb()
}

/**
 * Add an item to the sync queue
 */
export async function addToSyncQueue(
  operation: 'create' | 'update' | 'delete',
  tableName: 'notes' | 'note_details',
  recordId: string,
  data: unknown,
): Promise<void> {
  try {
    if (!clientDatabaseManager.isReady()) {
      throw new Error('Database is not ready for use')
    }

    const db = await getDb()
    const now = new Date()

    const existingPendingItems = await db
      .select({
        id: syncQueueTable.id,
        operation: syncQueueTable.operation,
      })
      .from(syncQueueTable)
      .where(
        and(
          eq(syncQueueTable.tableName, tableName),
          eq(syncQueueTable.recordId, recordId),
          eq(syncQueueTable.status, 'pending'),
        ),
      )

    const existingItem = existingPendingItems[0]
    if (existingItem) {
      if (operation === 'update' && (existingItem.operation === 'create' || existingItem.operation === 'update')) {
        await db
          .update(syncQueueTable)
          .set({
            data: JSON.stringify(data),
            createdAt: now,
          })
          .where(eq(syncQueueTable.id, existingItem.id))
        return
      }

      if (operation === 'update' && existingItem.operation === 'delete') {
        return
      }

      if (operation === 'create' && existingItem.operation === 'create') {
        await db
          .update(syncQueueTable)
          .set({
            data: JSON.stringify(data),
            createdAt: now,
          })
          .where(eq(syncQueueTable.id, existingItem.id))
        return
      }

      if (operation === 'delete' && existingItem.operation === 'create') {
        await db.delete(syncQueueTable).where(eq(syncQueueTable.id, existingItem.id))
        return
      }

      if (operation === 'delete') {
        await db
          .delete(syncQueueTable)
          .where(
            and(
              eq(syncQueueTable.tableName, tableName),
              eq(syncQueueTable.recordId, recordId),
              eq(syncQueueTable.status, 'pending'),
            ),
          )
      }
    }

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
export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  try {
    if (!clientDatabaseManager.isReady()) {
      throw new Error('Database is not ready for use')
    }

    const db = await getDb()

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
export async function markSyncItemCompleted(syncId: string): Promise<void> {
  try {
    if (!clientDatabaseManager.isReady()) {
      throw new Error('Database is not ready for use')
    }

    const db = await getDb()
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
export async function markSyncItemFailed(syncId: string, errorMessage: string): Promise<void> {
  try {
    if (!clientDatabaseManager.isReady()) {
      throw new Error('Database is not ready for use')
    }

    const db = await getDb()
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
export async function updateNoteSyncTimestamp(noteId: string): Promise<void> {
  try {
    if (!clientDatabaseManager.isReady()) {
      throw new Error('Database is not ready for use')
    }

    const db = await getDb()
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
export async function clearOldSyncItems(hoursOld = 24): Promise<void> {
  try {
    if (!clientDatabaseManager.isReady()) {
      throw new Error('Database is not ready for use')
    }

    const db = await getDb()
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
export async function getPendingSyncCount(): Promise<number> {
  try {
    if (!clientDatabaseManager.isReady()) {
      return 0
    }

    const db = await getDb()
    return getActionablePendingSyncCount(db)
  }
  catch {
    return 0
  }
}

/**
 * Get count of failed sync items
 */
export async function getFailedSyncCount(): Promise<number> {
  try {
    if (!clientDatabaseManager.isReady()) {
      return 0
    }

    const db = await getDb()

    const result = await db
      .select()
      .from(syncQueueTable)
      .where(eq(syncQueueTable.status, 'failed'))

    return result.length
  }
  catch {
    return 0
  }
}

// ============================================================================
// Publish / Sync Operations
// ============================================================================

/**
 * Mark a note as published (ready for sync)
 */
export async function publishNote(noteId: string): Promise<void> {
  try {
    if (!clientDatabaseManager.isReady()) {
      throw new Error('Database is not ready for use')
    }

    const db = await getDb()
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
    await addToSyncQueue('update', 'notes', noteId, { isPublished: true })
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
export async function clearLocalDataAfterPublish(noteIds: string[]): Promise<void> {
  try {
    if (!clientDatabaseManager.isReady()) {
      throw new Error('Database is not ready for use')
    }

    const db = await getDb()

    for (const noteId of noteIds) {
      // Remove any queued sync operations for this note and its details
      // so sync status reflects successful publish immediately.
      await removeSyncQueueEntriesForPublishedNote(db, noteId)

      // Delete note details first (due to foreign key)
      await db
        .delete(noteDetailsTable)
        .where(eq(noteDetailsTable.noteId, noteId))

      // Delete the note
      await db.delete(notesTable).where(eq(notesTable.id, noteId))
    }

    // Clear completed sync items for these notes
    await clearOldSyncItems(0)
  }
  catch (error) {
    throw new Error(
      `Failed to clear local data: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
