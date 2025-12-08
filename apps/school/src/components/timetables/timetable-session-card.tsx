import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { dayOfWeekShortLabels } from '@/schemas/timetable'

export interface TimetableSessionData {
  id: string
  subjectId: string
  subjectName: string
  teacherId: string
  teacherName: string
  classroomId?: string | null
  classroomName?: string | null
  dayOfWeek: number
  startTime: string
  endTime: string
  color?: string | null
  hasConflict?: boolean
}

interface TimetableSessionCardProps {
  session: TimetableSessionData
  onClick?: (session: TimetableSessionData) => void
  compact?: boolean
  showDay?: boolean
  className?: string
  children?: ReactNode
}

export function TimetableSessionCard({
  session,
  onClick,
  compact = false,
  showDay = false,
  className,
  children,
}: TimetableSessionCardProps) {
  const bgColor = session.color ?? '#3b82f6'

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => onClick?.(session)}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick(session)
        }
      }}
      className={cn(
        'rounded-md p-2 text-white transition-all',
        onClick && 'cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2',
        session.hasConflict && 'ring-2 ring-destructive ring-offset-1',
        className,
      )}
      style={{ backgroundColor: bgColor }}
    >
      {compact
        ? (
          <div className="text-xs">
            <p className="font-medium truncate">{session.subjectName}</p>
            <p className="opacity-80 truncate">
              {session.startTime}
              -
              {session.endTime}
            </p>
          </div>
        )
        : (
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-1">
              <p className="font-semibold text-sm leading-tight">{session.subjectName}</p>
              {session.hasConflict && (
                <span className="text-xs bg-destructive rounded px-1">!</span>
              )}
            </div>
            <p className="text-xs opacity-90">{session.teacherName}</p>
            <div className="flex items-center justify-between text-xs opacity-80">
              <span>
                {showDay && `${dayOfWeekShortLabels[session.dayOfWeek]} `}
                {session.startTime}
                -
                {session.endTime}
              </span>
              {session.classroomName && (
                <span className="truncate ml-1">{session.classroomName}</span>
              )}
            </div>
            {children}
          </div>
        )}
    </div>
  )
}
