import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BarChart3 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { TeacherAttendanceGrid } from '@/components/attendance/teacher/teacher-attendance-grid'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { dailyTeacherAttendanceOptions } from '@/lib/queries/teacher-attendance'
import { bulkRecordAttendance } from '@/school/functions/teacher-attendance'

export const Route = createFileRoute('/_auth/conducts/teacher-attendance/')({
  component: TeacherAttendancePage,
})

interface TeacherAttendanceRecord {
  teacherId: string
  status: string
  arrivalTime?: string | null
  lateMinutes?: number | null
  notes?: string | null
  teacher?: {
    user?: { name?: string | null, image?: string | null }
    specialization?: string | null
  }
}

interface TeacherAttendanceEntry {
  teacherId: string
  teacherName: string
  teacherPhoto?: string | null
  department?: string | null
  status: 'present' | 'late' | 'absent' | 'excused' | 'on_leave'
  arrivalTime?: string
  lateMinutes?: number
  notes?: string
}

function TeacherAttendancePage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [date, setDate] = useState(() => new Date())

  const dateStr = date.toISOString().split('T')[0] ?? ''

  const { data, isLoading } = useQuery(dailyTeacherAttendanceOptions(dateStr))

  const mutation = useMutation({
    mutationFn: (params: { date: string, entries: Array<{ teacherId: string, status: 'present' | 'late' | 'absent' | 'excused' | 'on_leave', arrivalTime?: string | null, reason?: string | null }> }) =>
      bulkRecordAttendance({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-attendance'] })
      toast.success(t('attendance.saved'))
    },
    onError: () => {
      toast.error(t('attendance.saveFailed'))
    },
  })

  const entries: TeacherAttendanceEntry[] = (data as TeacherAttendanceRecord[] | undefined)?.map(record => ({
    teacherId: record.teacherId,
    teacherName: record.teacher?.user?.name ?? 'Unknown',
    teacherPhoto: record.teacher?.user?.image ?? undefined,
    department: record.teacher?.specialization ?? undefined,
    status: record.status as 'present' | 'late' | 'absent' | 'excused' | 'on_leave',
    arrivalTime: record.arrivalTime ?? undefined,
    lateMinutes: record.lateMinutes ?? undefined,
    notes: record.notes ?? undefined,
  })) ?? []

  const handleSave = (updatedEntries: TeacherAttendanceEntry[]) => {
    mutation.mutate({
      date: dateStr,
      entries: updatedEntries.map(e => ({
        teacherId: e.teacherId,
        status: e.status,
        arrivalTime: e.arrivalTime ?? null,
        reason: e.notes ?? null,
      })),
    })
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.schoolLife'), href: '/conducts' },
          { label: t('schoolLife.teacherAttendance') },
        ]}
      />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('schoolLife.teacherAttendance')}</h1>
          <p className="text-muted-foreground">{t('attendance.teacherAttendanceDescription')}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/conducts/teacher-attendance/reports">
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              {t('attendance.punctualityReport')}
            </Button>
          </Link>
        </div>
      </div>

      <TeacherAttendanceGrid
        entries={entries}
        date={date}
        onDateChange={setDate}
        onSave={handleSave}
        isLoading={isLoading}
        isSaving={mutation.isPending}
      />
    </div>
  )
}
