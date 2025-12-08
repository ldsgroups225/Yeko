import type { ProgressStatus } from '@/schemas/curriculum-progress'

import { AlertTriangle, TrendingDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BehindScheduleClass {
  classId: string
  className: string
  subjectName: string
  progressPercentage: number
  expectedPercentage: number
  variance: number
  status: ProgressStatus
}

interface BehindScheduleAlertProps {
  classes: BehindScheduleClass[]
  onViewDetails?: (classId: string) => void
  className?: string
}

export function BehindScheduleAlert({
  classes,
  onViewDetails,
  className,
}: BehindScheduleAlertProps) {
  const { t } = useTranslation()

  if (classes.length === 0) return null

  const significantlyBehind = classes.filter(c => c.status === 'significantly_behind')
  const slightlyBehind = classes.filter(c => c.status === 'slightly_behind')

  return (
    <Alert
      variant="destructive"
      className={cn(
        'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-100',
        significantlyBehind.length > 0 && 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100',
        className,
      )}
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <TrendingDown className="h-4 w-4" />
        {t('curriculum.behindScheduleAlert', { count: classes.length })}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          {significantlyBehind.length > 0 && (
            <div>
              <p className="font-medium text-sm mb-1">
                {t('curriculum.significantlyBehind')} ({significantlyBehind.length})
              </p>
              <ul className="text-sm space-y-1">
                {significantlyBehind.slice(0, 3).map(c => (
                  <li key={`${c.classId}-${c.subjectName}`} className="flex items-center justify-between">
                    <span>{c.className} - {c.subjectName}</span>
                    <span className="font-medium">{c.variance.toFixed(0)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {slightlyBehind.length > 0 && (
            <div>
              <p className="font-medium text-sm mb-1">
                {t('curriculum.slightlyBehind')} ({slightlyBehind.length})
              </p>
              <ul className="text-sm space-y-1">
                {slightlyBehind.slice(0, 3).map(c => (
                  <li key={`${c.classId}-${c.subjectName}`} className="flex items-center justify-between">
                    <span>{c.className} - {c.subjectName}</span>
                    <span className="font-medium">{c.variance.toFixed(0)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => onViewDetails(classes[0]?.classId ?? '')}
            >
              {t('common.viewDetails')}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
