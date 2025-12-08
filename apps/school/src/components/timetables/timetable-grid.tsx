import type { TimetableSessionData } from './timetable-session-card'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { dayOfWeekLabels, defaultTimeSlots } from '@/schemas/timetable'

import { generateUUID } from '@/utils/generateUUID'
import { TimetableSessionCard } from './timetable-session-card'

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
    <div className="space-y-2">
      {Array.from({ length: 6 }).map(() => (
        <div key={generateUUID()} className="flex gap-2">
          <Skeleton className="h-16 w-16 shrink-0" />
          {Array.from({ length: 6 }).map(() => (
            <Skeleton key={generateUUID()} className="h-16 flex-1" />
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
  daysToShow = [1, 2, 3, 4, 5, 6],
  timeSlots = defaultTimeSlots,
}: TimetableGridProps) {
  const { t } = useTranslation()

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
    <ScrollArea className="w-full">
      <div className="min-w-[800px]">
        {/* Header row with days */}
        <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-1 mb-1">
          <div className="h-10" />
          {' '}
          {/* Empty corner cell */}
          {daysToShow.map(day => (
            <div
              key={day}
              className="h-10 flex items-center justify-center bg-muted rounded-md font-medium text-sm"
            >
              {dayOfWeekLabels[day]}
            </div>
          ))}
        </div>

        {/* Time slots rows */}
        {timeSlots.map(slot => (
          <div
            key={slot.start}
            className="grid grid-cols-[80px_repeat(6,1fr)] gap-1 mb-1"
          >
            {/* Time label */}
            <div className="h-20 flex items-center justify-center text-xs text-muted-foreground">
              {slot.start}
            </div>

            {/* Day cells */}
            {daysToShow.map((day) => {
              const key = `${day}-${slot.start}`
              const slotSessions = sessionsBySlot.get(key) ?? []

              return (
                <div
                  key={key}
                  role={!readOnly && onSlotClick ? 'button' : undefined}
                  tabIndex={!readOnly && onSlotClick && slotSessions.length === 0 ? 0 : undefined}
                  onClick={() => slotSessions.length === 0 && handleSlotClick(day, slot)}
                  onKeyDown={(e) => {
                    if (
                      !readOnly
                      && onSlotClick
                      && slotSessions.length === 0
                      && (e.key === 'Enter' || e.key === ' ')
                    ) {
                      e.preventDefault()
                      handleSlotClick(day, slot)
                    }
                  }}
                  className={cn(
                    'h-20 rounded-md border border-dashed border-muted-foreground/20 p-1',
                    !readOnly && slotSessions.length === 0 && 'hover:bg-muted/50 cursor-pointer',
                    slotSessions.length > 0 && 'border-solid border-transparent',
                  )}
                >
                  {slotSessions.length > 0
                    ? (
                        <div className="h-full space-y-1 overflow-hidden">
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
                          <div className="h-full flex items-center justify-center text-xs text-muted-foreground opacity-0 hover:opacity-100 transition-opacity">
                            {t('timetables.addSession')}
                          </div>
                        )
                      )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
