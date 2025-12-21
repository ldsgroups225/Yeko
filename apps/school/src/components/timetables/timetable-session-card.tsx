import type { ReactNode } from 'react'
import { motion } from 'motion/react'

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

  const content = (
    <>
      {compact
        ? (
            <div className="text-[10px] leading-tight flex flex-col justify-center h-full">
              <p className="font-bold truncate">{session.subjectName}</p>
              <p className="opacity-80 truncate font-medium text-[9px]">
                {session.startTime}
                -
                {session.endTime}
              </p>
            </div>
          )
        : (
            <div className="space-y-1 h-full flex flex-col">
              <div className="flex items-start justify-between gap-1">
                <p className="font-black tracking-tight text-xs leading-none line-clamp-2">{session.subjectName}</p>
                {session.hasConflict && (
                  <span className="text-[9px] font-black bg-destructive text-destructive-foreground rounded-md px-1 py-0.5 shadow-sm animate-pulse">!</span>
                )}
              </div>
              <p className="text-[10px] uppercase font-bold opacity-90 truncate tracking-wide">{session.teacherName}</p>
              <div className="mt-auto flex items-center justify-between text-[9px] opacity-80 font-medium">
                <span className="tabular-nums tracking-tighter">
                  {showDay && `${dayOfWeekShortLabels[session.dayOfWeek]} `}
                  {session.startTime}
                  -
                  {session.endTime}
                </span>
                {session.classroomName && (
                  <span className="truncate ml-1 bg-black/10 dark:bg-white/10 px-1 rounded-sm">{session.classroomName}</span>
                )}
              </div>
              {children}
            </div>
          )}
    </>
  )

  if (onClick) {
    return (
      <motion.button
        type="button"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onClick(session)}
        className={cn(
          'rounded-xl p-2.5 text-white transition-all text-left w-full h-full shadow-md hover:shadow-lg',
          'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1',
          session.hasConflict && 'ring-2 ring-destructive ring-offset-1 shadow-destructive/20',
          className,
        )}
        style={{
          backgroundColor: bgColor,
          backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.1), rgba(0,0,0,0.05))',
        }}
      >
        {content}
      </motion.button>
    )
  }

  return (
    <div
      className={cn(
        'rounded-xl p-2.5 text-white transition-all h-full shadow-md',
        session.hasConflict && 'ring-2 ring-destructive ring-offset-1 shadow-destructive/20',
        className,
      )}
      style={{
        backgroundColor: bgColor,
        backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.1), rgba(0,0,0,0.05))',
      }}
    >
      {content}
    </div>
  )
}
