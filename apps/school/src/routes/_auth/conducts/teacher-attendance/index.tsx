import type { TeacherAttendanceEntry } from '@/components/attendance/teacher/teacher-attendance-grid'
import { IconCalendar, IconChartBar } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { DatePicker } from '@workspace/ui/components/date-picker'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { TeacherAttendanceGrid } from '@/components/attendance/teacher/teacher-attendance-grid'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
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

function TeacherAttendancePage() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [date, setDate] = useState(() => new Date())

  const dateStr = date.toISOString().split('T')[0] ?? ''

  const { data, isLoading } = useQuery(dailyTeacherAttendanceOptions(dateStr))

  const mutation = useMutation({
    mutationFn: (params: { date: string, entries: Array<{ teacherId: string, status: 'present' | 'late' | 'absent' | 'excused' | 'on_leave', arrivalTime?: string | null, reason?: string | null }> }) =>
      bulkRecordAttendance({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-attendance'] })
      toast.success(t.attendance.saved())
    },
    onError: () => {
      toast.error(t.attendance.saveFailed())
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
          { label: t.nav.schoolLife(), href: '/conducts' },
          { label: t.schoolLife.teacherAttendance() },
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
            <IconChartBar className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.schoolLife.teacherAttendance()}</h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-md">{t.attendance.teacherAttendanceDescription()}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-3"
        >
          <Link to="/conducts/teacher-attendance/reports">
            <Button variant="outline" size="sm" className="rounded-xl border-border/40 hover:bg-primary/10 hover:text-primary transition-all font-black uppercase tracking-widest text-[10px] h-10 px-4">
              <IconChartBar className="mr-2 h-4 w-4" />
              {t.attendance.punctualityReport()}
            </Button>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/20 backdrop-blur-xl border border-border/40 p-6 rounded-3xl"
      >
        <div className="flex items-center gap-2 mb-4 ml-1">
          <IconCalendar className="size-3 text-muted-foreground/60" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.common.date()}</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <DatePicker date={date} onSelect={d => d && setDate(d)} className="h-12 rounded-2xl bg-background/50 border-border/40 font-bold" />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={dateStr}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.1 }}
        >
          <TeacherAttendanceGrid
            entries={entries}
            onSave={handleSave}
            isLoading={isLoading}
            isSaving={mutation.isPending}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
