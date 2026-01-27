'use client'

import { useEffect } from 'react'
import { clientDatabaseManager } from '../lib/db/client-db'
import { remotePublishHandler } from '../lib/services/remote-publish'
import { syncService } from '../lib/services/sync-service'

/**
 * Initializes global services for the teacher app
 * - Sets up the remote publish handler for the sync service
 * - Periodically cleans up the sync queue
 */
export function useSyncInitializer() {
  useEffect(() => {
    // 1. Initialize PGlite database
    clientDatabaseManager.initialize().catch((err) => {
      console.error('Failed to initialize local database:', err)
    })

    // 2. Set the remote publish handler
    syncService.setRemotePublishHandler(remotePublishHandler)

    // 3. Periodic cleanup of completed sync items (every 12 hours)
    const cleanupInterval = setInterval(() => {
      syncService.cleanupSyncQueue().catch((err) => {
        console.error('Failed to cleanup sync queue:', err)
      })
    }, 12 * 60 * 60 * 1000)

    return () => {
      clearInterval(cleanupInterval)
    }
  }, [])
}
