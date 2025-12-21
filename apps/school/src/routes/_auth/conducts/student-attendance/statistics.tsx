import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertTriangle, ArrowLeft, BarChart3, Filter, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
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
import { useTranslations } from '@/i18n'
import { attendanceStatisticsOptions } from '@/lib/queries/student-attendance'
import { cn } from '@/lib/utils'
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
  const t = useTranslations()
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.schoolLife(), href: '/conducts' },
          { label: t.schoolLife.studentAttendance(), href: '/conducts/student-attendance' },
          { label: t.attendance.statistics() },
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
            <BarChart3 className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.attendance.statistics()}</h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-md">{t.attendance.statisticsDescription()}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/conducts/student-attendance">
            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all font-black uppercase tracking-widest text-[10px]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.common.back()}
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
          <Filter className="size-3 text-muted-foreground/60" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.attendance.filters()}</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <Select value={classId || 'all'} onValueChange={v => setClassId(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[200px] h-12 rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold">
              <SelectValue placeholder={t.attendance.allClasses()} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl backdrop-blur-2xl bg-popover/90 border-border/40">
              <SelectItem value="all" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.attendance.allClasses()}</SelectItem>
              <SelectItem value="class-1" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">6ème A</SelectItem>
              <SelectItem value="class-2" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">6ème B</SelectItem>
            </SelectContent>
          </Select>
          <DatePicker date={startDate} onSelect={d => d && setStartDate(d)} className="h-12 rounded-2xl bg-background/50 border-border/40 font-bold" />
          <DatePicker date={endDate} onSelect={d => d && setEndDate(d)} className="h-12 rounded-2xl bg-background/50 border-border/40 font-bold" />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {isLoading
          ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
              >
                {Array.from({ length: 4 }).map(() => (
                  <Card key={generateUUID()} className="rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl p-6">
                    <Skeleton className="h-20 w-full rounded-2xl" />
                  </Card>
                ))}
              </motion.div>
            )
          : stats
            ? (
                <motion.div
                  key="stats"
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-8"
                >
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <motion.div variants={item}>
                      <Card className="relative overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl p-6 hover:translate-y-[-4px] transition-all group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                          <TrendingUp className="size-12" />
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.attendance.attendanceRate()}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black">{stats.attendanceRate.toFixed(1)}</span>
                            <span className="text-xl font-bold text-muted-foreground/60">%</span>
                          </div>
                          <Progress value={stats.attendanceRate} className="h-2 rounded-full bg-primary/10" />
                        </div>
                      </Card>
                    </motion.div>

                    <motion.div variants={item}>
                      <Card className="relative overflow-hidden rounded-3xl border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl shadow-xl p-6 hover:translate-y-[-4px] transition-all group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                          <ShieldCheck className="size-12 text-emerald-500" />
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">{t.attendance.status.present()}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-emerald-500">{stats.presentCount}</span>
                            <span className="text-sm font-bold text-emerald-500/60 uppercase tracking-widest">
                              {((stats.presentCount / (stats.totalStudents * stats.totalDays)) * 100).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="h-1 rounded-full bg-emerald-500/20 overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${(stats.presentCount / (stats.totalStudents * stats.totalDays)) * 100}%` }} />
                          </div>
                        </div>
                      </Card>
                    </motion.div>

                    <motion.div variants={item}>
                      <Card className="relative overflow-hidden rounded-3xl border-rose-500/20 bg-rose-500/5 backdrop-blur-xl shadow-xl p-6 hover:translate-y-[-4px] transition-all group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                          <AlertTriangle className="size-12 text-rose-500" />
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-rose-500/60">{t.attendance.status.absent()}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-rose-500">{stats.absentCount}</span>
                            <span className="text-sm font-bold text-rose-500/60 uppercase tracking-widest">
                              {((stats.absentCount / (stats.totalStudents * stats.totalDays)) * 100).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="h-1 rounded-full bg-rose-500/20 overflow-hidden">
                            <div className="h-full bg-rose-500" style={{ width: `${(stats.absentCount / (stats.totalStudents * stats.totalDays)) * 100}%` }} />
                          </div>
                        </div>
                      </Card>
                    </motion.div>

                    <motion.div variants={item}>
                      <Card className="relative overflow-hidden rounded-3xl border-orange-500/20 bg-orange-500/5 backdrop-blur-xl shadow-xl p-6 hover:translate-y-[-4px] transition-all group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                          <AlertTriangle className="size-12 text-orange-500" />
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-orange-500/60">{t.attendance.chronicAbsentees()}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-orange-500">{stats.chronicAbsentees}</span>
                          </div>
                          <p className="text-[10px] font-bold text-orange-500/60 italic uppercase tracking-widest">{t.attendance.studentsAtRisk()}</p>
                        </div>
                      </Card>
                    </motion.div>
                  </div>

                  <motion.div variants={item}>
                    <Card className="relative overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-2xl">
                      <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Sparkles className="size-32" />
                      </div>
                      <CardHeader className="relative border-b border-border/10 bg-muted/20">
                        <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                          <BarChart3 className="h-3 w-3" />
                          {t.attendance.breakdown()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-8 grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                          <BreakdownItem label={t.attendance.status.present()} value={stats.presentCount} total={stats.totalStudents * stats.totalDays} color="bg-emerald-500" />
                          <BreakdownItem label={t.attendance.status.late()} value={stats.lateCount} total={stats.totalStudents * stats.totalDays} color="bg-orange-400" />
                          <BreakdownItem label={t.attendance.status.absent()} value={stats.absentCount} total={stats.totalStudents * stats.totalDays} color="bg-rose-500" />
                          <BreakdownItem label={t.attendance.status.excused()} value={stats.excusedCount} total={stats.totalStudents * stats.totalDays} color="bg-blue-400" />
                        </div>
                        <div className="flex flex-col justify-center items-center text-center p-8 rounded-3xl bg-primary/5 border border-primary/10">
                          <div className="p-4 rounded-2xl bg-primary/10 mb-4">
                            <BarChart3 className="size-12 text-primary" />
                          </div>
                          <h4 className="text-lg font-black uppercase tracking-tight italic">{t.schoolLife.studentAttendance()}</h4>
                          <p className="text-sm font-medium text-muted-foreground italic mt-2 max-w-xs">{t.schoolLife.studentAttendanceDescription()}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              )
            : null}
      </AnimatePresence>
    </div>
  )
}

function BreakdownItem({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
  const percentage = (value / total) * 100
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-black">{value}</span>
          <span className="text-[10px] font-bold text-muted-foreground/60">
            (
            {percentage.toFixed(1)}
            %)
          </span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn('h-full', color)}
        />
      </div>
    </div>
  )
}
