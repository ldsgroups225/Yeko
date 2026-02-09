import { IconAlertTriangle, IconArrowLeft, IconChartBar, IconChartPie, IconFilter, IconInfoCircle, IconShieldCheck, IconTrendingUp, IconTrophy } from '@tabler/icons-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { ConductSeverityBadge } from '@/components/conduct/conduct-severity-badge'
import { ConductTypeBadge } from '@/components/conduct/conduct-type-badge'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { conductRecordsOptions } from '@/lib/queries/conduct-records'
import { getClasses } from '@/school/functions/classes'
import { getSchoolYears } from '@/school/functions/school-years'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/conducts/conduct/reports')({
  component: ConductReportsPage,
})

function ConductReportsPage() {
  const t = useTranslations()
  const [classId, setClassId] = useState('')
  const [type, setType] = useState<'incident' | 'sanction' | 'reward' | 'note' | undefined>()
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d
  })
  const [endDate, setEndDate] = useState(() => new Date())

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

  const startDateStr = startDate.toISOString().split('T')[0] ?? ''
  const endDateStr = endDate.toISOString().split('T')[0] ?? ''

  const { data: result, isPending } = useQuery({
    ...conductRecordsOptions({
      schoolYearId: schoolYearId || '',
      classId: classId || undefined,
      type,
      startDate: startDateStr,
      endDate: endDateStr,
      pageSize: 100,
    }),
    enabled: !!schoolYearId,
  })

  const rawRecords = result ? (result.data ?? []) : []

  // Calculate statistics
  const stats = {
    total: rawRecords.length,
    incidents: rawRecords.filter(r => r.type === 'incident').length,
    sanctions: rawRecords.filter(r => r.type === 'sanction').length,
    rewards: rawRecords.filter(r => r.type === 'reward').length,
    bySeverity: {
      low: rawRecords.filter(r => r.severity === 'low').length,
      medium: rawRecords.filter(r => r.severity === 'medium').length,
      high: rawRecords.filter(r => r.severity === 'high').length,
      critical: rawRecords.filter(r => r.severity === 'critical').length,
    },
    byCategory: rawRecords.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] ?? 0) + 1
      return acc
    }, {} as Record<string, number>),
  }

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
          { label: t.schoolLife.conduct(), href: '/conducts/conduct' },
          { label: t.conduct.reports() },
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
            <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.conduct.reports()}</h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-md">{t.conduct.reportsDescription()}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/conducts/conduct">
            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all font-black uppercase tracking-widest text-[10px]">
              <IconArrowLeft className="mr-2 h-4 w-4" />
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
          <IconFilter className="size-3 text-muted-foreground/60" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.conduct.filters()}</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <Select value={classId || 'all'} onValueChange={v => setClassId(v === 'all' || v === null ? '' : v)}>
            <SelectTrigger className="w-[200px] h-12 rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold">
              <SelectValue placeholder={t.conduct.allClasses()} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl backdrop-blur-2xl bg-popover/90 border-border/40">
              <SelectItem value="all" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.conduct.allClasses()}</SelectItem>
              {classes.map(c => (
                <SelectItem key={c.class.id} value={c.class.id} className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">
                  {c.grade?.name}
                  {' '}
                  {c.class.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={type ?? 'all'} onValueChange={v => setType(v === 'all' || v === null ? undefined : v as typeof type)}>
            <SelectTrigger className="w-[180px] h-12 rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold">
              <SelectValue placeholder={t.conduct.allTypes()} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl backdrop-blur-2xl bg-popover/90 border-border/40">
              <SelectItem value="all" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.conduct.allTypes()}</SelectItem>
              <SelectItem value="incident" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.conduct.type.incident()}</SelectItem>
              <SelectItem value="sanction" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.conduct.type.sanction()}</SelectItem>
              <SelectItem value="reward" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.conduct.type.reward()}</SelectItem>
              <SelectItem value="note" className="rounded-xl font-bold uppercase tracking-widest text-[10px] py-3">{t.conduct.type.note()}</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <DatePicker date={startDate} onSelect={d => d && setStartDate(d)} className="h-12 rounded-2xl bg-background/50 border-border/40 font-bold" />
            <DatePicker date={endDate} onSelect={d => d && setEndDate(d)} className="h-12 rounded-2xl bg-background/50 border-border/40 font-bold" />
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {isPending
          ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6 md:grid-cols-4"
              >
                {Array.from({ length: 4 }).map(() => (
                  <Skeleton key={`skeleton-${generateUUID()}`} className="h-32 rounded-3xl" />
                ))}
              </motion.div>
            )
          : (
              <motion.div
                key="content"
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-8"
              >
                <div className="grid gap-6 md:grid-cols-4">
                  <motion.div variants={item}>
                    <Card className="relative overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <IconTrendingUp className="size-16 text-primary" />
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.conduct.totalRecords()}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-black tracking-tight">{stats.total}</div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={item}>
                    <Card className="relative overflow-hidden rounded-3xl border-destructive/20 bg-destructive/5 backdrop-blur-xl shadow-xl group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <IconAlertTriangle className="size-16 text-destructive" />
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-destructive/60">{t.conduct.type.incident()}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-black tracking-tight text-destructive">{stats.incidents}</div>
                        <Progress
                          value={stats.total > 0 ? (stats.incidents / stats.total) * 100 : 0}
                          className="mt-4 h-1.5 bg-destructive/10 [&>div]:bg-destructive"
                        />
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={item}>
                    <Card className="relative overflow-hidden rounded-3xl border-accent/20 bg-accent/5 backdrop-blur-xl shadow-xl group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <IconShieldCheck className="size-16 text-accent-foreground" />
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-accent-foreground/60">{t.conduct.type.sanction()}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-black tracking-tight text-accent-foreground">{stats.sanctions}</div>
                        <Progress
                          value={stats.total > 0 ? (stats.sanctions / stats.total) * 100 : 0}
                          className="mt-4 h-1.5 bg-accent/10 [&>div]:bg-accent"
                        />
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={item}>
                    <Card className="relative overflow-hidden rounded-3xl border-success/20 bg-success/5 backdrop-blur-xl shadow-xl group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <IconTrophy className="size-16 text-success" />
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-success/60">{t.conduct.type.reward()}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-black tracking-tight text-success">{stats.rewards}</div>
                        <Progress
                          value={stats.total > 0 ? (stats.rewards / stats.total) * 100 : 0}
                          className="mt-4 h-1.5 bg-success/10 [&>div]:bg-success"
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <motion.div variants={item}>
                    <Card className="rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl h-full">
                      <CardHeader className="border-b border-border/10 bg-muted/20">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                          <IconChartPie className="size-3" />
                          {t.conduct.bySeverity()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {(['low', 'medium', 'high', 'critical'] as const).map(severity => (
                            <div key={severity} className="flex items-center justify-between group">
                              <ConductSeverityBadge severity={severity} />
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-black text-muted-foreground/40">
                                  {Math.round((stats.bySeverity[severity] / (stats.total || 1)) * 100)}
                                  %
                                </span>
                                <span className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">{stats.bySeverity[severity]}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={item}>
                    <Card className="rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl h-full">
                      <CardHeader className="border-b border-border/10 bg-muted/20">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                          <IconChartBar className="size-3" />
                          {t.conduct.byCategory()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {Object.entries(stats.byCategory)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([category, count]) => (
                              <div key={category} className="space-y-1.5 group">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 transition-colors group-hover:text-primary">
                                    {(() => {
                                      switch (category) {
                                        case 'behavior': return t.conduct.category.behavior()
                                        case 'academic': return t.conduct.category.academic()
                                        case 'attendance': return t.conduct.category.attendance()
                                        case 'uniform': return t.conduct.category.uniform()
                                        case 'property': return t.conduct.category.property()
                                        case 'violence': return t.conduct.category.violence()
                                        case 'bullying': return t.conduct.category.bullying()
                                        case 'cheating': return t.conduct.category.cheating()
                                        case 'achievement': return t.conduct.category.achievement()
                                        case 'improvement': return t.conduct.category.improvement()
                                        case 'other': return t.conduct.category.other()
                                        default: return category
                                      }
                                    })()}
                                  </span>
                                  <span className="font-black tracking-tight">{count}</span>
                                </div>
                                <Progress value={(count / (stats.total || 1)) * 100} className="h-1 bg-muted/20" />
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                <motion.div variants={item}>
                  <Card className="rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-border/10 bg-muted/20">
                      <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                        <IconInfoCircle className="size-3" />
                        {t.conduct.recentRecords()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader className="bg-muted/10">
                          <TableRow className="hover:bg-transparent border-border/10 h-14">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-6">{t.conduct.date()}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.conduct.student()}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Type</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.conduct.title()}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-6">Severity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rawRecords.slice(0, 10).map(record => (
                            <TableRow key={record.id} className="border-border/10 hover:bg-muted/10 transition-colors h-16">
                              <TableCell className="px-6">
                                <div className="font-black tracking-tight">
                                  {record.incidentDate
                                    ? new Date(record.incidentDate).toLocaleDateString()
                                    : new Date(record.createdAt).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-black tracking-tight text-primary hover:underline cursor-pointer">
                                  {record.studentName ?? 'Unknown'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <ConductTypeBadge type={record.type as 'incident' | 'sanction' | 'reward' | 'note'} />
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate font-medium text-muted-foreground italic">
                                {record.title}
                              </TableCell>
                              <TableCell className="px-6 text-right">
                                {record.severity
                                  ? (
                                      <ConductSeverityBadge severity={record.severity as 'low' | 'medium' | 'high' | 'critical' | 'urgent'} />
                                    )
                                  : (
                                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">—</span>
                                    )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {rawRecords.length > 10 && (
                        <div className="p-4 border-t border-border/10 bg-muted/5 flex justify-center">
                          <Link to="/conducts/conduct">
                            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest hover:text-primary">
                              {t.common.view()}
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
      </AnimatePresence>
    </div>
  )
}
