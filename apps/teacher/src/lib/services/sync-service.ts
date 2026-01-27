import type { NoteWithDetails } from '../db/local-notes'
import type { SyncQueueItem } from '../db/schema'
import { localNotesService } from '../db/local-notes'

// ============================================================================
// Types
// ============================================================================

export interface SyncResult {
  success: boolean
  syncedNotes: string[]
  failedNotes: string[]
  errors: Array<{ noteId: string, error: string }>
}

export interface PublishOptions {
  noteIds?: string[]
  clearAfterPublish?: boolean
  onProgress?: (progress: number, total: number) => void
}

export type RemotePublishHandler = (
  note: NoteWithDetails,
) => Promise<{ success: boolean, remoteId?: string, error?: string }>

// ============================================================================
// Sync Service
// ============================================================================

class SyncService {
  private remotePublishHandler: RemotePublishHandler | null = null
  private isSyncing = false

  // --------------------------------------------------------------------------
  // Configuration
  // --------------------------------------------------------------------------

  /**
   * Register a handler for publishing notes to the remote database
   * This should be called during app initialization with the actual API call
   */
  setRemotePublishHandler(handler: RemotePublishHandler): void {
    this.remotePublishHandler = handler
  }

  // --------------------------------------------------------------------------
  // Sync Operations
  // --------------------------------------------------------------------------

  /**
   * Check if sync is currently in progress
   */
  isSyncInProgress(): boolean {
    return this.isSyncing
  }

  /**
   * Publish notes to remote database
   */
  async publishNotes(options: PublishOptions = {}): Promise<SyncResult> {
    const { noteIds, clearAfterPublish = true, onProgress } = options

    if (this.isSyncing) {
      throw new Error('Sync already in progress')
    }

    if (!this.remotePublishHandler) {
      throw new Error(
        'Remote publish handler not configured. Call setRemotePublishHandler first.',
      )
    }

    this.isSyncing = true

    const result: SyncResult = {
      success: true,
      syncedNotes: [],
      failedNotes: [],
      errors: [],
    }

    try {
      // Get notes to publish
      let notesToPublish: NoteWithDetails[]

      if (noteIds && noteIds.length > 0) {
        // Publish specific notes
        const allUnpublished = await localNotesService.getUnpublishedNotes()
        notesToPublish = allUnpublished.filter(note =>
          noteIds.includes(note.id),
        )
      }
      else {
        // Publish all unpublished notes
        notesToPublish = await localNotesService.getUnpublishedNotes()
      }

      if (notesToPublish.length === 0) {
        return result
      }

      const total = notesToPublish.length

      // Publish each note
      for (let i = 0; i < notesToPublish.length; i++) {
        const note = notesToPublish[i]
        if (!note)
          continue

        try {
          onProgress?.(i + 1, total)

          const publishResult = await this.remotePublishHandler(note)

          if (publishResult.success) {
            result.syncedNotes.push(note.id)
            await localNotesService.updateNoteSyncTimestamp(note.id)
          }
          else {
            result.failedNotes.push(note.id)
            result.errors.push({
              noteId: note.id,
              error: publishResult.error || 'Unknown error',
            })
          }
        }
        catch (err) {
          const errorMessage
            = err instanceof Error ? err.message : String(err)
          result.failedNotes.push(note.id)
          result.errors.push({ noteId: note.id, error: errorMessage })
        }
      }

      // Clear local data after successful publish if requested
      if (clearAfterPublish && result.syncedNotes.length > 0) {
        await localNotesService.clearLocalDataAfterPublish(result.syncedNotes)
      }

      result.success = result.failedNotes.length === 0
    }
    finally {
      this.isSyncing = false
    }

    return result
  }

  /**
   * Process pending sync queue items
   */
  async processSyncQueue(): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress')
    }

    this.isSyncing = true

    const result: SyncResult = {
      success: true,
      syncedNotes: [],
      failedNotes: [],
      errors: [],
    }

    try {
      const pendingItems = await localNotesService.getPendingSyncItems()

      for (const item of pendingItems) {
        try {
          // Process based on operation type
          const success = await this.processSyncItem(item)

          if (success) {
            await localNotesService.markSyncItemCompleted(item.id)
            result.syncedNotes.push(item.recordId)
          }
          else {
            await localNotesService.markSyncItemFailed(
              item.id,
              'Processing failed',
            )
            result.failedNotes.push(item.recordId)
          }
        }
        catch (err) {
          const errorMessage
            = err instanceof Error ? err.message : String(err)
          await localNotesService.markSyncItemFailed(item.id, errorMessage)
          result.failedNotes.push(item.recordId)
          result.errors.push({ noteId: item.recordId, error: errorMessage })
        }
      }

      result.success = result.failedNotes.length === 0
    }
    finally {
      this.isSyncing = false
    }

    return result
  }

  /**
   * Process a single sync queue item
   */
  private async processSyncItem(item: SyncQueueItem): Promise<boolean> {
    if (!this.remotePublishHandler) {
      throw new Error('Remote publish handler not configured')
    }

    try {
      // HANDLE NOTES TABLE
      if (item.tableName === 'notes') {
        if (item.operation === 'create' || item.operation === 'update') {
          const note = await localNotesService.getNoteById(item.recordId)
          if (note) {
            const publishResult = await this.remotePublishHandler(note)
            return publishResult.success
          }
          // If record not found, it might have been deleted locally, consider it "synced"
          return true
        }

        if (item.operation === 'delete') {
          // For now, if we delete a note locally, we might want to delete it remotely
          // However, many remote APIs use soft deletes or manual cleanup.
          // In our case, we'll just consider it done if no specific delete handler is set.
          return true
        }
      }

      // HANDLE NOTE DETAILS TABLE (individual grades)
      if (item.tableName === 'note_details') {
        // In most cases, updating a single grade can be done via the note's publish handler
        // which publishes the whole batch. But if we want granular sync:
        if (item.operation === 'create' || item.operation === 'update') {
          // We could find the parent note and publish it
          const data = item.data ? JSON.parse(item.data) : null
          if (data && data.noteId) {
            const note = await localNotesService.getNoteById(data.noteId)
            if (note) {
              const publishResult = await this.remotePublishHandler(note)
              return publishResult.success
            }
          }
        }
        return true
      }

      return true
    }
    catch (error) {
      console.error('Error processing sync item:', error)
      return false
    }
  }

  // --------------------------------------------------------------------------
  // Cleanup Operations
  // --------------------------------------------------------------------------

  /**
   * Clear old completed sync items
   */
  async cleanupSyncQueue(): Promise<void> {
    await localNotesService.clearOldSyncItems(24) // Clear items older than 24 hours
  }

  /**
   * Get pending sync count
   */
  async getPendingSyncCount(): Promise<number> {
    return localNotesService.getPendingSyncCount()
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const syncService = new SyncService()
