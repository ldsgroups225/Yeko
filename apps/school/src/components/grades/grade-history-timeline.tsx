import { IconCircleCheck, IconCircleX, IconClock, IconEdit, IconMessageCircle, IconSend, IconUser } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { gradesOptions } from '@/lib/queries/grades'
import { cn } from '@/lib/utils'

interface GradeHistoryTimelineProps {
  gradeId: string
}

interface ValidationEntry {
  id: string
  action: 'submitted' | 'validated' | 'rejected' | 'edited'
  previousValue: string | null
  newValue: string | null
  comment: string | null
  createdAt: string | Date
  validator: {
    name: string
  }
}

const actionIcons = {
  submitted: IconSend,
  validated: IconCircleCheck,
  rejected: IconCircleX,
  edited: IconEdit,
}

const actionColors = {
  submitted: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
  validated: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
  rejected: 'text-destructive bg-destructive/10 border-destructive/20',
  edited: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
}

export function GradeHistoryTimeline({ gradeId }: GradeHistoryTimelineProps) {
  const t = useTranslations()

  const { data: history, isLoading } = useQuery(gradesOptions.history(gradeId))

  if (isLoading) {
    return (
      <div className="space-y-6 relative pl-4">
        <div className="absolute left-0 top-0 h-full w-px bg-border/20" />
        {[1, 2, 3].map(id => (
          <div key={id} className="relative flex gap-4">
            <Skeleton className="size-8 rounded-full z-10 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full max-w-sm" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/40"
      >
        <IconClock className="mb-2 size-8 opacity-20" />
        <p className="text-sm font-medium italic">{t.academic.grades.history.empty()}</p>
      </motion.div>
    )
  }

  return (
    <div className="relative space-y-6">
      {/* Timeline line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-linear-to-b from-primary/5 via-primary/20 to-primary/5" />

      <div className="space-y-8">
        {history.map((entry: ValidationEntry, index: number) => {
          const Icon = actionIcons[entry.action]
          const colorClass = actionColors[entry.action]

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-4 group"
            >
              {/* Icon Container */}
              <div
                className={cn(
                  'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-transform group-hover:scale-110',
                  colorClass,
                )}
              >
                <Icon className="size-4" />
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                  <span className="text-sm font-bold uppercase tracking-tight text-foreground">
                    {{
                      submitted: t.academic.grades.history.actions.submitted,
                      validated: t.academic.grades.history.actions.validated,
                      rejected: t.academic.grades.history.actions.rejected,
                      edited: t.academic.grades.history.actions.edited,
                    }[entry.action]()}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 bg-muted/30 px-2 py-0.5 rounded border border-border/5">
                    {new Date(entry.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mb-2">
                  <div className="size-4 rounded-full bg-muted flex items-center justify-center">
                    <IconUser className="size-2.5 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground italic">
                    {t.academic.grades.history.by({ name: entry.validator.name })}
                  </p>
                </div>

                {entry.action === 'edited' && entry.previousValue && entry.newValue && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/50 border border-border/10 text-xs shadow-inner">
                    <span className="text-muted-foreground line-through decoration-destructive/30">
                      {entry.previousValue}
                    </span>
                    <span className="text-primary/40 font-bold">→</span>
                    <span className="font-bold text-foreground">{entry.newValue}</span>
                  </div>
                )}

                {entry.comment && (
                  <div className="mt-3 relative">
                    <div className="absolute -left-2 top-0 h-full w-0.5 bg-primary/20 rounded-full" />
                    <div className="rounded-xl bg-card/30 backdrop-blur-sm border border-border/40 p-3 shadow-sm">
                      <div className="flex gap-2 text-xs italic text-muted-foreground leading-relaxed">
                        <IconMessageCircle className="size-3 shrink-0 mt-0.5 opacity-50" />
                        "
                        {entry.comment}
                        "
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
