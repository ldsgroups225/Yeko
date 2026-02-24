import type { AttendanceStatus } from './types-calendar'
import { createContext, use } from 'react'

interface AttendanceCalendarContextType {
  state: {
    studentName: string
    studentPhoto?: string | null
    month: Date
    attendanceMap: Map<string, AttendanceStatus>
    calendarDays: (Date | null)[]
    summary: {
      present: number
      late: number
      absent: number
      excused: number
    }
    monthName: string
  }
  actions: {
    handlePrevMonth: () => void
    handleNextMonth: () => void
  }
}

export const AttendanceCalendarContext = createContext<AttendanceCalendarContextType | undefined>(undefined)

export function useAttendanceCalendar() {
  const context = use(AttendanceCalendarContext)
  if (!context) {
    throw new Error('useAttendanceCalendar must be used within an AttendanceCalendarProvider')
  }
  return context
}
