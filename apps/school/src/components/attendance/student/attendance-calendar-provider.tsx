import type { AttendanceDay, AttendanceStatus } from './types-calendar'
import { useMemo } from 'react'
import { useLocale } from '@/i18n'
import { AttendanceCalendarContext } from './attendance-calendar-context'

interface AttendanceCalendarProviderProps {
  children: React.ReactNode
  studentName: string
  studentPhoto?: string | null
  month: Date
  onMonthChange: (month: Date) => void
  attendanceData: AttendanceDay[]
}

export function AttendanceCalendarProvider({
  children,
  studentName,
  studentPhoto,
  month,
  onMonthChange,
  attendanceData,
}: AttendanceCalendarProviderProps) {
  const { locale } = useLocale()

  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceStatus>()
    attendanceData.forEach(d => map.set(d.date, d.status))
    return map
  }, [attendanceData])

  const calendarDays = useMemo(() => {
    const year = month.getFullYear()
    const monthIndex = month.getMonth()
    const firstDay = new Date(year, monthIndex, 1)
    const lastDay = new Date(year, monthIndex + 1, 0)
    const startPadding = firstDay.getDay()
    const days: (Date | null)[] = []

    for (let i = 0; i < startPadding; i++) {
      days.push(null)
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, monthIndex, d))
    }

    return days
  }, [month])

  const summary = {
    present: attendanceData.filter(d => d.status === 'present').length,
    late: attendanceData.filter(d => d.status === 'late').length,
    absent: attendanceData.filter(d => d.status === 'absent').length,
    excused: attendanceData.filter(d => d.status === 'excused').length,
  }

  const monthName = month.toLocaleDateString(
    locale === 'fr' ? 'fr-FR' : 'en-US',
    { month: 'long', year: 'numeric' },
  )

  return (
    <AttendanceCalendarContext
      value={{
        state: {
          studentName,
          studentPhoto,
          month,
          attendanceMap,
          calendarDays,
          summary,
          monthName,
        },
        actions: {
          handlePrevMonth: () => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1)),
          handleNextMonth: () => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1)),
        },
      }}
    >
      {children}
    </AttendanceCalendarContext>
  )
}
