import { IconCalendar, IconChartBar, IconHistory } from '@tabler/icons-react'
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
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { classAttendanceOptions } from '@/lib/queries/student-attendance'
import { getClasses } from '@/school/functions/classes'
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

  const { schoolYearId } = useSchoolYearContext()

  const { data: classesResult } = useQuery({
    queryKey: ['classes', { schoolYearId }],
    queryFn: () => getClasses({ data: { schoolYearId: schoolYearId ?? undefined } }),
    enabled: !!schoolYearId,
  })

  const classes = classesResult?.success ? classesResult.data : []

  const dateStr = date.toISOString().split('T')[0] ?? ''

  const { data: attendanceResult, isPending } = useQuery({
    ...classAttendanceOptions(classId, dateStr),
    enabled: !!classId,
  })

  const mutation = useMutation({
    mutationKey: schoolMutationKeys.studentAttendance.bulkRecord,
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

  const attendanceData = attendanceResult || []
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
  const className = selectedClass
    ? `
      ${selectedClass.grade?.name ?? ''}
      ${selectedClass.class.section}
    `
    : ''

  return (
    <div className="space-y-8 p-1">
      <div className="flex justify-end gap-3">
        <Link to="/conducts/student-attendance/history">
          <Button
            variant="outline"
            size="sm"
            className="
              border-border/40
              hover:bg-primary/10 hover:text-primary
              h-10 rounded-xl px-4 text-[10px] font-black tracking-widest
              uppercase transition-all
            "
          >
            <IconHistory className="mr-2 h-4 w-4" />
            {t.attendance.history()}
          </Button>
        </Link>
        <Link to="/conducts/student-attendance/statistics">
          <Button
            variant="outline"
            size="sm"
            className="
              border-border/40
              hover:bg-primary/10 hover:text-primary
              h-10 rounded-xl px-4 text-[10px] font-black tracking-widest
              uppercase transition-all
            "
          >
            <IconChartBar className="mr-2 h-4 w-4" />
            {t.attendance.statistics()}
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          bg-card/20 border-border/40 rounded-3xl border p-6 backdrop-blur-xl
        "
      >
        <div className="mb-4 ml-1 flex items-center gap-2">
          <IconCalendar className="text-muted-foreground/60 size-3" />
          <span className="
            text-muted-foreground/60 text-[10px] font-black tracking-widest
            uppercase
          "
          >
            {t.attendance.selectClassAndDate()}
          </span>
        </div>
        <div className="flex flex-wrap gap-4">
          <Select value={classId} onValueChange={val => setClassId(val ?? '')}>
            <SelectTrigger className="
              bg-background/50 border-border/40
              focus:ring-primary/20
              h-12 w-[280px] rounded-2xl font-bold transition-all
            "
            >
              <SelectValue placeholder={t.attendance.selectClass()}>
                {selectedClass ? `${selectedClass.grade?.name ?? ''} ${selectedClass.class.section}` : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="
              bg-popover/90 border-border/40 rounded-2xl backdrop-blur-2xl
            "
            >
              {classes.map(c => (
                <SelectItem
                  key={c.class.id}
                  value={c.class.id}
                  className="
                    rounded-xl py-3 text-[10px] font-bold tracking-widest
                    uppercase
                  "
                >
                  {c.grade?.name}
                  {' '}
                  {c.class.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePicker
            date={date}
            onSelect={d => d && setDate(d)}
            className="
              bg-background/50 border-border/40 h-12 rounded-2xl font-bold
            "
          />
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
                  isPending={isPending}
                  isSaving={mutation.isPending}
                />
              </motion.div>
            )
          : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="
                  border-border/60 bg-card/10 flex flex-col items-center
                  space-y-4 rounded-3xl border border-dashed p-20 text-center
                  backdrop-blur-sm
                "
              >

                <div className="space-y-1">
                  <h3 className="
                    text-muted-foreground/60 text-xl font-black tracking-tight
                    uppercase
                  "
                  >
                    {t.attendance.selectClass()}
                  </h3>
                  <p className="
                    text-muted-foreground/40 text-sm font-medium italic
                  "
                  >
                    {t.attendance.selectClassAndDate()}
                  </p>
                </div>
              </motion.div>
            )}
      </AnimatePresence>
    </div>
  )
}
