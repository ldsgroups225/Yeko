import type { GradeStatus } from '@/schemas/grade'
import { Badge } from '@workspace/ui/components/badge'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { gradeStatusLabels } from '@/schemas/grade'

interface GradeStatusBadgeProps {
  status: GradeStatus
  className?: string
}

const statusVariants: Record<GradeStatus, { bg: string, text: string, dot: string, border: string }> = {
  draft: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    dot: 'bg-muted-foreground',
    border: 'border-muted',
  },
  submitted: {
    bg: 'bg-secondary/10',
    text: 'text-secondary',
    dot: 'bg-secondary',
    border: 'border-secondary/20',
  },
  validated: {
    bg: 'bg-success/10',
    text: 'text-success',
    dot: 'bg-success',
    border: 'border-success/20',
  },
  rejected: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    dot: 'bg-destructive',
    border: 'border-destructive/20',
  },
}

export function GradeStatusBadge({ status, className }: GradeStatusBadgeProps) {
  const variant = statusVariants[status]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-block"
    >
      <Badge
        role="status"
        variant="outline"
        className={cn(
          'rounded-full px-2.5 py-0.5 font-bold uppercase tracking-widest text-[10px] gap-1.5 transition-colors border shadow-sm',
          variant.bg,
          variant.text,
          variant.border,
          className,
        )}
      >
        <div className={cn('h-1.5 w-1.5 rounded-full ring-1 ring-white/20 animate-pulse', variant.dot)} />
        {gradeStatusLabels[status]}
      </Badge>
    </motion.div>
  )
}
