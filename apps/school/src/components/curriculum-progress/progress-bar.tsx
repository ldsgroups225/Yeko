import type { ProgressStatus } from '@/schemas/curriculum-progress'

import { Progress } from '@workspace/ui/components/progress'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  completed: number
  total: number
  expected?: number
  status?: ProgressStatus
  showLabel?: boolean
  className?: string
}

const statusColors: Record<ProgressStatus, string> = {
  on_track: '[&>div]:bg-green-500',
  slightly_behind: '[&>div]:bg-yellow-500',
  significantly_behind: '[&>div]:bg-red-500',
  ahead: '[&>div]:bg-blue-500',
}

export function ProgressBar({
  completed,
  total,
  expected,
  status = 'on_track',
  showLabel = true,
  className,
}: ProgressBarProps) {
  const t = useTranslations()

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const expectedPercentage
    = expected !== undefined && total > 0
      ? Math.round((expected / total) * 100)
      : undefined

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={(
            <div className={cn('space-y-1', className)}>
              <div className="relative">
                <Progress
                  value={percentage}
                  className={cn('h-2', statusColors[status])}
                />
                {expectedPercentage !== undefined && (
                  <div
                    className="absolute top-0 h-2 w-0.5 bg-foreground/50"
                    style={{ left: `${expectedPercentage}%` }}
                    aria-hidden="true"
                  />
                )}
              </div>
              {showLabel && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {completed}
                    /
                    {total}
                    {' '}
                    {t.curriculum.chapters()}
                  </span>
                  <span>
                    {percentage}
                    %
                  </span>
                </div>
              )}
            </div>
          )}
        />
        <TooltipContent>
          <div className="text-sm space-y-1">
            <p>
              {t.curriculum.completed()}
              :
              {completed}
              /
              {total}
              {' '}
              (
              {percentage}
              %)
            </p>
            {expectedPercentage !== undefined && (
              <p>
                {t.curriculum.expected()}
                :
                {expectedPercentage}
                %
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
