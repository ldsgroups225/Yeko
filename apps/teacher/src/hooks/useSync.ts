'use client'

import type { PublishOptions, SyncResult } from '../lib/services/sync-service'
import { useCallback, useState } from 'react'
import { syncService } from '../lib/services/sync-service'
import { useSyncStatus } from './useDatabaseStatus'

// ============================================================================
// Types
// ============================================================================

export interface UseSyncReturn {
  isPublishing: boolean
  publishProgress: { current: number, total: number } | null
  lastSyncResult: SyncResult | null
  error: string | null
  pendingCount: number
  isOnline: boolean
  publishNotes: (options?: PublishOptions) => Promise<SyncResult>
  processSyncQueue: () => Promise<SyncResult>
  clearError: () => void
}

// ============================================================================
// useSync Hook
// ============================================================================

/**
 * Hook for managing note synchronization with remote database
 */
export function useSync(): UseSyncReturn {
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishProgress, setPublishProgress] = useState<{
    current: number
    total: number
  } | null>(null)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const syncStatus = useSyncStatus()

  // Publish notes
  const publishNotes = useCallback(
    async (options: PublishOptions = {}): Promise<SyncResult> => {
      if (!syncStatus.isOnline) {
        const offlineResult: SyncResult = {
          success: false,
          syncedNotes: [],
          failedNotes: [],
          errors: [{ noteId: '', error: 'Vous êtes hors ligne' }],
        }
        setLastSyncResult(offlineResult)
        setError('Vous êtes hors ligne. Veuillez réessayer une fois connecté.')
        return offlineResult
      }

      setIsPublishing(true)
      setError(null)
      setPublishProgress({ current: 0, total: 0 })

      try {
        const result = await syncService.publishNotes({
          ...options,
          onProgress: (current, total) => {
            setPublishProgress({ current, total })
          },
        })

        setLastSyncResult(result)

        if (!result.success) {
          setError(
            `Échec de la publication de ${result.failedNotes.length} note(s)`,
          )
        }

        return result
      }
      catch (err) {
        const errorMessage
          = err instanceof Error ? err.message : 'Échec de la publication'
        setError(errorMessage)
        const failedResult: SyncResult = {
          success: false,
          syncedNotes: [],
          failedNotes: [],
          errors: [{ noteId: '', error: errorMessage }],
        }
        setLastSyncResult(failedResult)
        return failedResult
      }
      finally {
        setIsPublishing(false)
        setPublishProgress(null)
      }
    },
    [syncStatus.isOnline],
  )

  // Process sync queue
  const processSyncQueue = useCallback(async (): Promise<SyncResult> => {
    if (!syncStatus.isOnline) {
      const offlineResult: SyncResult = {
        success: false,
        syncedNotes: [],
        failedNotes: [],
        errors: [{ noteId: '', error: 'Vous êtes hors ligne' }],
      }
      return offlineResult
    }

    setIsPublishing(true)
    setError(null)

    try {
      const result = await syncService.processSyncQueue()
      setLastSyncResult(result)

      if (!result.success) {
        setError(`Échec de la synchronisation de ${result.failedNotes.length} élément(s)`)
      }

      return result
    }
    catch (err) {
      const errorMessage
        = err instanceof Error ? err.message : 'Échec de la synchronisation'
      setError(errorMessage)
      const failedResult: SyncResult = {
        success: false,
        syncedNotes: [],
        failedNotes: [],
        errors: [{ noteId: '', error: errorMessage }],
      }
      return failedResult
    }
    finally {
      setIsPublishing(false)
    }
  }, [syncStatus.isOnline])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isPublishing,
    publishProgress,
    lastSyncResult,
    error,
    pendingCount: syncStatus.pendingItems,
    isOnline: syncStatus.isOnline,
    publishNotes,
    processSyncQueue,
    clearError,
  }
}

// ============================================================================
// useAutoSync Hook
// ============================================================================

export interface UseAutoSyncOptions {
  enabled?: boolean
  interval?: number // in milliseconds
}

/**
 * Hook for automatic background synchronization
 */
export function useAutoSync(options: UseAutoSyncOptions = {}): {
  isEnabled: boolean
  lastSyncResult: SyncResult | null
  toggleAutoSync: () => void
} {
  const { enabled = false } = options
  const [isEnabled, setIsEnabled] = useState(enabled)
  const [lastSyncResult] = useState<SyncResult | null>(null)

  // Note: syncStatus would be used for implementing auto-sync with intervals
  // const _syncStatus = useSyncStatus()

  // Note: In a production app, you would set up an interval effect here
  // For now, we'll just provide manual control

  const toggleAutoSync = useCallback(() => {
    setIsEnabled(prev => !prev)
  }, [])

  return {
    isEnabled,
    lastSyncResult,
    toggleAutoSync,
  }
}
