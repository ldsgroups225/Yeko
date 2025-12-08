import type { ClassSessionStatus } from '@/schemas/curriculum-progress'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { classSessionStatusColors, classSessionStatusLabels } from '@/schemas/curriculum-progress'

interface SessionStatusBadgeProps {
  status: ClassSessionStatus
  className?: string
}

export function SessionStatusBadge({ status, className }: SessionStatusBadgeProps) {
  const colors = classSessionStatusColors[status]

  return (
    <Badge
      role="status"
      variant="secondary"
      className={cn(colors.bg, colors.text, 'hover:opacity-90', className)}
    >
      {classSessionStatusLabels[status]}
    </Badge>
  )
}
