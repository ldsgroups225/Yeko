import type { ReportCardStatus } from '@/schemas/report-card'
import { Badge } from '@workspace/ui/components/badge'
import { cn } from '@/lib/utils'
import { reportCardStatusLabels } from '@/schemas/report-card'

interface ReportCardStatusBadgeProps {
  status: ReportCardStatus
  className?: string
}

const statusVariants: Record<ReportCardStatus, string> = {
  draft: 'bg-muted text-muted-foreground hover:bg-muted/80 border-muted',
  generated: 'bg-secondary/10 text-secondary hover:bg-secondary/20 border-secondary/20',
  sent: 'bg-accent/10 text-accent-foreground hover:bg-accent/20 border-accent/20',
  delivered: 'bg-success/10 text-success hover:bg-success/20 border-success/20',
  viewed: 'bg-success/10 text-success hover:bg-success/20 border-success/20',
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
