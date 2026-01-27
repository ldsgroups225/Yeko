'use client'

import type { DatabaseStats, DatabaseStatus } from '../lib/db/client-db'
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
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const newStats = await clientDatabaseManager.getStats()
      setStats(newStats)
    }
    catch (error) {
      console.error('Failed to get database stats:', error)
    }
    finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { stats, isLoading, refresh }
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
  const [pendingItems, setPendingItems] = useState(0)
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

  // Poll for pending sync items
  useEffect(() => {
    const checkPendingItems = async () => {
      try {
        const count = await localNotesService.getPendingSyncCount()
        setPendingItems(count)
      }
      catch {
        // Ignore errors during polling
      }
    }

    checkPendingItems()
    const interval = setInterval(checkPendingItems, 5000)

    return () => clearInterval(interval)
  }, [])

  return {
    pendingItems,
    isOnline,
    isSyncing,
    lastSyncTime,
    hasLocalChanges: pendingItems > 0,
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
