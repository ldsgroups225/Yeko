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
  isPending?: boolean
  onSessionClick?: (session: TimetableSessionData) => void
  onSlotClick?: (dayOfWeek: number, startTime: string, endTime: string) => void
  readOnly?: boolean
  daysToShow?: number[] // 1-7, defaults to Mon-Sat
  timeSlots?: { start: string, end: string }[]
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-2">
      <div className="bg-muted/20 col-span-7 h-12 rounded-xl" />
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
  isPending,
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

  if (isPending) {
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
          className="relative grid gap-1"
          style={gridStyle}
        >
          {/* Header row with days */}
          <div className="
            bg-background/80 sticky top-0 z-20 col-start-1 row-start-1 h-12
            backdrop-blur-md
          "
          />
          {daysToShow.map((day, idx) => (
            <div
              key={day}
              className={cn(
                `
                  bg-card/50 border-border/40 text-muted-foreground sticky top-0
                  z-20 flex h-12 items-center justify-center rounded-xl border
                  text-xs font-black tracking-widest uppercase shadow-sm
                  backdrop-blur-md
                `,
                day === currentDay && `
                  text-primary ring-primary/20 bg-primary/5 ring-1
                `,
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
              className="
                text-muted-foreground/60 bg-muted/20 border-border/10 sticky
                left-0 z-10 flex h-full items-start justify-center rounded-xl
                border text-[10px] font-bold
              "
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
                    `
                      border-border/10 h-full w-full appearance-none rounded-2xl
                      border border-dashed bg-transparent p-0 text-left
                      transition-all duration-200 outline-none
                    `,
                    !readOnly && `
                      hover:bg-primary/5 hover:border-primary/20
                      group
                      focus-visible:ring-primary
                      cursor-pointer
                      focus-visible:ring-2
                    `,
                    day === currentDay && `
                      bg-primary/5 border-primary/10 border-solid
                    `,
                  )}
                  style={{ gridColumn: colIdx + 2, gridRow: rowIdx + 2 }}
                >
                  {!readOnly && (
                    <div className="flex h-full items-center justify-center">
                      <div
                        className="
                          bg-primary/10 text-primary flex h-8 w-8 scale-90
                          items-center justify-center rounded-full opacity-0
                          transition-all
                          group-hover:scale-100 group-hover:opacity-100
                        "
                        aria-label={t.timetables.addSession()}
                      >
                        <span className="text-lg leading-none font-light">+</span>
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
              className="z-10 p-0.5"
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
              className="pointer-events-none z-30 flex items-center"
              style={currentTimeStyle}
            >
              <div className="
                relative h-0.5 w-full bg-red-500
                shadow-[0_0_8px_rgba(239,68,68,0.4)]
              "
              >
                <div className="
                  absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-red-500
                  shadow-sm
                "
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
