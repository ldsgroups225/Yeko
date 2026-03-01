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
  submitted: 'text-primary bg-primary/10 border-primary/20',
  validated: 'text-success bg-success/10 border-success/20',
  rejected: 'text-destructive bg-destructive/10 border-destructive/20',
  edited: 'text-warning bg-warning/10 border-warning/20',
}

export function GradeHistoryTimeline({ gradeId }: GradeHistoryTimelineProps) {
  const t = useTranslations()

  const { data: result, isPending } = useQuery(gradesOptions.history(gradeId))

  const history = result || []

  if (isPending) {
    return (
      <div className="relative space-y-6 pl-4">
        <div className="bg-border/20 absolute top-0 left-0 h-full w-px" />
        {[1, 2, 3].map(id => (
          <div key={id} className="relative flex gap-4">
            <Skeleton className="z-10 size-8 shrink-0 rounded-full" />
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
        className="
          text-muted-foreground bg-muted/20 border-border/40 flex flex-col
          items-center justify-center rounded-xl border border-dashed py-12
        "
      >
        <IconClock className="mb-2 size-8 opacity-20" />
        <p className="text-sm font-medium italic">{t.academic.grades.history.empty()}</p>
      </motion.div>
    )
  }

  return (
    <div className="relative space-y-6">
      {/* Timeline line */}
      <div className="
        from-primary/5 via-primary/20 to-primary/5 absolute top-2 bottom-2
        left-[15px] w-px bg-linear-to-b
      "
      />

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
              className="group relative flex gap-4"
            >
              {/* Icon Container */}
              <div
                className={cn(
                  `
                    relative z-10 flex size-8 shrink-0 items-center
                    justify-center rounded-xl border shadow-sm
                    transition-transform
                    group-hover:scale-110
                  `,
                  colorClass,
                )}
              >
                <Icon className="size-4" />
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5">
                <div className="
                  mb-1 flex flex-wrap items-center gap-x-3 gap-y-1
                "
                >
                  <span className="
                    text-foreground text-sm font-bold tracking-tight uppercase
                  "
                  >
                    {{
                      submitted: t.academic.grades.history.actions.submitted,
                      validated: t.academic.grades.history.actions.validated,
                      rejected: t.academic.grades.history.actions.rejected,
                      edited: t.academic.grades.history.actions.edited,
                    }[entry.action]()}
                  </span>
                  <span className="
                    text-muted-foreground/60 bg-muted/30 border-border/5
                    rounded-sm border px-2 py-0.5 text-[10px] font-bold
                    tracking-widest uppercase
                  "
                  >
                    {new Date(entry.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="mb-2 flex items-center gap-1.5">
                  <div className="
                    bg-muted flex size-4 items-center justify-center
                    rounded-full
                  "
                  >
                    <IconUser className="text-muted-foreground size-2.5" />
                  </div>
                  <p className="
                    text-muted-foreground text-xs font-semibold italic
                  "
                  >
                    {t.academic.grades.history.by({ name: entry.validator.name })}
                  </p>
                </div>

                {entry.action === 'edited' && entry.previousValue && entry.newValue && (
                  <div className="
                    bg-background/50 border-border/10 mt-2 inline-flex
                    items-center gap-2 rounded-lg border px-3 py-1.5 text-xs
                    shadow-inner
                  "
                  >
                    <span className="
                      text-muted-foreground decoration-destructive/30
                      line-through
                    "
                    >
                      {entry.previousValue}
                    </span>
                    <span className="text-primary/40 font-bold">→</span>
                    <span className="text-foreground font-bold">{entry.newValue}</span>
                  </div>
                )}

                {entry.comment && (
                  <div className="relative mt-3">
                    <div className="
                      bg-primary/20 absolute top-0 -left-2 h-full w-0.5
                      rounded-full
                    "
                    />
                    <div className="
                      bg-card/30 border-border/40 rounded-xl border p-3
                      shadow-sm backdrop-blur-sm
                    "
                    >
                      <div className="
                        text-muted-foreground flex gap-2 text-xs leading-relaxed
                        italic
                      "
                      >
                        <IconMessageCircle className="
                          mt-0.5 size-3 shrink-0 opacity-50
                        "
                        />
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
