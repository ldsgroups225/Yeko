import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface GradeStatistics {
  count: number
  average: number
  min: number
  max: number
  below10: number
  above15: number
}

interface GradeStatisticsCardProps {
  statistics: GradeStatistics
  className?: string
}

export function GradeStatisticsCard({ statistics, className }: GradeStatisticsCardProps) {
  const { t } = useTranslation()
  const passRate = statistics.count > 0
    ? Math.round(((statistics.count - statistics.below10) / statistics.count) * 100)
    : 0

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{t('academic.grades.statistics.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatItem label={t('academic.grades.statistics.gradeCount')} value={statistics.count} />
          <StatItem
            label={t('academic.grades.statistics.classAverage')}
            value={statistics.average.toFixed(2)}
            valueClassName={getAverageColor(statistics.average)}
          />
          <StatItem label={t('academic.grades.statistics.min')} value={statistics.min.toFixed(2)} />
          <StatItem label={t('academic.grades.statistics.max')} value={statistics.max.toFixed(2)} />
          <StatItem
            label={t('academic.grades.statistics.below10')}
            value={statistics.below10}
            valueClassName="text-red-600 dark:text-red-400"
          />
          <StatItem
            label={t('academic.grades.statistics.above15')}
            value={statistics.above15}
            valueClassName="text-green-600 dark:text-green-400"
          />
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('academic.grades.statistics.passRate')}</span>
            <span className={cn('font-medium', passRate >= 50 ? 'text-green-600' : 'text-red-600')}>
              {passRate}
              %
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full transition-all',
                passRate >= 50 ? 'bg-green-500' : 'bg-red-500',
              )}
              style={{ width: `${passRate}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatItem({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string | number
  valueClassName?: string
}) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-lg font-semibold tabular-nums', valueClassName)}>
        {value}
      </p>
    </div>
  )
}

function getAverageColor(average: number): string {
  if (average >= 14)
    return 'text-green-600 dark:text-green-400'
  if (average >= 10)
    return 'text-foreground'
  return 'text-red-600 dark:text-red-400'
}
