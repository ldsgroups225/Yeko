import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BarChart3, Calendar, ClipboardCheck, History, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { StudentAttendanceGrid } from '@/components/attendance/student/student-attendance-grid'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslations } from '@/i18n'
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
  const t = useTranslations()
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
      toast.success(t.attendance.saved(), {
        className: 'rounded-2xl backdrop-blur-xl bg-background/80 border-border/40 font-bold',
      })
    },
    onError: () => {
      toast.error(t.attendance.saveFailed())
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
            <ClipboardCheck className="size-8 text-primary" />
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
              <History className="mr-2 h-4 w-4" />
              {t.attendance.history()}
            </Button>
          </Link>
          <Link to="/conducts/student-attendance/statistics">
            <Button variant="outline" size="sm" className="rounded-xl border-border/40 hover:bg-primary/10 hover:text-primary transition-all font-black uppercase tracking-widest text-[10px] h-10 px-4">
              <BarChart3 className="mr-2 h-4 w-4" />
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
          <Calendar className="size-3 text-muted-foreground/60" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.attendance.selectClassAndDate()}</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger className="w-[280px] h-12 rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold">
              <SelectValue placeholder={t.attendance.selectClass()} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl backdrop-blur-2xl bg-popover/90 border-border/40">
              <SelectItem value="class-1" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">6ème A</SelectItem>
              <SelectItem value="class-2" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">6ème B</SelectItem>
              <SelectItem value="class-3" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">5ème A</SelectItem>
            </SelectContent>
          </Select>
          <DatePicker date={date} onSelect={d => d && setDate(d)} className="h-12 rounded-2xl bg-background/50 border-border/40 font-bold" />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {classId
          ? (
              <motion.div
                key={classId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.1 }}
              >
                <StudentAttendanceGrid
                  className={classId}
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
                  <Sparkles className="size-12 text-primary/40" />
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
