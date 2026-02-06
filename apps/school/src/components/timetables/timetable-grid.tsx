import type { CSSProperties } from 'react'

import type { TimetableSessionData } from './timetable-session-card'
import { ScrollArea, ScrollBar } from '@workspace/ui/components/scroll-area'

import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

import { dayOfWeekLabels, defaultTimeSlots } from '@/schemas/timetable'
import { TimetableSessionCard } from './timetable-session-card'

const defaultDaysToShow = [1, 2, 3, 4, 5, 6]

const motionInitial = { opacity: 0 }
const motionAnimate = { opacity: 1 }
const motionTransition = { duration: 0.5 }

const timeColumnStyle = (idx: number): CSSProperties => ({ gridColumn: 1, gridRow: idx + 2 })
const dayHeaderStyle = (idx: number): CSSProperties => ({ gridColumn: idx + 2, gridRow: 1 })
const currentTimeIndicatorStyle: CSSProperties = { gridColumn: '2 / -1' }

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
    <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-2">
      <div className="h-12 col-span-7 rounded-xl bg-muted/20" />
      {Array.from({ length: 8 }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={i}>
          <Skeleton className="h-[96px] w-full rounded-xl" />
          {Array.from({ length: 6 }).map((_, j) => (
            // eslint-disable-next-line react/no-array-index-key
            <Skeleton key={j} className="h-[96px] w-full rounded-xl" />
          ))}
        </Fragment>
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

  // Positioned sessions
  const positionedSessions = useMemo(() => {
    // Helper to get row index for a time string (now inside useMemo to avoid dependency issues)
    const getRowIndex = (time: string, isEnd = false) => {
      const slotIndex = timeSlots.findIndex(s => s.start === time)
      if (slotIndex !== -1)
        return slotIndex + 2 // +1 for header, +1 for 1-based indexing

      // If it's an end time and matches the end of the last slot
      const lastSlot = timeSlots[timeSlots.length - 1]
      if (isEnd && lastSlot && lastSlot.end === time)
        return timeSlots.length + 2

      // If it's an end time, find the slot where it ends
      if (isEnd) {
        const endSlotIndex = timeSlots.findIndex(s => s.end === time)
        if (endSlotIndex !== -1)
          return endSlotIndex + 2
      }

      return -1
    }

    return sessions.map((session) => {
      const startRow = getRowIndex(session.startTime)
      const endRow = getRowIndex(session.endTime, true)
      const colIndex = daysToShow.indexOf(session.dayOfWeek) + 2 // +1 for time col, +1 for 1-based

      return {
        ...session,
        gridRow: startRow !== -1 && endRow !== -1 ? `${startRow} / ${endRow}` : undefined,
        gridColumn: colIndex > 1 ? colIndex : undefined,
      }
    }).filter(s => s.gridRow && s.gridColumn)
  }, [sessions, timeSlots, daysToShow])

  // Real-time progress indicator - use lazy initialization
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const timePosition = useMemo(() => {
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const timeInMins = hours * 60 + minutes

    for (let i = 0; i < timeSlots.length; i++) {
      const slot = timeSlots[i]
      if (!slot)
        continue

      const [startStr = '00:00', endStr = '00:00'] = [slot.start, slot.end]
      const [startH = 0, startM = 0] = startStr.split(':').map(Number)
      const [endH = 0, endM = 0] = endStr.split(':').map(Number)

      const startMin = startH * 60 + startM
      const endMin = endH * 60 + endM

      if (timeInMins >= startMin && timeInMins < endMin) {
        const progress = (timeInMins - startMin) / (endMin - startMin)
        return {
          row: i + 2,
          offset: progress * 96,
        }
      }
    }
    return null
  }, [now, timeSlots])

  const currentDay = now.getDay() === 0 ? 7 : now.getDay() // Convert Sun=0 to 7

  const gridStyle = useMemo<CSSProperties>(() => ({
    gridTemplateColumns: `80px repeat(${daysToShow.length}, 1fr)`,
    gridTemplateRows: `48px repeat(${timeSlots.length}, 96px)`,
  }), [daysToShow.length, timeSlots.length])

  const currentTimeStyle = useMemo<CSSProperties | undefined>(() => {
    if (!timePosition)
      return undefined
    return {
      ...currentTimeIndicatorStyle,
      gridRow: timePosition.row,
      transform: `translateY(${timePosition.offset}px)`,
    }
  }, [timePosition])

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
        initial={motionInitial}
        animate={motionAnimate}
        transition={motionTransition}
        className="min-w-[800px]"
      >
        <div
          className="grid gap-1 relative"
          style={gridStyle}
        >
          {/* Header row with days */}
          <div className="h-12 bg-background/80 backdrop-blur-md sticky top-0 z-20 col-start-1 row-start-1" />
          {daysToShow.map((day, idx) => (
            <div
              key={day}
              className={cn(
                'h-12 flex items-center justify-center bg-card/50 backdrop-blur-md border border-border/40 rounded-xl font-black text-xs uppercase tracking-widest text-muted-foreground shadow-sm sticky top-0 z-20',
                day === currentDay && 'text-primary ring-1 ring-primary/20 bg-primary/5',
              )}
              style={dayHeaderStyle(idx)}
            >
              {dayOfWeekLabels[day]}
            </div>
          ))}

          {/* Time column */}
          {timeSlots.map((slot, idx) => (
            <div
              key={`time-${slot.start}`}
              className="flex items-start justify-center text-[10px] font-bold text-muted-foreground/60 bg-muted/20 rounded-xl border border-border/10 h-full sticky left-0 z-10"
              style={timeColumnStyle(idx)}
            >
              {slot.start}
            </div>
          ))}

          {/* Background cells for interactions */}
          {timeSlots.map((slot, rowIdx) => (
            daysToShow.map((day, colIdx) => {
              const IconTag = !readOnly ? 'button' : 'div'
              return (
                <IconTag
                  key={`cell-${day}-${slot.start}`}
                  type={!readOnly ? 'button' : undefined}
                  onClick={() => handleSlotClick(day, slot)}
                  className={cn(
                    'w-full h-full rounded-2xl border border-dashed border-border/10 transition-all duration-200 bg-transparent p-0 appearance-none text-left outline-none',
                    !readOnly && 'hover:bg-primary/5 hover:border-primary/20 cursor-pointer group focus-visible:ring-2 focus-visible:ring-primary',
                    day === currentDay && 'bg-primary/5 border-primary/10 border-solid',
                  )}
                  style={{ gridColumn: colIdx + 2, gridRow: rowIdx + 2 }}
                >
                  {!readOnly && (
                    <div className="h-full flex items-center justify-center">
                      <div
                        className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                        aria-label={t.timetables.addSession()}
                      >
                        <span className="text-lg font-light leading-none">+</span>
                      </div>
                    </div>
                  )}
                </IconTag>
              )
            })
          ))}

          {/* Session Cards */}
          {positionedSessions.map(session => (
            <div
              key={session.id}
              className="p-0.5 z-10"
              style={{
                gridRow: session.gridRow,
                gridColumn: session.gridColumn,
              }}
            >
              <TimetableSessionCard
                session={session}
                onClick={onSessionClick}
                className="h-full"
              />
            </div>
          ))}

          {/* Current Time Indicator */}
          {timePosition && currentTimeStyle && (
            <div
              className="z-30 pointer-events-none flex items-center"
              style={currentTimeStyle}
            >
              <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] relative">
                <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
              </div>
            </div>
          )}
        </div>
      </motion.div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
