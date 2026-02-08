import { IconAlertCircle, IconBook, IconChartBar, IconChevronRight, IconCircleCheck, IconClock, IconTrendingUp } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useSchoolContext } from '@/hooks/use-school-context'
import { useTranslations } from '@/i18n'
import { gradesOptions } from '@/lib/queries/grades'

export const Route = createFileRoute('/_auth/grades/')({
  component: GradesIndexPage,
})

function GradesIndexPage() {
  const t = useTranslations()
  const { schoolId, isPending: contextPending } = useSchoolContext()

  const { data: result, isPending: pendingLoading } = useQuery(
    gradesOptions.pending(schoolId ?? ''),
  )

  const pendingValidations = result || []
  const pendingCount = pendingValidations.length
  const totalPendingGrades = pendingValidations.reduce(
    (sum, v) => sum + (v.pendingCount || 0),
    0,
  ) ?? 0

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.nav.grades() },
        ]}
      />

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
          <IconBook className="size-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">{t.nav.grades()}</h1>
          <p className="text-muted-foreground font-medium italic">{t.academic.grades.description()}</p>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="overflow-hidden rounded-2xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl transition-all hover:shadow-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t.academic.grades.validations.title()}
              </CardTitle>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <IconClock className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              {pendingLoading || contextPending
                ? (
                    <Skeleton className="h-8 w-16" />
                  )
                : (
                    <div className="space-y-1">
                      <div className="text-3xl font-black tracking-tight">{pendingCount}</div>
                      <p className="text-xs font-medium text-muted-foreground/60">
                        {t.academic.grades.validations.pendingCount({ count: totalPendingGrades })}
                      </p>
                    </div>
                  )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="overflow-hidden rounded-2xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl transition-all hover:shadow-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t.academic.grades.statistics.classAverage()}
              </CardTitle>
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <IconChartBar className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-3xl font-black tracking-tight">{t.common.notAvailable()}</div>
                <p className="text-xs font-medium text-muted-foreground/60">
                  {t.academic.grades.statistics.description()}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="overflow-hidden rounded-2xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl transition-all hover:shadow-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {t.academic.grades.statistics.passRate()}
              </CardTitle>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <IconCircleCheck className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-3xl font-black tracking-tight">{t.common.notAvailable()}</div>
                <p className="text-xs font-medium text-muted-foreground/60">
                  {t.academic.grades.statistics.above15()}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pending Validations Alert */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur-sm overflow-hidden relative group">
            <CardContent className="flex flex-col sm:flex-row items-center gap-6 py-6 relative z-10">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 shadow-inner">
                <IconAlertCircle className="size-7" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">
                  {t.academic.grades.validations.pendingCount({ count: totalPendingGrades })}
                </h3>
                <p className="text-sm font-medium text-amber-700/70 dark:text-amber-300/70 max-w-xl italic">
                  {t.academic.grades.validations.description()}
                </p>
              </div>
              <Link to="/grades/validations" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto rounded-xl border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-all font-bold uppercase tracking-widest text-[10px] h-11 px-6">
                  {t.academic.grades.validations.viewDetails()}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-primary" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t.common.quickActions()}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            title={t.academic.grades.quickActions.entry()}
            description={t.academic.grades.quickActions.entryDescription()}
            icon={IconBook}
            href="/grades/entry"
            index={0}
          />
          <QuickActionCard
            title={t.academic.grades.quickActions.validations()}
            description={t.academic.grades.quickActions.validationsDescription()}
            icon={IconCircleCheck}
            href="/grades/validations"
            badge={pendingCount > 0 ? pendingCount : undefined}
            index={1}
          />
          <QuickActionCard
            title={t.academic.grades.quickActions.statistics()}
            description={t.academic.grades.quickActions.statisticsDescription()}
            icon={IconChartBar}
            href="/grades/statistics"
            index={2}
          />
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  badge,
  index,
}: {
  title: string
  description: string
  icon: React.ElementType
  href: string
  badge?: number
  index: number
}) {
  const t = useTranslations()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
    >
      <Link to={href} className="group h-full block">
        <Card className="relative overflow-hidden rounded-2xl border-border/40 bg-card/30 backdrop-blur-xl shadow-xl transition-all group-hover:bg-primary/5 group-hover:border-primary/30 group-hover:shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 text-primary shadow-inner border border-primary/10 group-hover:scale-110 transition-transform duration-500">
                <Icon className="size-6" />
              </div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold tracking-tight">{title}</CardTitle>
                {badge !== undefined && badge > 0 && (
                  <Badge variant="destructive" className="h-6 px-2 text-[10px] font-black uppercase tracking-widest rounded-full ring-2 ring-background">
                    {badge}
                  </Badge>
                )}
              </div>
            </div>
            <IconTrendingUp className="size-5 text-primary/20 group-hover:text-primary/40 transition-colors" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground/70 leading-relaxed italic">{description}</p>
            <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
              {t.academic.grades.quickActions.access()}
              <IconChevronRight className="ml-2 size-4" />
            </div>
          </CardContent>
          <div className="absolute bottom-0 right-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500" />
        </Card>
      </Link>
    </motion.div>
  )
}
