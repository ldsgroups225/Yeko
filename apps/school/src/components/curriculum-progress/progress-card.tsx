import type { ProgressStatus } from '@/schemas/curriculum-progress'

import { BookOpen, TrendingDown, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { ProgressBar } from './progress-bar'
import { ProgressStatusBadge } from './progress-status-badge'

interface ProgressCardProps {
  className?: string
  subjectName: string
  teacherName?: string
  completedChapters: number
  totalChapters: number
  expectedChapters?: number
  progressPercentage: number
  expectedPercentage?: number
  variance?: number
  status: ProgressStatus
  onClick?: () => void
}

export function ProgressCard({
  className,
  subjectName,
  teacherName,
  completedChapters,
  totalChapters,
  expectedChapters,
  progressPercentage,
  expectedPercentage,
  variance,
  status,
  onClick,
}: ProgressCardProps) {
  const { t } = useTranslation()

  const isAhead = variance !== undefined && variance > 0
  const isBehind = variance !== undefined && variance < 0

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <Card
      className={cn(
        'transition-shadow',
        onClick && 'cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className,
      )}
      onClick={onClick}
      {...(onClick && {
        role: 'button',
        tabIndex: 0,
        onKeyDown: handleKeyDown,
      })}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">{subjectName}</CardTitle>
              {teacherName && (
                <p className="text-sm text-muted-foreground">{teacherName}</p>
              )}
            </div>
          </div>
          <ProgressStatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ProgressBar
          completed={completedChapters}
          total={totalChapters}
          expected={expectedChapters}
          status={status}
        />

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t('curriculum.progress')}
            :
            {progressPercentage.toFixed(0)}
            %
          </span>
          {variance !== undefined && (
            <span
              className={cn(
                'flex items-center gap-1 font-medium',
                isAhead && 'text-blue-600 dark:text-blue-400',
                isBehind && 'text-red-600 dark:text-red-400',
                !isAhead && !isBehind && 'text-green-600 dark:text-green-400',
              )}
            >
              {isAhead && <TrendingUp className="h-4 w-4" />}
              {isBehind && <TrendingDown className="h-4 w-4" />}
              {variance > 0 ? '+' : ''}
              {variance.toFixed(0)}
              %
            </span>
          )}
        </div>

        {expectedPercentage !== undefined && (
          <p className="text-xs text-muted-foreground">
            {t('curriculum.expectedProgress')}
            :
            {expectedPercentage.toFixed(0)}
            %
          </p>
        )}
      </CardContent>
    </Card>
  )
}
