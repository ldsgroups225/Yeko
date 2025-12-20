import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { AttendanceCalendar } from '@/components/attendance/student/attendance-calendar'

import { StudentCombobox } from '@/components/attendance/student/student-combobox'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from '@/i18n'
import { studentAttendanceHistoryOptions } from '@/lib/queries/student-attendance'

export const Route = createFileRoute('/_auth/conducts/student-attendance/history')({
  component: StudentAttendanceHistoryPage,
})

interface AttendanceRecord {
  date: string
  status: string
}

function StudentAttendanceHistoryPage() {
  const t = useTranslations()
  const [studentId, setStudentId] = useState('')
  const [studentName, setStudentName] = useState('')
  const [month, setMonth] = useState(() => new Date())

  const startDate = new Date(month.getFullYear(), month.getMonth(), 1)
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0)

  const { data, isLoading } = useQuery({
    ...studentAttendanceHistoryOptions({
      studentId,
      startDate: startDate.toISOString().split('T')[0] ?? '',
      endDate: endDate.toISOString().split('T')[0] ?? '',
    }),
    enabled: !!studentId,
  })

  const attendanceData = (data as AttendanceRecord[] | undefined)?.map(record => ({
    date: record.date,
    status: record.status as 'present' | 'late' | 'absent' | 'excused',
  })) ?? []

  const handleStudentSelect = (id: string, name: string) => {
    setStudentId(id)
    setStudentName(name)
  }

  return (
    <div className="container py-6">
      <div className="mb-4">
        <Link to="/conducts/student-attendance">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.common.back()}
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.attendance.history()}</h1>
        <p className="text-muted-foreground">{t.attendance.historyDescription()}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{t.attendance.selectStudent()}</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentCombobox
            value={studentId}
            onSelect={handleStudentSelect}
            placeholder={t.attendance.searchStudent()}
          />
        </CardContent>
      </Card>

      {studentId && (
        isLoading
          ? (
              <Skeleton className="h-96 w-full max-w-md" />
            )
          : (
              <AttendanceCalendar
                studentName={studentName || studentId}
                month={month}
                onMonthChange={setMonth}
                attendanceData={attendanceData}
              />
            )
      )}
    </div>
  )
}
