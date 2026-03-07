import {
  IconAlertTriangle,
  IconCloudUpload,
  IconLoader2,
} from '@tabler/icons-react'
import { useMutationState } from '@tanstack/react-query'
import { cn } from '@workspace/ui/lib/utils'
import { useSyncStatus } from '@/hooks/useDatabaseStatus'
import { useI18nContext } from '@/i18n/i18n-react'
import { teacherMutationKeys } from '@/lib/queries/keys'

export function ClassDetailSyncBadge() {
  const { LL } = useI18nContext()
  const { pendingItems, failedItems, isSyncing } = useSyncStatus()
  const publishAllErrors = useMutationState({
    filters: {
      mutationKey: teacherMutationKeys.localNotes.publishAll,
      status: 'error',
    },
  })
  const queueSyncErrors = useMutationState({
    filters: {
      mutationKey: teacherMutationKeys.localNotes.publish,
      status: 'error',
    },
  })

  const hasPending = pendingItems > 0
  const hasRecentMutationError = publishAllErrors.length > 0 || queueSyncErrors.length > 0
  const hasError = failedItems > 0 || (hasPending && hasRecentMutationError)

  if (!hasPending && !hasError) {
    return null
  }

  const icon = hasError
    ? IconAlertTriangle
    : isSyncing
      ? IconLoader2
      : IconCloudUpload

  const label = hasError
    ? LL.sync.error()
    : isSyncing
      ? LL.sync.publishing()
      : LL.sync.pending({ count: pendingItems })

  const Icon = icon

  return (
    <div
      role="status"
      aria-live="polite"
      title={label}
      className={cn(
        'relative inline-flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-all',
        hasError ? 'bg-destructive text-destructive-foreground' : 'bg-accent text-accent-foreground',
        isSyncing && !hasError ? 'animate-pulse' : '',
      )}
    >
      <Icon className={cn('h-4 w-4', isSyncing && !hasError ? 'animate-spin' : '')} />
      {hasPending && (
        <span className="
          bg-background text-foreground absolute -top-1.5 -right-1.5 min-w-4 rounded-full
          px-1 text-center text-[10px] font-black leading-4
        "
        >
          {pendingItems > 9 ? '9+' : pendingItems}
        </span>
      )}
      <span className="sr-only">{label}</span>
    </div>
  )
}
