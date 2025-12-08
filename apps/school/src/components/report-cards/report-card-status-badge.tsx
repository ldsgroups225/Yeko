import type { ReportCardStatus } from '@/schemas/report-card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { reportCardStatusLabels } from '@/schemas/report-card'

interface ReportCardStatusBadgeProps {
  status: ReportCardStatus
  className?: string
}

const statusVariants: Record<ReportCardStatus, string> = {
  draft: 'bg-muted text-muted-foreground hover:bg-muted',
  generated: 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  sent: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
  delivered: 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  viewed: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
}

export function ReportCardStatusBadge({ status, className }: ReportCardStatusBadgeProps) {
  return (
    <Badge
      role="status"
      variant="secondary"
      className={cn(statusVariants[status], className)}
    >
      {reportCardStatusLabels[status]}
    </Badge>
  )
}
