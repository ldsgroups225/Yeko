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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        className="flex flex-col items-center justify-center py-20 text-center space-y-4"
      >
        <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
          <IconBook className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">{t.academic.subjects.picker.noAvailable()}</p>
          <p className="text-xs text-muted-foreground max-w-[280px]">
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
                  'h-4 w-4 rounded border-border/20 data-[state=checked]:bg-primary',
                  someSelected && !allSelected && 'data-[state=unchecked]:bg-primary/40',
                )}
                onCheckedChange={() => selectAllInCategory(category)}
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                {category}
                {' '}
                <span className="ml-1 opacity-50">
                  (
                  {categorySubjects.length}
                  )
                </span>
              </Label>
              <div className="h-px flex-1 bg-border/20" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categorySubjects.map((subject, idx) => {
                const isSelected = selectedIds.has(subject.id)
                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (catIdx * 0.1) + (idx * 0.05) }}
                    className={cn(
                      'group relative flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer overflow-hidden',
                      isSelected
                        ? 'border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]'
                        : 'border-border/40 bg-white/5 hover:border-primary/30 hover:bg-white/10',
                    )}
                    onClick={() => toggleSubject(subject.id)}
                  >
                    <div className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                      isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-muted-foreground',
                    )}
                    >
                      {isSelected ? <IconCheck className="h-5 w-5" /> : <IconBook className="h-5 w-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={cn('font-bold text-sm truncate', isSelected ? 'text-primary' : 'text-foreground')}>
                        {subject.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
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
