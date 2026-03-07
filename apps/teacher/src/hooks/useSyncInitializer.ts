'use client'

import { useEffect } from 'react'
import { clientDatabaseManager } from '../lib/db/client-db'
import { localNotesService } from '../lib/db/local-notes'
import { remotePublishHandler } from '../lib/services/remote-publish'
import { syncService } from '../lib/services/sync-service'

/**
 * Initializes global services for the teacher app
 * - Sets up the remote publish handler for the sync service
 * - Processes pending queue items in background
 * - Periodically cleans up the sync queue
 */
export function useSyncInitializer() {
  useEffect(() => {
    const AUTO_SYNC_INTERVAL_MS = 30_000
    const FRESH_RESET_DONE_KEY = 'yeko-teacher-fresh-local-db-done'
    const shouldResetLocalDbOnStart
      = import.meta.env.DEV
        && import.meta.env.VITE_RESET_LOCAL_DB_ON_START === '1'
        && typeof window !== 'undefined'
        && window.sessionStorage.getItem(FRESH_RESET_DONE_KEY) !== '1'

    const processPendingSyncItems = async () => {
      if (!clientDatabaseManager.isReady() || syncService.isSyncInProgress()) {
        return
      }

      if (typeof window !== 'undefined' && !window.navigator.onLine) {
        return
      }

      syncService.setRemotePublishHandler(remotePublishHandler)

      try {
        const pendingCount = await localNotesService.getPendingSyncCount()
        if (pendingCount === 0) {
          return
        }

        await syncService.processSyncQueue()
      }
      catch (err) {
        console.error('Failed to process pending sync queue:', err)
      }
    }

    const initializeLocalDatabase = async () => {
      try {
        if (shouldResetLocalDbOnStart) {
          console.warn('🧹 Resetting local PGlite database before startup (fresh mode)')
          await clientDatabaseManager.reset()
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(FRESH_RESET_DONE_KEY, '1')
          }
        }
        else {
          await clientDatabaseManager.initialize()
        }
      }
      catch (err) {
        console.error('Failed to initialize local database:', err)
      }
    }

    // 1. Initialize PGlite database
    void initializeLocalDatabase()

    // 2. Set the remote publish handler
    syncService.setRemotePublishHandler(remotePublishHandler)

    // 3. Process pending queue items in the background
    const autoSyncInterval = setInterval(() => {
      void processPendingSyncItems()
    }, AUTO_SYNC_INTERVAL_MS)

    const handleOnline = () => {
      void processPendingSyncItems()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
    }

    // 4. Periodic cleanup of completed sync items (every 12 hours)
    const cleanupInterval = setInterval(() => {
      syncService.cleanupSyncQueue().catch((err) => {
        console.error('Failed to cleanup sync queue:', err)
      })
    }, 12 * 60 * 60 * 1000)

    void processPendingSyncItems()

    return () => {
      clearInterval(autoSyncInterval)
      clearInterval(cleanupInterval)
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
      }
    }
  }, [])
}
