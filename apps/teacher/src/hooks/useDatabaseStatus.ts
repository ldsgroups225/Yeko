'use client'

import type { DatabaseStats, DatabaseStatus } from '../lib/db/client-db'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import {
  clientDatabaseManager,
} from '../lib/db/client-db'
import { localNotesService } from '../lib/db/local-notes'

// ============================================================================
// Database Status Hook
// ============================================================================

/**
 * Hook to subscribe to database initialization status
 */
export function useDatabaseStatus(): DatabaseStatus {
  const subscribe = useCallback((callback: () => void) => {
    return clientDatabaseManager.onStatusChange(callback)
  }, [])

  const getSnapshot = useCallback(() => {
    return clientDatabaseManager.getStatus()
  }, [])

  const getServerSnapshot = useCallback((): DatabaseStatus => {
    return {
      isInitialized: false,
      isInitializing: false,
      error: 'Server environment',
      lastInitialized: null,
    }
  }, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/**
 * Hook to get database stats including storage info
 */
export function useDatabaseStats(): {
  stats: DatabaseStats | null
  isLoading: boolean
  refresh: () => Promise<void>
} {
  const { data: stats, isPending, refetch } = useQuery({
    queryKey: ['database', 'stats'],
    queryFn: () => clientDatabaseManager.getStats(),
  })

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return { stats: stats ?? null, isLoading: isPending, refresh }
}

// ============================================================================
// Sync Status Hook
// ============================================================================

export interface SyncStatus {
  pendingItems: number
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: Date | null
  hasLocalChanges: boolean
}

/**
 * Hook to monitor sync status and pending items
 */
export function useSyncStatus(): SyncStatus {
  const { data: pendingItems } = useQuery({
    queryKey: ['sync', 'pending-items'],
    queryFn: () => localNotesService.getPendingSyncCount(),
    refetchInterval: 5000,
  })

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )
  const [isSyncing] = useState(false)
  const [lastSyncTime] = useState<Date | null>(null)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    pendingItems: pendingItems ?? 0,
    isOnline,
    isSyncing,
    lastSyncTime,
    hasLocalChanges: (pendingItems ?? 0) > 0,
  }
}

// ============================================================================
// Database Ready Hook
// ============================================================================

/**
 * Hook to wait for database to be ready
 */
export function useDatabaseReady(): {
  isReady: boolean
  isLoading: boolean
  error: string | null
  retry: () => Promise<void>
} {
  const status = useDatabaseStatus()
  const [isRetrying, setIsRetrying] = useState(false)

  const retry = useCallback(async () => {
    setIsRetrying(true)
    try {
      await clientDatabaseManager.initialize()
    }
    catch (error) {
      console.error('Database initialization failed:', error)
    }
    finally {
      setIsRetrying(false)
    }
  }, [])

  return {
    isReady: status.isInitialized,
    isLoading: status.isInitializing || isRetrying,
    error: status.error,
    retry,
  }
}

// ============================================================================
// Database Reset Hook
// ============================================================================

/**
 * Hook to reset the local database
 */
export function useDatabaseReset(): {
  reset: () => Promise<void>
  isResetting: boolean
  error: string | null
} {
  const [isResetting, setIsResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(async () => {
    setIsResetting(true)
    setError(null)
    try {
      await clientDatabaseManager.reset()
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)
      throw err
    }
    finally {
      setIsResetting(false)
    }
  }, [])

  return { reset, isResetting, error }
}
