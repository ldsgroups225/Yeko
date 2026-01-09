import { IconArrowLeft } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'

import { DatePicker } from '@workspace/ui/components/date-picker'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { useState } from 'react'
import { useTranslations } from '@/i18n'
import { teacherPunctualityReportOptions } from '@/lib/queries/teacher-attendance'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/conducts/teacher-attendance/reports')({
  component: TeacherPunctualityReportsPage,
})

interface PunctualityRecord {
  teacherId: string
  teacherName: string
  totalDays: number
  presentDays: number
  lateDays: number
  absentDays: number
  excusedDays: number
  onLeaveDays: number
  totalLateMinutes: number
  averageLateMinutes: number
  punctualityRate: number
}

function TeacherPunctualityReportsPage() {
  const t = useTranslations()
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [endDate, setEndDate] = useState(() => new Date())

  const startDateStr = startDate.toISOString().split('T')[0] ?? ''
  const endDateStr = endDate.toISOString().split('T')[0] ?? ''

  const { data, isLoading } = useQuery(
    teacherPunctualityReportOptions({
      startDate: startDateStr,
      endDate: endDateStr,
    }),
  )

  const records = (data as PunctualityRecord[] | undefined) ?? []

  return (
    <div className="container py-6">
      <div className="mb-4">
        <Link to="/conducts/teacher-attendance">
          <Button variant="ghost" size="sm">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            {t.common.back()}
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.attendance.punctualityReport()}</h1>
        <p className="text-muted-foreground">{t.attendance.punctualityReportDescription()}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{t.attendance.selectDateRange()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div>
              <label className="text-sm text-muted-foreground">{t.common.startDate()}</label>
              <DatePicker date={startDate} onSelect={d => d && setStartDate(d)} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">{t.common.endDate()}</label>
              <DatePicker date={endDate} onSelect={d => d && setEndDate(d)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.attendance.punctualityReport()}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading
            ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map(() => (
                    <Skeleton key={`skeleton-${generateUUID()}`} className="h-12 w-full" />
                  ))}
                </div>
              )
            : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.attendance.teacher()}</TableHead>
                      <TableHead className="text-center">{t.attendance.totalDays()}</TableHead>
                      <TableHead className="text-center">{t.attendance.status.present()}</TableHead>
                      <TableHead className="text-center">{t.attendance.status.late()}</TableHead>
                      <TableHead className="text-center">{t.attendance.status.absent()}</TableHead>
                      <TableHead className="text-center">{t.attendance.avgLateMinutes()}</TableHead>
                      <TableHead className="text-center">{t.attendance.punctualityRate()}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map(record => (
                      <TableRow key={record.teacherId}>
                        <TableCell className="font-medium">{record.teacherName}</TableCell>
                        <TableCell className="text-center">{record.totalDays}</TableCell>
                        <TableCell className="text-center text-green-600">{record.presentDays}</TableCell>
                        <TableCell className="text-center text-amber-600">{record.lateDays}</TableCell>
                        <TableCell className="text-center text-red-600">{record.absentDays}</TableCell>
                        <TableCell className="text-center">
                          {record.averageLateMinutes.toFixed(0)}
                          {' '}
                          min
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {record.punctualityRate.toFixed(1)}
                          %
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
        </CardContent>
      </Card>
    </div>
  )
}
