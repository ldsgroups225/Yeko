import type { ProgressStatus } from '@/schemas/curriculum-progress'

import { Badge } from '@workspace/ui/components/badge'
import { cn } from '@/lib/utils'
import { progressStatusColors, progressStatusLabels } from '@/schemas/curriculum-progress'

interface ProgressStatusBadgeProps {
  status: ProgressStatus
  className?: string
}

export function ProgressStatusBadge({ status, className }: ProgressStatusBadgeProps) {
  const colors = progressStatusColors[status]

  return (
    <Badge
      role="status"
      variant="secondary"
      className={cn(colors.bg, colors.text, 'hover:opacity-90', className)}
    >
      {progressStatusLabels[status]}
    </Badge>
  )
}
