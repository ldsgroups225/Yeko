'use client'

import { useSync } from '@/hooks'
import { SyncStatusCard } from './PublishButton'

/**
 * Container component that connects the SyncStatusCard to the useSync hook
 */
export function SyncStatusContainer() {
  const {
    isPublishing,
    publishProgress,
    lastSyncResult,
    pendingCount,
    isOnline,
    publishNotes,
    processSyncQueue,
  } = useSync()

  const handlePublish = async () => {
    try {
      await publishNotes()
    }
    catch (error) {
      console.error('Manual publish failed:', error)
    }
  }

  const handleRetry = async () => {
    try {
      await processSyncQueue()
    }
    catch (error) {
      console.error('Retry sync failed:', error)
    }
  }

  return (
    <SyncStatusCard
      pendingCount={pendingCount}
      isOnline={isOnline}
      isPublishing={isPublishing}
      publishProgress={publishProgress}
      lastSyncResult={lastSyncResult}
      onPublish={handlePublish}
      onRetry={handleRetry}
    />
  )
}
