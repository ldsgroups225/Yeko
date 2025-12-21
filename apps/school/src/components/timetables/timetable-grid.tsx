import type { TimetableSessionData } from './timetable-session-card'

import { motion } from 'motion/react'
import { useMemo } from 'react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { dayOfWeekLabels, defaultTimeSlots } from '@/schemas/timetable'

import { generateUUID } from '@/utils/generateUUID'
import { TimetableSessionCard } from './timetable-session-card'

const defaultDaysToShow = [1, 2, 3, 4, 5, 6]

interface TimetableGridProps {
  sessions: TimetableSessionData[]
  isLoading?: boolean
  onSessionClick?: (session: TimetableSessionData) => void
  onSlotClick?: (dayOfWeek: number, startTime: string, endTime: string) => void
  readOnly?: boolean
  daysToShow?: number[] // 1-7, defaults to Mon-Sat
  timeSlots?: { start: string, end: string }[]
}

function GridSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map(() => (
        <div key={generateUUID()} className="flex gap-2">
          <Skeleton className="h-20 w-20 shrink-0 rounded-2xl" />
          {Array.from({ length: 6 }).map(() => (
            <Skeleton key={generateUUID()} className="h-20 flex-1 rounded-2xl" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function TimetableGrid({
  sessions,
  isLoading,
  onSessionClick,
  onSlotClick,
  readOnly = false,
  daysToShow = defaultDaysToShow,
  timeSlots = defaultTimeSlots,
}: TimetableGridProps) {
  const t = useTranslations()

  // Group sessions by day and time slot
  const sessionsBySlot = useMemo(() => {
    const map = new Map<string, TimetableSessionData[]>()

    for (const session of sessions) {
      const key = `${session.dayOfWeek}-${session.startTime}`
      const existing = map.get(key) ?? []
      map.set(key, [...existing, session])
    }

    return map
  }, [sessions])

  if (isLoading) {
    return <GridSkeleton />
  }

  const handleSlotClick = (dayOfWeek: number, slot: { start: string, end: string }) => {
    if (!readOnly && onSlotClick) {
      onSlotClick(dayOfWeek, slot.start, slot.end)
    }
  }

  return (
    <ScrollArea className="w-full pb-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-w-[800px]"
      >
        {/* Header row with days */}
        <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-2 mb-2 sticky top-0 z-10">
          <div className="h-12 bg-background/80 backdrop-blur-md sticky left-0 z-20" />
          {' '}
          {/* Empty corner cell */}
          {daysToShow.map(day => (
            <div
              key={day}
              className="h-12 flex items-center justify-center bg-card/50 backdrop-blur-md border border-border/40 rounded-xl font-black text-xs uppercase tracking-widest text-muted-foreground shadow-sm"
            >
              {dayOfWeekLabels[day]}
            </div>
          ))}
        </div>

        {/* Time slots rows */}
        <div className="space-y-2">
          {timeSlots.map((slot, index) => (
            <motion.div
              key={slot.start}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-[80px_repeat(6,1fr)] gap-2"
            >
              {/* Time label */}
              <div className="h-24 flex items-center justify-center text-[10px] font-bold text-muted-foreground/60 bg-muted/20 rounded-xl border border-border/10">
                {slot.start}
              </div>

              {/* Day cells */}
              {daysToShow.map((day) => {
                const key = `${day}-${slot.start}`
                const slotSessions = sessionsBySlot.get(key) ?? []
                const isClickable = !readOnly && onSlotClick && slotSessions.length === 0

                return (
                  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                  <div
                    key={key}
                    role={isClickable ? 'button' : undefined}
                    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                    tabIndex={isClickable ? 0 : undefined}
                    onClick={isClickable ? () => handleSlotClick(day, slot) : undefined}
                    onKeyDown={
                      isClickable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleSlotClick(day, slot)
                            }
                          }
                        : undefined
                    }
                    className={cn(
                      'h-24 rounded-2xl border border-dashed border-border/30 p-1.5 transition-all duration-200',
                      !readOnly && slotSessions.length === 0 && 'hover:bg-primary/5 hover:border-primary/30 cursor-pointer group',
                      slotSessions.length > 0 && 'border-none p-0 bg-transparent',
                    )}
                  >
                    {slotSessions.length > 0
                      ? (
                          <div className="h-full space-y-1.5 overflow-hidden">
                            {slotSessions.map(session => (
                              <TimetableSessionCard
                                key={session.id}
                                session={session}
                                onClick={onSessionClick}
                                compact={slotSessions.length > 1}
                                className="h-full"
                              />
                            ))}
                          </div>
                        )
                      : (
                          !readOnly && (
                            <div className="h-full flex items-center justify-center">
                              <div
                                className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                                aria-label={t.timetables.addSession()}
                              >
                                <span className="text-lg font-light leading-none">+</span>
                              </div>
                            </div>
                          )
                        )}
                  </div>
                )
              })}
            </motion.div>
          ))}
        </div>
      </motion.div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
