import type { GradeStatus } from '@/schemas/grade'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { gradeStatusLabels } from '@/schemas/grade'

interface GradeStatusBadgeProps {
  status: GradeStatus
  className?: string
}

const statusVariants: Record<GradeStatus, string> = {
  draft: 'bg-muted text-muted-foreground hover:bg-muted',
  submitted: 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  validated: 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400',
}

export function GradeStatusBadge({ status, className }: GradeStatusBadgeProps) {
  return (
    <Badge
      role="status"
      variant="secondary"
      className={cn(statusVariants[status], className)}
    >
      {gradeStatusLabels[status]}
    </Badge>
  )
}
