import { AlertTriangle } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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

export function ConflictIndicator({ conflicts, className }: ConflictIndicatorProps) {
  const { t } = useTranslation()

  if (conflicts.length === 0)
    return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="destructive"
            className={cn('gap-1 cursor-help', className)}
          >
            <AlertTriangle className="h-3 w-3" />
            {conflicts.length}
            {' '}
            {t('timetables.conflicts')}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <ul className="space-y-1 text-sm">
            {conflicts.map(conflict => (
              <li key={generateUUID()} className="flex items-start gap-2">
                <span className="font-medium">
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
