import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused'

interface AttendanceDay {
  date: string
  status: AttendanceStatus
}

interface AttendanceCalendarProps {
  studentName: string
  month: Date
  onMonthChange: (month: Date) => void
  attendanceData: AttendanceDay[]
}

const statusColors: Record<AttendanceStatus, string> = {
  present: 'bg-green-500',
  late: 'bg-amber-500',
  absent: 'bg-red-500',
  excused: 'bg-blue-500',
}

export function AttendanceCalendar({
  studentName,
  month,
  onMonthChange,
  attendanceData,
}: AttendanceCalendarProps) {
  const { t } = useTranslation()

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

  const handlePrevMonth = () => {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))
  }

  const summary = {
    present: attendanceData.filter(d => d.status === 'present').length,
    late: attendanceData.filter(d => d.status === 'late').length,
    absent: attendanceData.filter(d => d.status === 'absent').length,
    excused: attendanceData.filter(d => d.status === 'excused').length,
  }

  const monthName = month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">{studentName}</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium capitalize w-32 text-center">{monthName}</span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(day => (
            <div key={generateUUID()} className="font-medium text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            if (!day) {
              return <div key={generateUUID()} className="h-8" />
            }
            const dateStr = day.toISOString().split('T')[0]
            const status = attendanceMap.get(dateStr ?? '')
            return (
              <div
                key={generateUUID()}
                className={cn(
                  'h-8 flex items-center justify-center rounded text-xs',
                  status ? statusColors[status] : 'bg-muted',
                  status && 'text-white',
                )}
                title={status ? t(`attendance.status.${status}`) : undefined}
              >
                {day.getDate()}
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-green-500" />
            <span>
              {t('attendance.status.present')}
              :
              {' '}
              {summary.present}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-amber-500" />
            <span>
              {t('attendance.status.late')}
              :
              {' '}
              {summary.late}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-red-500" />
            <span>
              {t('attendance.status.absent')}
              :
              {' '}
              {summary.absent}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-blue-500" />
            <span>
              {t('attendance.status.excused')}
              :
              {' '}
              {summary.excused}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
