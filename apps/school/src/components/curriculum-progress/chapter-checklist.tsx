import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export interface Chapter {
  id: string
  name: string
  orderIndex: number
  isCompleted: boolean
  completedAt?: Date | string | null
}

interface ChapterChecklistProps {
  chapters: Chapter[]
  onToggle?: (chapterId: string, completed: boolean) => Promise<void>
  isToggling?: string | null
  readOnly?: boolean
  className?: string
}

export function ChapterChecklist({
  chapters,
  onToggle,
  isToggling,
  readOnly = false,
  className,
}: ChapterChecklistProps) {
  const { t } = useTranslation()

  const sortedChapters = [...chapters].sort((a, b) => a.orderIndex - b.orderIndex)
  const completedCount = chapters.filter(c => c.isCompleted).length

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{t('curriculum.chapters')}</h4>
        <span className="text-sm text-muted-foreground">
          {completedCount}
          /
          {chapters.length}
        </span>
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-1 pr-4">
          {sortedChapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className={cn(
                'flex items-center gap-3 rounded-md p-2 transition-colors',
                !readOnly && 'hover:bg-muted',
                chapter.isCompleted && 'bg-green-50 dark:bg-green-900/10',
              )}
            >
              {readOnly
                ? (
                    chapter.isCompleted
                      ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                        )
                      : (
                          <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                        )
                  )
                : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      disabled={isToggling === chapter.id}
                      onClick={() => onToggle?.(chapter.id, !chapter.isCompleted)}
                      aria-label={
                        chapter.isCompleted
                          ? t('curriculum.markIncomplete')
                          : t('curriculum.markComplete')
                      }
                    >
                      {isToggling === chapter.id
                        ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )
                        : chapter.isCompleted
                          ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )
                          : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                    </Button>
                  )}

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm',
                    chapter.isCompleted && 'text-muted-foreground line-through',
                  )}
                >
                  <span className="font-medium">
                    {index + 1}
                    .
                  </span>
                  {' '}
                  {chapter.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
