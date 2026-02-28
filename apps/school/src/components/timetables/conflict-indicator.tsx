import { IconAlertTriangle } from '@tabler/icons-react'

import { Badge } from '@workspace/ui/components/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

export type ConflictType = 'teacher' | 'classroom' | 'class'

export interface Conflict {
  type: ConflictType
  message: string
  sessionId?: string
}

interface ConflictIndicatorProps {
  conflicts: Conflict[]
  className?: string
}

const conflictLabels: Record<ConflictType, string> = {
  teacher: 'Enseignant',
  classroom: 'Salle',
  class: 'Classe',
}

export function ConflictIndicator({
  conflicts,
  className,
}: ConflictIndicatorProps) {
  const t = useTranslations()

  if (conflicts.length === 0)
    return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={(
            <Badge
              variant="destructive"
              className={cn('cursor-help gap-1', className)}
            >
              <IconAlertTriangle className="h-3 w-3" />
              {conflicts.length}
              {' '}
              {t.timetables.conflicts()}
            </Badge>
          )}
        />
        <TooltipContent
          side="bottom"
          className="
            bg-destructive/95 border-destructive/20 text-destructive-foreground
            max-w-xs rounded-xl shadow-lg backdrop-blur-xl
          "
        >
          <ul className="space-y-2 text-xs font-medium">
            {conflicts.map(conflict => (
              <li key={generateUUID()} className="flex items-start gap-2">
                <span className="
                  mt-0.5 text-[10px] font-bold tracking-wider uppercase
                  opacity-80
                "
                >
                  {conflictLabels[conflict.type]}
                  :
                </span>
                <span>{conflict.message}</span>
              </li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
