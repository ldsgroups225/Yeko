import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { attendanceStatisticsOptions } from '@/lib/queries/student-attendance'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/conducts/student-attendance/statistics')({
  component: StudentAttendanceStatisticsPage,
})

interface AttendanceStats {
  totalStudents: number
  totalDays: number
  presentCount: number
  lateCount: number
  absentCount: number
  excusedCount: number
  attendanceRate: number
  chronicAbsentees: number
}

function StudentAttendanceStatisticsPage() {
  const { t } = useTranslation()
  const [classId, setClassId] = useState('')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [endDate, setEndDate] = useState(() => new Date())

  const startDateStr = startDate.toISOString().split('T')[0] ?? ''
  const endDateStr = endDate.toISOString().split('T')[0] ?? ''

  const { data, isLoading } = useQuery(
    attendanceStatisticsOptions({
      startDate: startDateStr,
      endDate: endDateStr,
      classId: classId || undefined,
    }),
  )

  const stats = data as AttendanceStats | undefined

  return (
    <div className="container py-6">
      <div className="mb-4">
        <Link to="/conducts/student-attendance">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('attendance.statistics')}</h1>
        <p className="text-muted-foreground">{t('attendance.statisticsDescription')}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{t('attendance.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('attendance.allClasses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('attendance.allClasses')}</SelectItem>
                <SelectItem value="class-1">6ème A</SelectItem>
                <SelectItem value="class-2">6ème B</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <DatePicker date={startDate} onSelect={d => d && setStartDate(d)} />
            </div>
            <div>
              <DatePicker date={endDate} onSelect={d => d && setEndDate(d)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading
        ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map(() => (
              <Skeleton key={`skeleton-${generateUUID()}`} className="h-32" />
            ))}
          </div>
        )
        : stats
          ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('attendance.attendanceRate')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.attendanceRate.toFixed(1)}
                      %
                    </div>
                    <Progress value={stats.attendanceRate} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('attendance.status.present')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.presentCount}</div>
                    <p className="text-xs text-muted-foreground">
                      {((stats.presentCount / (stats.totalStudents * stats.totalDays)) * 100).toFixed(1)}
                      %
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('attendance.status.absent')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.absentCount}</div>
                    <p className="text-xs text-muted-foreground">
                      {((stats.absentCount / (stats.totalStudents * stats.totalDays)) * 100).toFixed(1)}
                      %
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('attendance.chronicAbsentees')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">{stats.chronicAbsentees}</div>
                    <p className="text-xs text-muted-foreground">{t('attendance.studentsAtRisk')}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('attendance.breakdown')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>{t('attendance.status.present')}</span>
                      <span className="font-medium">{stats.presentCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('attendance.status.late')}</span>
                      <span className="font-medium">{stats.lateCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('attendance.status.absent')}</span>
                      <span className="font-medium">{stats.absentCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('attendance.status.excused')}</span>
                      <span className="font-medium">{stats.excusedCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )
          : null}
    </div>
  )
}
