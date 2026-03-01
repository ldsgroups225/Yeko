import type { ProgressStatus } from '@/schemas/curriculum-progress'

import { IconBook, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'

import { useTranslations } from '@/i18n'
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
  const t = useTranslations()

  const isAhead = variance !== undefined && variance > 0
  const isBehind = variance !== undefined && variance < 0

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <Card
      className={cn(
        'transition-shadow',
        onClick && `
          focus:ring-ring
          cursor-pointer
          hover:shadow-md
          focus:ring-2 focus:ring-offset-2 focus:outline-none
        `,
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <IconBook className="text-muted-foreground h-5 w-5" />
            <div>
              <CardTitle className="text-base">{subjectName}</CardTitle>
              {teacherName && (
                <p className="text-muted-foreground text-sm">{teacherName}</p>
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
            {t.curriculum.progress()}
            :
            {progressPercentage.toFixed(0)}
            %
          </span>
          {variance !== undefined && (
            <span
              className={cn(
                'flex items-center gap-1 font-medium',
                isAhead && `
                  text-secondary
                  dark:text-secondary/80
                `,
                isBehind && `
                  text-destructive
                  dark:text-destructive/80
                `,
                !isAhead && !isBehind && `
                  text-success
                  dark:text-success/80
                `,
              )}
            >
              {isAhead && <IconTrendingUp className="h-4 w-4" />}
              {isBehind && <IconTrendingDown className="h-4 w-4" />}
              {variance > 0 ? '+' : ''}
              {variance.toFixed(0)}
              %
            </span>
          )}
        </div>

        {expectedPercentage !== undefined && (
          <p className="text-muted-foreground text-xs">
            {t.curriculum.expectedProgress()}
            :
            {expectedPercentage.toFixed(0)}
            %
          </p>
        )}
      </CardContent>
    </Card>
  )
}
