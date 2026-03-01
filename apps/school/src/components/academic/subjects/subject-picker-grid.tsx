import type { CoreSubject } from './subject-picker-context'
import { IconBook, IconCheck } from '@tabler/icons-react'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Label } from '@workspace/ui/components/label'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { useSubjectPicker } from './subject-picker-context'

export function SubjectPickerGrid() {
  const t = useTranslations()
  const { state, actions } = useSubjectPicker()
  const { subjects, isPending, selectedIds } = state
  const { toggleSubject, selectAllInCategory } = actions

  if (isPending) {
    return (
      <div className="space-y-8 py-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <div className="
              grid grid-cols-1 gap-3
              sm:grid-cols-2
            "
            >
              {[1, 2, 3, 4].map(j => (
                <Skeleton key={j} className="h-16 w-full rounded-xl bg-white/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (subjects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="
          flex flex-col items-center justify-center space-y-4 py-20 text-center
        "
      >
        <div className="
          flex h-16 w-16 items-center justify-center rounded-full bg-white/5
        "
        >
          <IconBook className="text-muted-foreground/30 h-8 w-8" />
        </div>
        <div className="space-y-1">
          <p className="text-foreground font-semibold">{t.academic.subjects.picker.noAvailable()}</p>
          <p className="text-muted-foreground max-w-[280px] text-xs">
            {t.academic.subjects.picker.noAvailableDescription()}
          </p>
        </div>
      </motion.div>
    )
  }

  const groupedSubjects: Record<string, CoreSubject[]> = {}
  for (const subject of subjects) {
    const category = subject.category
    if (!groupedSubjects[category]) {
      groupedSubjects[category] = []
    }
    groupedSubjects[category].push(subject)
  }

  return (
    <div className="space-y-10 pb-6">
      {Object.entries(groupedSubjects).map(([category, categorySubjects], catIdx) => {
        const allSelected = categorySubjects.every(s => selectedIds.has(s.id))
        const someSelected = categorySubjects.some(s => selectedIds.has(s.id))

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id={`category-${category}`}
                checked={allSelected}
                className={cn(
                  `
                    border-border/20
                    data-[state=checked]:bg-primary
                    h-4 w-4 rounded-sm
                  `,
                  someSelected && !allSelected && `
                    data-[state=unchecked]:bg-primary/40
                  `,
                )}
                onCheckedChange={() => selectAllInCategory(category)}
              />
              <Label
                htmlFor={`category-${category}`}
                className="
                  text-muted-foreground
                  hover:text-foreground
                  cursor-pointer text-[10px] font-bold tracking-[0.2em]
                  uppercase transition-colors
                "
              >
                {category}
                {' '}
                <span className="ml-1 opacity-50">
                  (
                  {categorySubjects.length}
                  )
                </span>
              </Label>
              <div className="bg-border/20 h-px flex-1" />
            </div>

            <div className="
              grid grid-cols-1 gap-3
              sm:grid-cols-2
            "
            >
              {categorySubjects.map((subject, idx) => {
                const isSelected = selectedIds.has(subject.id)
                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (catIdx * 0.1) + (idx * 0.05) }}
                    className={cn(
                      `
                        group relative flex cursor-pointer items-center gap-4
                        overflow-hidden rounded-xl border p-4 transition-all
                      `,
                      isSelected
                        ? `
                          border-primary/50 bg-primary/10
                          shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]
                        `
                        : `
                          border-border/40
                          hover:border-primary/30
                          bg-white/5
                          hover:bg-white/10
                        `,
                    )}
                    onClick={() => toggleSubject(subject.id)}
                  >
                    <div className={cn(
                      `
                        flex h-10 w-10 shrink-0 items-center justify-center
                        rounded-lg transition-colors
                      `,
                      isSelected
                        ? `bg-primary shadow-primary/20 text-white shadow-lg`
                        : `text-muted-foreground bg-white/5`,
                    )}
                    >
                      {isSelected
                        ? <IconCheck className="h-5 w-5" />
                        : (
                            <IconBook className="h-5 w-5" />
                          )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={cn('truncate text-sm font-bold', isSelected
                        ? `text-primary`
                        : `text-foreground`)}
                      >
                        {subject.name}
                      </p>
                      <p className="
                        text-muted-foreground text-[10px] font-semibold
                        tracking-wider uppercase
                      "
                      >
                        {subject.shortName}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
