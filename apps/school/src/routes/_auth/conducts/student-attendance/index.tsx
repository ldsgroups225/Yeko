import { IconCalendar, IconChartBar, IconClipboardCheck, IconHistory, IconSparkles } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { DatePicker } from '@workspace/ui/components/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { StudentAttendanceGrid } from '@/components/attendance/student/student-attendance-grid'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { classAttendanceOptions } from '@/lib/queries/student-attendance'
import { getClasses } from '@/school/functions/classes'
import { getSchoolYears } from '@/school/functions/school-years'
import { bulkRecordClassAttendance } from '@/school/functions/student-attendance'

export const Route = createFileRoute('/_auth/conducts/student-attendance/')({
  component: StudentAttendancePage,
})

interface StudentAttendanceRecord {
  studentId: string
  studentName: string
  photoUrl?: string | null
  attendance?: {
    status: string
    arrivalTime?: string | null
    notes?: string | null
  } | null
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
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [date, setDate] = useState(() => new Date())
  const [classId, setClassId] = useState<string>('')

  const { schoolYearId: contextSchoolYearId } = useSchoolYearContext()
  const { data: schoolYearsResult } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
  })
  const schoolYears = schoolYearsResult?.success ? schoolYearsResult.data : []
  const activeSchoolYear = schoolYears.find(sy => sy.isActive)
  const schoolYearId = contextSchoolYearId || activeSchoolYear?.id

  const { data: classesResult } = useQuery({
    queryKey: ['classes', { schoolYearId }],
    queryFn: () => getClasses({ data: { schoolYearId: schoolYearId ?? undefined } }),
    enabled: !!schoolYearId,
  })

  const classes = classesResult?.success ? classesResult.data : []

  const dateStr = date.toISOString().split('T')[0] ?? ''

  const { data: attendanceResult, isLoading } = useQuery({
    ...classAttendanceOptions(classId, dateStr),
    enabled: !!classId,
  })

  const mutation = useMutation({
    mutationFn: (params: { classId: string, date: string, entries: Array<{ studentId: string, status: 'present' | 'late' | 'absent' | 'excused', arrivalTime?: string | null, reason?: string | null }> }) =>
      bulkRecordClassAttendance({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-attendance'] })
      toast.success(t.attendance.saved(), {
        className: 'rounded-2xl backdrop-blur-xl bg-background/80 border-border/40 font-bold',
      })
      setClassId('')
    },
    onError: () => {
      toast.error(t.attendance.saveFailed())
    },
  })

  const attendanceData = attendanceResult?.success ? attendanceResult.data : []
  const entries: StudentAttendanceEntry[] = (attendanceData as StudentAttendanceRecord[]).map(record => ({
    studentId: record.studentId,
    studentName: record.studentName,
    studentPhoto: record.photoUrl,
    status: (record.attendance?.status as StudentAttendanceEntry['status']) || 'present',
    arrivalTime: record.attendance?.arrivalTime ?? undefined,
    notes: record.attendance?.notes ?? undefined,
  })) ?? []

  const handleSave = (updatedEntries: StudentAttendanceEntry[]) => {
    if (!classId)
      return
    mutation.mutate({
      classId,
      date: dateStr,
      entries: updatedEntries.map((e: StudentAttendanceEntry) => ({
        studentId: e.studentId,
        status: e.status,
        arrivalTime: e.arrivalTime ?? null,
        reason: e.notes ?? null,
      })),
    })
  }

  const selectedClass = classes.find(c => c.class.id === classId)
  const className = selectedClass ? `${selectedClass.grade?.name ?? ''} ${selectedClass.class.section}` : ''

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.schoolLife(), href: '/conducts' },
          { label: t.schoolLife.studentAttendance() },
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
            <IconClipboardCheck className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.schoolLife.studentAttendance()}</h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-md">{t.attendance.studentAttendanceDescription()}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-3"
        >
          <Link to="/conducts/student-attendance/history">
            <Button variant="outline" size="sm" className="rounded-xl border-border/40 hover:bg-primary/10 hover:text-primary transition-all font-black uppercase tracking-widest text-[10px] h-10 px-4">
              <IconHistory className="mr-2 h-4 w-4" />
              {t.attendance.history()}
            </Button>
          </Link>
          <Link to="/conducts/student-attendance/statistics">
            <Button variant="outline" size="sm" className="rounded-xl border-border/40 hover:bg-primary/10 hover:text-primary transition-all font-black uppercase tracking-widest text-[10px] h-10 px-4">
              <IconChartBar className="mr-2 h-4 w-4" />
              {t.attendance.statistics()}
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
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.attendance.selectClassAndDate()}</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <Select value={classId} onValueChange={val => setClassId(val ?? '')}>
            <SelectTrigger className="w-[280px] h-12 rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold">
              <SelectValue placeholder={t.attendance.selectClass()} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl backdrop-blur-2xl bg-popover/90 border-border/40">
              {classes.map(c => (
                <SelectItem key={c.class.id} value={c.class.id} className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">
                  {c.grade?.name}
                  {' '}
                  {c.class.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePicker date={date} onSelect={d => d && setDate(d)} className="h-12 rounded-2xl bg-background/50 border-border/40 font-bold" />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {classId
          ? (
              <motion.div
                key={`${classId}-${dateStr}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.1 }}
              >
                <StudentAttendanceGrid
                  key={`${classId}-${dateStr}`}
                  className={className}
                  entries={entries}
                  onSave={handleSave}
                  isLoading={isLoading}
                  isSaving={mutation.isPending}
                />
              </motion.div>
            )
          : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-3xl border border-dashed border-border/60 bg-card/10 backdrop-blur-sm p-20 flex flex-col items-center text-center space-y-4"
              >
                <div className="p-4 rounded-full bg-primary/5">
                  <IconSparkles className="size-12 text-primary/40" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase tracking-tight text-muted-foreground/60">{t.attendance.selectClass()}</h3>
                  <p className="text-sm font-medium text-muted-foreground/40 italic">{t.attendance.selectClassAndDate()}</p>
                </div>
              </motion.div>
            )}
      </AnimatePresence>
    </div>
  )
}
