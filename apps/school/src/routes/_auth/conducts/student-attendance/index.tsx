import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BarChart3, Calendar } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { StudentAttendanceGrid } from '@/components/attendance/student/student-attendance-grid'
import { SectionHeader } from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { classAttendanceOptions } from '@/lib/queries/student-attendance'
import { bulkRecordClassAttendance } from '@/school/functions/student-attendance'

export const Route = createFileRoute('/_auth/conducts/student-attendance/')({
  component: StudentAttendancePage,
})

interface StudentAttendanceRecord {
  studentId: string
  status: string
  arrivalTime?: string | null
  notes?: string | null
  student?: {
    user?: { name?: string | null, image?: string | null }
  }
}

interface StudentAttendanceEntry {
  studentId: string
  studentName: string
  studentPhoto?: string | null
  status: 'present' | 'late' | 'absent' | 'excused'
  arrivalTime?: string
  notes?: string
}

function StudentAttendancePage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [date, setDate] = useState(() => new Date())
  const [classId, setClassId] = useState<string>('')

  const dateStr = date.toISOString().split('T')[0] ?? ''

  const { data, isLoading } = useQuery({
    ...classAttendanceOptions(classId, dateStr),
    enabled: !!classId,
  })

  const mutation = useMutation({
    mutationFn: (params: { classId: string, date: string, entries: Array<{ studentId: string, status: 'present' | 'late' | 'absent' | 'excused', arrivalTime?: string | null, reason?: string | null }> }) =>
      bulkRecordClassAttendance({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-attendance'] })
      toast.success(t('attendance.saved'))
    },
    onError: () => {
      toast.error(t('attendance.saveFailed'))
    },
  })

  const entries: StudentAttendanceEntry[] = (data as StudentAttendanceRecord[] | undefined)?.map(record => ({
    studentId: record.studentId,
    studentName: record.student?.user?.name ?? 'Unknown',
    studentPhoto: record.student?.user?.image ?? undefined,
    status: record.status as 'present' | 'late' | 'absent' | 'excused',
    arrivalTime: record.arrivalTime ?? undefined,
    notes: record.notes ?? undefined,
  })) ?? []

  const handleSave = (updatedEntries: StudentAttendanceEntry[]) => {
    if (!classId)
      return
    mutation.mutate({
      classId,
      date: dateStr,
      entries: updatedEntries.map(e => ({
        studentId: e.studentId,
        status: e.status,
        arrivalTime: e.arrivalTime ?? null,
        reason: e.notes ?? null,
      })),
    })
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t('schoolLife.studentAttendance')}
        description={t('attendance.studentAttendanceDescription')}
        actions={(
          <div className="flex gap-2">
            <Link to="/conducts/student-attendance/history">
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                {t('attendance.history')}
              </Button>
            </Link>
            <Link to="/conducts/student-attendance/statistics">
              <Button variant="outline" size="sm">
                <BarChart3 className="mr-2 h-4 w-4" />
                {t('attendance.statistics')}
              </Button>
            </Link>
          </div>
        )}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('attendance.selectClassAndDate')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder={t('attendance.selectClass')} />
              </SelectTrigger>
              <SelectContent>
                {/* TODO: Load classes from query */}
                <SelectItem value="class-1">6ème A</SelectItem>
                <SelectItem value="class-2">6ème B</SelectItem>
                <SelectItem value="class-3">5ème A</SelectItem>
              </SelectContent>
            </Select>
            <DatePicker date={date} onSelect={d => d && setDate(d)} />
          </div>
        </CardContent>
      </Card>

      {classId && (
        <StudentAttendanceGrid
          className={classId}
          entries={entries}
          onSave={handleSave}
          isLoading={isLoading}
          isSaving={mutation.isPending}
        />
      )}
    </div>
  )
}
