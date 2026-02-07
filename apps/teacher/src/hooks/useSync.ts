'use client'

import type { PublishOptions, SyncResult } from '../lib/services/sync-service'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { teacherMutationKeys } from '@/lib/queries/keys'
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
  const [publishProgress, setPublishProgress] = useState<{
    current: number
    total: number
  } | null>(null)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const syncStatus = useSyncStatus()

  // Publish notes mutation
  const publishMutation = useMutation({
    mutationKey: teacherMutationKeys.localNotes.publishAll,
    mutationFn: async (options: PublishOptions = {}) => {
      if (!syncStatus.isOnline) {
        throw new Error('Vous êtes hors ligne. Veuillez réessayer une fois connecté.')
      }
      setPublishProgress({ current: 0, total: 0 })
      return syncService.publishNotes({
        ...options,
        onProgress: (current, total) => {
          setPublishProgress({ current, total })
        },
      })
    },
    onSuccess: (result) => {
      setLastSyncResult(result)
      if (!result.success) {
        setError(`Échec de la publication de ${result.failedNotes.length} note(s)`)
      }
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Échec de la publication'
      setError(errorMessage)
      setLastSyncResult({
        success: false,
        syncedNotes: [],
        failedNotes: [],
        errors: [{ noteId: '', error: errorMessage }],
      })
    },
    onSettled: () => {
      setPublishProgress(null)
    },
  })

  // Sync queue mutation
  const syncQueueMutation = useMutation({
    mutationKey: teacherMutationKeys.localNotes.publish, // Generic publish key or add sync-queue
    mutationFn: async () => {
      if (!syncStatus.isOnline) {
        throw new Error('Vous êtes hors ligne')
      }
      return syncService.processSyncQueue()
    },
    onSuccess: (result) => {
      setLastSyncResult(result)
      if (!result.success) {
        setError(`Échec de la synchronisation de ${result.failedNotes.length} élément(s)`)
      }
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Échec de la synchronisation'
      setError(errorMessage)
      setLastSyncResult({
        success: false,
        syncedNotes: [],
        failedNotes: [],
        errors: [{ noteId: '', error: errorMessage }],
      })
    },
  })

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isPublishing: publishMutation.isPending || syncQueueMutation.isPending,
    publishProgress,
    lastSyncResult,
    error,
    pendingCount: syncStatus.pendingItems,
    isOnline: syncStatus.isOnline,
    publishNotes: options => publishMutation.mutateAsync(options ?? {}),
    processSyncQueue: () => syncQueueMutation.mutateAsync(),
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
  const { enabled = false, interval = 5 * 60 * 1000 } = options // Default 5 mins
  const [isEnabled, setIsEnabled] = useState(enabled)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)

  const { processSyncQueue, isOnline } = useSync()

  // Interval-based sync
  useEffect(() => {
    if (!isEnabled || !isOnline)
      return

    const timer = setInterval(async () => {
      const result = await processSyncQueue()
      setLastSyncResult(result)
    }, interval)

    return () => clearInterval(timer)
  }, [isEnabled, isOnline, interval, processSyncQueue])

  // Online-triggered sync
  useEffect(() => {
    if (!isEnabled)
      return

    const handleOnline = async () => {
      const result = await processSyncQueue()
      setLastSyncResult(result)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      return () => window.removeEventListener('online', handleOnline)
    }
  }, [isEnabled, processSyncQueue])

  const toggleAutoSync = useCallback(() => {
    setIsEnabled(prev => !prev)
  }, [])

  return {
    isEnabled,
    lastSyncResult,
    toggleAutoSync,
  }
}
