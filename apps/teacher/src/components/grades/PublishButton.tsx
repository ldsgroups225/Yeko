import type { SyncResult } from '../../lib/services/sync-service'
import {
  IconAlertTriangle,
  IconCheck,
  IconCloudUpload,
  IconLoader2,
  IconRefresh,
  IconWifi,
  IconWifiOff,
} from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Progress } from '@workspace/ui/components/progress'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo } from 'react'

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
                  Publication
                  {' '}
                  {publishProgress?.current}
                  /
                  {publishProgress?.total}
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
                  Publier (
                  {pendingCount}
                  )
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
  const status = useMemo(() => {
    if (!isOnline) {
      return {
        icon: IconWifiOff,
        label: 'Hors ligne',
        variant: 'destructive' as const,
      }
    }
    if (isPublishing) {
      return {
        icon: IconLoader2,
        label: 'Publication...',
        variant: 'default' as const,
        iconClass: 'animate-spin',
      }
    }
    if (pendingCount > 0) {
      return {
        icon: IconCloudUpload,
        label: `${pendingCount} en attente`,
        variant: 'secondary' as const,
      }
    }
    return {
      icon: IconCheck,
      label: 'Synchronisé',
      variant: 'outline' as const,
    }
  }, [isOnline, isPublishing, pendingCount])

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
        <Card className={result.success ? 'border-green-500' : 'border-red-500'}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              {result.success
                ? (
                    <>
                      <IconCheck className="h-5 w-5 text-green-500" />
                      Publication réussie
                    </>
                  )
                : (
                    <>
                      <IconAlertTriangle className="h-5 w-5 text-red-500" />
                      Erreurs lors de la publication
                    </>
                  )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {result.syncedNotes.length > 0 && (
              <p className="text-green-600 dark:text-green-400">
                ✓
                {' '}
                {result.syncedNotes.length}
                {' '}
                note(s) publiée(s)
              </p>
            )}
            {result.failedNotes.length > 0 && (
              <p className="text-red-600 dark:text-red-400">
                ✗
                {' '}
                {result.failedNotes.length}
                {' '}
                note(s) en échec
              </p>
            )}
            {result.errors.length > 0 && (
              <div className="mt-2 space-y-1">
                {result.errors.slice(0, 3).map((error, i) => (
                  <p key={i} className="text-muted-foreground text-xs">
                    {error.error}
                  </p>
                ))}
                {result.errors.length > 3 && (
                  <p className="text-muted-foreground text-xs">
                    ... et
                    {' '}
                    {result.errors.length - 3}
                    {' '}
                    autres erreurs
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
                Fermer
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================================
// SyncStatusCard Component
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
  const hasErrors = lastSyncResult && lastSyncResult.failedNotes.length > 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Synchronisation
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
                  <IconWifi className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Connecté</span>
                </>
              )
            : (
                <>
                  <IconWifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-muted-foreground">Hors ligne</span>
                </>
              )}
        </div>

        {/* Pending count */}
        {pendingCount > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {pendingCount}
              {' '}
              modification(s) en attente de publication
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
            Réessayer
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
