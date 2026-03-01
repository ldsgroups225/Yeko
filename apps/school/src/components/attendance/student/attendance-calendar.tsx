import type { AttendanceDay } from './types-calendar'
import { Card, CardContent } from '@workspace/ui/components/card'
import { AttendanceCalendarGrid } from './attendance-calendar-grid'
import { AttendanceCalendarHeader } from './attendance-calendar-header'
import { AttendanceCalendarProvider } from './attendance-calendar-provider'
import { AttendanceCalendarStats } from './attendance-calendar-stats'

interface AttendanceCalendarProps {
  studentName: string
  studentPhoto?: string | null
  month: Date
  onMonthChange: (month: Date) => void
  attendanceData: AttendanceDay[]
}

export function AttendanceCalendar({
  studentName,
  studentPhoto,
  month,
  onMonthChange,
  attendanceData,
}: AttendanceCalendarProps) {
  return (
    <AttendanceCalendarProvider
      studentName={studentName}
      studentPhoto={studentPhoto}
      month={month}
      onMonthChange={onMonthChange}
      attendanceData={attendanceData}
    >
      <Card className="
        border-border/40 bg-card/30 overflow-hidden rounded-3xl shadow-2xl
        backdrop-blur-xl
      "
      >
        <AttendanceCalendarHeader />
        <CardContent className="p-6">
          <AttendanceCalendarGrid />
          <AttendanceCalendarStats />
        </CardContent>
      </Card>
    </AttendanceCalendarProvider>
  )
}
