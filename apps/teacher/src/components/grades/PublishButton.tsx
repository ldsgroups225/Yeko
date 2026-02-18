import type { SyncResult } from '../../lib/services/sync-service'
import {
  IconAlertTriangle,
  IconCheck,
  IconCloudUpload,
  IconLoader2,
  IconWifiOff,
} from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { AnimatePresence, m as motion } from 'motion/react'
import { useMemo } from 'react'
import { useI18nContext } from '@/i18n/i18n-react'

// ============================================================================
// Types
// ============================================================================

export interface PublishButtonProps {
  pendingCount: number
  isOnline: boolean
  isPublishing: boolean
  publishProgress: { current: number, total: number } | null
  onPublish: () => void
  disabled?: boolean
}

export interface SyncStatusBadgeProps {
  pendingCount: number
  isOnline: boolean
  isPublishing: boolean
}

export interface PublishResultProps {
  result: SyncResult | null
  onDismiss?: () => void
}

// ============================================================================
// PublishButton Component
// ============================================================================

export function PublishButton({
  pendingCount,
  isOnline,
  isPublishing,
  publishProgress,
  onPublish,
  disabled = false,
}: PublishButtonProps) {
  const { LL } = useI18nContext()
  const progressPercentage = publishProgress
    ? (publishProgress.current / publishProgress.total) * 100
    : 0

  const canPublish = pendingCount > 0 && isOnline && !isPublishing && !disabled

  return (
    <Button
      onClick={onPublish}
      disabled={!canPublish}
      className="relative min-w-[160px]"
      size="lg"
    >
      <AnimatePresence mode="wait">
        {isPublishing
          ? (
              <motion.div
                key="publishing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <IconLoader2 className="h-4 w-4 animate-spin" />
                <span>
                  {LL.sync.publishingProgress({ current: publishProgress?.current ?? 0, total: publishProgress?.total ?? 0 })}
                </span>
              </motion.div>
            )
          : (
              <motion.div
                key="publish"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <IconCloudUpload className="h-4 w-4" />
                <span>
                  {LL.sync.publishCount({ count: pendingCount })}
                </span>
              </motion.div>
            )}
      </AnimatePresence>

      {/* Progress overlay */}
      {isPublishing && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-md"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ ease: 'easeOut' }}
        />
      )}
    </Button>
  )
}

// ============================================================================
// SyncStatusBadge Component
// ============================================================================

export function SyncStatusBadge({
  pendingCount,
  isOnline,
  isPublishing,
}: SyncStatusBadgeProps) {
  const { LL } = useI18nContext()
  const status = useMemo(() => {
    if (!isOnline) {
      return {
        icon: IconWifiOff,
        label: LL.sync.offline(),
        variant: 'destructive' as const,
      }
    }
    if (isPublishing) {
      return {
        icon: IconLoader2,
        label: LL.sync.publishing(),
        variant: 'default' as const,
        iconClass: 'animate-spin',
      }
    }
    if (pendingCount > 0) {
      return {
        icon: IconCloudUpload,
        label: LL.sync.pending({ count: pendingCount }),
        variant: 'secondary' as const,
      }
    }
    return {
      icon: IconCheck,
      label: LL.sync.synced(),
      variant: 'outline' as const,
    }
  }, [isOnline, isPublishing, pendingCount, LL.sync])

  const Icon = status.icon

  return (
    <Badge variant={status.variant} className="gap-1.5">
      <Icon className={`h-3.5 w-3.5 ${status.iconClass ?? ''}`} />
      {status.label}
    </Badge>
  )
}

// ============================================================================
// PublishResult Component
// ============================================================================

export function PublishResult({ result, onDismiss }: PublishResultProps) {
  const { LL } = useI18nContext()
  if (!result)
    return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-2"
      >
        <Card className={result.success ? 'border-success' : 'border-destructive'}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              {result.success
                ? (
                    <>
                      <IconCheck className="h-5 w-5 text-success" />
                      {LL.sync.success()}
                    </>
                  )
                : (
                    <>
                      <IconAlertTriangle className="h-5 w-5 text-destructive" />
                      {LL.sync.error()}
                    </>
                  )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {result.syncedNotes.length > 0 && (
              <p className="text-success dark:text-success/80">
                ✓
                {' '}
                {LL.sync.notesPublished({ count: result.syncedNotes.length })}
              </p>
            )}
            {result.failedNotes.length > 0 && (
              <p className="text-destructive dark:text-destructive/80">
                ✗
                {' '}
                {LL.sync.notesFailed({ count: result.failedNotes.length })}
              </p>
            )}
            {result.errors.length > 0 && (
              <div className="mt-2 space-y-1">
                {result.errors.slice(0, 3).map(error => (
                  <p key={error.noteId + crypto.randomUUID()} className="text-muted-foreground text-xs">
                    {error.error}
                  </p>
                ))}
                {result.errors.length > 3 && (
                  <p className="text-muted-foreground text-xs">
                    {LL.sync.moreErrors({ count: result.errors.length - 3 })}
                  </p>
                )}
              </div>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="mt-2"
              >
                {LL.common.close()}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
