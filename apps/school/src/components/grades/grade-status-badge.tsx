import type { GradeStatus } from '@/schemas/grade'
import { motion } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { gradeStatusLabels } from '@/schemas/grade'

interface GradeStatusBadgeProps {
  status: GradeStatus
  className?: string
}

const statusVariants: Record<GradeStatus, { bg: string, text: string, dot: string, border: string }> = {
  draft: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-400',
    border: 'border-slate-500/20',
  },
  submitted: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
    border: 'border-blue-500/20',
  },
  validated: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    border: 'border-emerald-500/20',
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
