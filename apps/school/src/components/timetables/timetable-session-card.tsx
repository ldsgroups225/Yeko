import type { ReactNode } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip'

import { motion } from 'motion/react'
import { useI18nContext } from '@/i18n/i18n-react'
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
  conflictsWith?: string[]
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
  const { t } = useI18nContext()
  const bgColor = session.color ?? '#3b82f6'

  const content = (
    <>
      {compact
        ? (
            <div className="
              relative flex h-full flex-col justify-center text-[10px]
              leading-tight
            "
            >
              <p className="truncate font-bold">{session.subjectName}</p>
              <p className="truncate text-[9px] font-medium opacity-80">
                {session.startTime}
                -
                {session.endTime}
              </p>
              {session.hasConflict && (
                <span className="
                  bg-destructive absolute -top-1 -right-1 flex h-3 w-3
                  items-center justify-center rounded-full border border-white
                  text-[8px] font-black text-white shadow-sm
                  dark:border-slate-900
                "
                >
                  !
                </span>
              )}
            </div>
          )
        : (
            <div className="flex h-full flex-col space-y-1">
              <div className="flex items-start justify-between gap-1">
                <p className="
                  line-clamp-2 text-xs leading-none font-black tracking-tight
                "
                >
                  {session.subjectName}
                </p>
                {session.hasConflict && (
                  <span className="
                    bg-destructive text-destructive-foreground animate-pulse
                    rounded-md px-1 py-0.5 text-[9px] font-black shadow-sm
                  "
                  >
                    !
                  </span>
                )}
              </div>
              <p className="
                truncate text-[10px] font-bold tracking-wide uppercase
                opacity-90
              "
              >
                {session.teacherName}
              </p>
              <div className="
                mt-auto flex items-center justify-between text-[9px] font-medium
                opacity-80
              "
              >
                <span className="tracking-tighter tabular-nums">
                  {showDay && `${dayOfWeekShortLabels[session.dayOfWeek]} `}
                  {session.startTime}
                  -
                  {session.endTime}
                </span>
                {session.classroomName && (
                  <span className="
                    ml-1 truncate rounded-sm bg-black/10 px-1
                    dark:bg-white/10
                  "
                  >
                    {session.classroomName}
                  </span>
                )}
              </div>
              {children}
            </div>
          )}
    </>
  )

  const card = onClick
    ? (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onClick(session)}
          className={cn(
            `
              h-full w-full rounded-xl p-2.5 text-left text-white shadow-md
              transition-all
              hover:shadow-lg
            `,
            `
              focus:ring-primary/50
              cursor-pointer
              focus:ring-2 focus:ring-offset-1 focus:outline-none
            `,
            session.hasConflict && `
              ring-destructive shadow-destructive/20 ring-2 ring-offset-1
            `,
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
    : (
        <div
          className={cn(
            'h-full rounded-xl p-2.5 text-white shadow-md transition-all',
            session.hasConflict && `
              ring-destructive shadow-destructive/20 ring-2 ring-offset-1
            `,
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

  if (session.hasConflict) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={card} />
          <TooltipContent className="
            bg-destructive text-destructive-foreground flex flex-col gap-0.5
          "
          >
            <p className="text-xs font-bold">{t.timetables.conflictDetected()}</p>
            <p className="text-[10px] opacity-90">{t.timetables.conflictDescription()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return card
}
