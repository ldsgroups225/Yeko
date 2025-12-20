import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Clock, Edit3, Send, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@/components/ui/skeleton'
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
  createdAt: Date
  validator: {
    name: string
  }
}

const actionIcons = {
  submitted: Send,
  validated: CheckCircle2,
  rejected: XCircle,
  edited: Edit3,
}

const actionColors = {
  submitted: 'text-blue-500 bg-blue-50',
  validated: 'text-green-500 bg-green-50',
  rejected: 'text-red-500 bg-red-50',
  edited: 'text-amber-500 bg-amber-50',
}

export function GradeHistoryTimeline({ gradeId }: GradeHistoryTimelineProps) {
  const { t } = useTranslation()

  const { data: history, isLoading } = useQuery(gradesOptions.history(gradeId))

  if (isLoading) {
    return (
      <div className="space-y-4">
        {['skeleton-1', 'skeleton-2', 'skeleton-3'].map(id => (
          <div key={id} className="flex gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Clock className="mr-2 size-4" />
        {t('academic.grades.history.empty')}
      </div>
    )
  }

  return (
    <div className="relative space-y-4">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 h-full w-px bg-border" />

      {history.map((entry: ValidationEntry, index: number) => {
        const Icon = actionIcons[entry.action]
        const colorClass = actionColors[entry.action]
        const isLast = index === history.length - 1

        return (
          <div key={entry.id} className="relative flex gap-3 pl-1">
            {/* Icon */}
            <div
              className={cn(
                'relative z-10 flex size-8 items-center justify-center rounded-full',
                colorClass,
              )}
            >
              <Icon className="size-4" />
            </div>

            {/* Content */}
            <div className={cn('flex-1 pb-4', isLast && 'pb-0')}>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {t(`academic.grades.history.actions.${entry.action}`)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                {t('academic.grades.history.by', { name: entry.validator.name })}
              </p>

              {entry.action === 'edited' && entry.previousValue && entry.newValue && (
                <p className="mt-1 text-sm">
                  <span className="text-muted-foreground line-through">
                    {entry.previousValue}
                  </span>
                  {' → '}
                  <span className="font-medium">{entry.newValue}</span>
                </p>
              )}

              {entry.comment && (
                <p className="mt-1 rounded-md bg-muted p-2 text-sm italic">
                  "
                  {entry.comment}
                  "
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
