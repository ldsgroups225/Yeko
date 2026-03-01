import { IconAlertTriangle, IconArrowLeft, IconChartBar, IconFilter, IconShieldCheck, IconTrendingUp } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { DatePicker } from '@workspace/ui/components/date-picker'
import { Progress } from '@workspace/ui/components/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { attendanceStatisticsOptions } from '@/lib/queries/student-attendance'
import { cn } from '@/lib/utils'
import { getClasses } from '@/school/functions/classes'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/conducts/student-attendance/statistics')({
  component: StudentAttendanceStatisticsPage,
})

function StudentAttendanceStatisticsPage() {
  const t = useTranslations()
  const [classId, setClassId] = useState('')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [endDate, setEndDate] = useState(() => new Date())

  const { schoolYearId } = useSchoolYearContext()

  const { data: classesResult } = useQuery({
    queryKey: ['classes', { schoolYearId }],
    queryFn: () => getClasses({ data: { schoolYearId: schoolYearId ?? undefined } }),
    enabled: !!schoolYearId,
  })

  const classes = classesResult?.success ? classesResult.data : []

  const startDateStr = startDate.toISOString().split('T')[0] ?? ''
  const endDateStr = endDate.toISOString().split('T')[0] ?? ''

  const { data: result, isPending } = useQuery(
    attendanceStatisticsOptions({
      startDate: startDateStr,
      endDate: endDateStr,
      classId: classId || undefined,
    }),
  )

  const stats = result || undefined

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

      <div className="
        flex flex-col justify-between gap-6
        md:flex-row md:items-end
      "
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >

          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.attendance.statistics()}</h1>
            <p className="
              text-muted-foreground max-w-md text-sm font-medium italic
            "
            >
              {t.attendance.statisticsDescription()}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/conducts/student-attendance">
            <Button
              variant="ghost"
              size="sm"
              className="
                hover:bg-primary/10 hover:text-primary
                rounded-xl text-[10px] font-black tracking-widest uppercase
                transition-all
              "
            >
              <IconArrowLeft className="mr-2 h-4 w-4" />
              {t.common.back()}
            </Button>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          bg-card/20 border-border/40 rounded-3xl border p-6 backdrop-blur-xl
        "
      >
        <div className="mb-4 ml-1 flex items-center gap-2">
          <IconFilter className="text-muted-foreground/60 size-3" />
          <span className="
            text-muted-foreground/60 text-[10px] font-black tracking-widest
            uppercase
          "
          >
            {t.attendance.filters()}
          </span>
        </div>
        <div className="flex flex-wrap gap-4">
          <Select value={classId || 'all'} onValueChange={v => setClassId(v === 'all' || v === null ? '' : v)}>
            <SelectTrigger className="
              bg-background/50 border-border/40
              focus:ring-primary/20
              h-12 w-[200px] rounded-2xl font-bold transition-all
            "
            >
              <SelectValue placeholder={t.attendance.allClasses()} />
            </SelectTrigger>
            <SelectContent className="
              bg-popover/90 border-border/40 rounded-2xl backdrop-blur-2xl
            "
            >
              <SelectItem
                value="all"
                className="
                  rounded-xl py-3 text-[10px] font-bold tracking-widest
                  uppercase
                "
              >
                {t.attendance.allClasses()}
              </SelectItem>
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
            date={startDate}
            onSelect={d => d && setStartDate(d)}
            className="
              bg-background/50 border-border/40 h-12 rounded-2xl font-bold
            "
          />
          <DatePicker
            date={endDate}
            onSelect={d => d && setEndDate(d)}
            className="
              bg-background/50 border-border/40 h-12 rounded-2xl font-bold
            "
          />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {isPending
          ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="
                  grid gap-6
                  md:grid-cols-2
                  lg:grid-cols-4
                "
              >
                {Array.from({ length: 4 }).map(() => (
                  <Card
                    key={generateUUID()}
                    className="
                      border-border/40 bg-card/30 rounded-3xl p-6
                      backdrop-blur-xl
                    "
                  >
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
                  <div className="
                    grid gap-6
                    md:grid-cols-2
                    lg:grid-cols-4
                  "
                  >
                    <motion.div variants={item}>
                      <Card className="
                        border-border/40 bg-card/30 group relative
                        overflow-hidden rounded-3xl p-6 shadow-xl
                        backdrop-blur-xl transition-all
                        hover:translate-y-[-4px]
                      "
                      >
                        <div className="
                          absolute top-0 right-0 p-4 opacity-10
                          transition-transform
                          group-hover:scale-110
                        "
                        >
                          <IconTrendingUp className="size-12" />
                        </div>
                        <div className="space-y-4">
                          <p className="
                            text-muted-foreground/60 text-[10px] font-black
                            tracking-widest uppercase
                          "
                          >
                            {t.attendance.attendanceRate()}
                          </p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black">{stats.attendanceRate.toFixed(1)}</span>
                            <span className="
                              text-muted-foreground/60 text-xl font-bold
                            "
                            >
                              %
                            </span>
                          </div>
                          <Progress
                            value={stats.attendanceRate}
                            className="bg-primary/10 h-2 rounded-full"
                          />
                        </div>
                      </Card>
                    </motion.div>

                    <motion.div variants={item}>
                      <Card className="
                        border-success/20 bg-success/5 group relative
                        overflow-hidden rounded-3xl p-6 shadow-xl
                        backdrop-blur-xl transition-all
                        hover:translate-y-[-4px]
                      "
                      >
                        <div className="
                          absolute top-0 right-0 p-4 opacity-10
                          transition-transform
                          group-hover:scale-110
                        "
                        >
                          <IconShieldCheck className="text-success size-12" />
                        </div>
                        <div className="space-y-4">
                          <p className="
                            text-success/60 text-[10px] font-black
                            tracking-widest uppercase
                          "
                          >
                            {t.attendance.status.present()}
                          </p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-success text-4xl font-black">{stats.present}</span>
                            <span className="
                              text-success/60 text-sm font-bold tracking-widest
                              uppercase
                            "
                            >
                              {((stats.present / Math.max(1, stats.totalRecords)) * 100).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="
                            bg-success/20 h-1 overflow-hidden rounded-full
                          "
                          >
                            <div className="bg-success h-full" style={{ width: `${(stats.present / Math.max(1, stats.totalRecords)) * 100}%` }} />
                          </div>
                        </div>
                      </Card>
                    </motion.div>

                    <motion.div variants={item}>
                      <Card className="
                        border-destructive/20 bg-destructive/5 group relative
                        overflow-hidden rounded-3xl p-6 shadow-xl
                        backdrop-blur-xl transition-all
                        hover:translate-y-[-4px]
                      "
                      >
                        <div className="
                          absolute top-0 right-0 p-4 opacity-10
                          transition-transform
                          group-hover:scale-110
                        "
                        >
                          <IconAlertTriangle className="
                            text-destructive size-12
                          "
                          />
                        </div>
                        <div className="space-y-4">
                          <p className="
                            text-destructive/60 text-[10px] font-black
                            tracking-widest uppercase
                          "
                          >
                            {t.attendance.status.absent()}
                          </p>
                          <div className="flex items-baseline gap-2">
                            <span className="
                              text-destructive text-4xl font-black
                            "
                            >
                              {stats.absent}
                            </span>
                            <span className="
                              text-destructive/60 text-sm font-bold
                              tracking-widest uppercase
                            "
                            >
                              {((stats.absent / Math.max(1, stats.totalRecords)) * 100).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="
                            bg-destructive/20 h-1 overflow-hidden rounded-full
                          "
                          >
                            <div className="bg-destructive h-full" style={{ width: `${(stats.absent / Math.max(1, stats.totalRecords)) * 100}%` }} />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </div>

                  <motion.div variants={item}>
                    <Card className="
                      border-border/40 bg-card/30 relative overflow-hidden
                      rounded-3xl shadow-2xl backdrop-blur-xl
                    "
                    >

                      <CardHeader className="
                        border-border/10 bg-muted/20 relative border-b
                      "
                      >
                        <CardTitle className="
                          text-muted-foreground/60 flex items-center gap-2
                          text-[10px] font-black tracking-[0.2em] uppercase
                        "
                        >
                          <IconChartBar className="h-3 w-3" />
                          {t.attendance.breakdown()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="
                        grid gap-12 pt-8
                        md:grid-cols-2
                      "
                      >
                        <div className="space-y-6">
                          <BreakdownItem label={t.attendance.status.present()} value={stats.present} total={stats.totalRecords} color="bg-success" />
                          <BreakdownItem label={t.attendance.status.late()} value={stats.late} total={stats.totalRecords} color="bg-accent" />
                          <BreakdownItem label={t.attendance.status.absent()} value={stats.absent} total={stats.totalRecords} color="bg-destructive" />
                          <BreakdownItem label={t.attendance.status.excused()} value={stats.excused} total={stats.totalRecords} color="bg-secondary" />
                        </div>
                        <div className="
                          bg-primary/5 border-primary/10 flex flex-col
                          items-center justify-center rounded-3xl border p-8
                          text-center
                        "
                        >
                          <div className="bg-primary/10 mb-4 rounded-2xl p-4">
                            <IconChartBar className="text-primary size-12" />
                          </div>
                          <h4 className="
                            text-lg font-black tracking-tight uppercase italic
                          "
                          >
                            {t.schoolLife.studentAttendance()}
                          </h4>
                          <p className="
                            text-muted-foreground mt-2 max-w-xs text-sm
                            font-medium italic
                          "
                          >
                            {t.schoolLife.studentAttendanceDescription()}
                          </p>
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
  const percentage = total > 0 ? (value / total) * 100 : 0
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="
          text-muted-foreground/80 text-[10px] font-black tracking-widest
          uppercase
        "
        >
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-black">{value}</span>
          <span className="text-muted-foreground/60 text-[10px] font-bold">
            (
            {percentage.toFixed(1)}
            %)
          </span>
        </div>
      </div>
      <div className="bg-muted/20 h-2 overflow-hidden rounded-full">
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
