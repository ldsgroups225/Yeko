import type { SyncResult } from '../../lib/services/sync-service'
import {
  IconRefresh,
  IconWifi,
  IconWifiOff,
} from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Progress } from '@workspace/ui/components/progress'
import { useI18nContext } from '@/i18n/i18n-react'
import { PublishButton, PublishResult, SyncStatusBadge } from './PublishButton'

// ============================================================================
// Types
// ============================================================================

export interface SyncStatusCardProps {
  pendingCount: number
  isOnline: boolean
  isPublishing: boolean
  publishProgress: { current: number, total: number } | null
  lastSyncResult: SyncResult | null
  onPublish: () => void
  onRetry?: () => void
  disabled?: boolean
}

// ============================================================================
// SyncStatusCard Component
// ============================================================================

export function SyncStatusCard({
  pendingCount,
  isOnline,
  isPublishing,
  publishProgress,
  lastSyncResult,
  onPublish,
  onRetry,
  disabled = false,
}: SyncStatusCardProps) {
  const { LL } = useI18nContext()
  const hasErrors = lastSyncResult && lastSyncResult.failedNotes.length > 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            {LL.sync.title()}
          </CardTitle>
          <SyncStatusBadge
            pendingCount={pendingCount}
            isOnline={isOnline}
            isPublishing={isPublishing}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Online Status */}
        <div className="flex items-center gap-2 text-sm">
          {isOnline
            ? (
                <>
                  <IconWifi className="text-success h-4 w-4" />
                  <span className="text-muted-foreground">{LL.sync.online()}</span>
                </>
              )
            : (
                <>
                  <IconWifiOff className="text-destructive h-4 w-4" />
                  <span className="text-muted-foreground">{LL.sync.offline()}</span>
                </>
              )}
        </div>

        {/* Pending count */}
        {pendingCount > 0 && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              {LL.sync.pendingChanges({ count: pendingCount })}
            </p>
            {isPublishing && publishProgress && (
              <Progress value={(publishProgress.current / publishProgress.total) * 100} />
            )}
          </div>
        )}

        {/* Error state with retry */}
        {hasErrors && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-2"
          >
            <IconRefresh className="h-4 w-4" />
            {LL.common.retry()}
          </Button>
        )}

        {/* Publish button */}
        <PublishButton
          pendingCount={pendingCount}
          isOnline={isOnline}
          isPublishing={isPublishing}
          publishProgress={publishProgress}
          onPublish={onPublish}
          disabled={disabled}
        />

        {/* Last sync result */}
        <PublishResult result={lastSyncResult} />
      </CardContent>
    </Card>
  )
}
