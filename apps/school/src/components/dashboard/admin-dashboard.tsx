import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { dashboardOptions } from '@/lib/queries/dashboard'
import { ActivitiesAlertsSection } from './admin-dashboard/components/activities-alerts-section'
import { ChartsSection } from './admin-dashboard/components/charts-section'
import { MetricsSection } from './admin-dashboard/components/metrics-section'
import { QuickActionsSection } from './admin-dashboard/components/quick-actions-section'
import { container, formatMonthLabel } from './admin-dashboard/constants'

export function AdminDashboard() {
  const t = useTranslations()
  const { schoolYearId } = useSchoolYearContext()
  const { data, isPending } = useQuery(dashboardOptions.admin(schoolYearId || undefined))

  if (isPending) {
    return <DashboardSkeleton />
  }

  const metrics = data?.metrics
  const charts = data?.charts

  const totalGender = charts?.genderDistribution?.reduce((sum, g) => sum + g.count, 0) ?? 0

  const revenueChartData = (charts?.revenueLast6Months ?? []).map(m => ({
    name: formatMonthLabel(m.month),
    value: m.revenue,
  }))

  const enrollmentChartData = (charts?.enrollmentByGrade ?? []).map(g => ({
    name: g.gradeName,
    value: g.count,
  }))

  const genderChartData = (charts?.genderDistribution ?? []).map(g => ({
    name: g.gender === 'M' ? t.students.male() : g.gender === 'F' ? t.students.female() : t.students.other(),
    value: g.count,
    color: g.gender === 'F' ? '#ec4899' : '#3b82f6',
  }))

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <MetricsSection metrics={metrics} t={t} />

      <ChartsSection
        revenueData={revenueChartData}
        enrollmentData={enrollmentChartData}
        genderData={genderChartData}
        totalGender={totalGender}
        t={t}
      />

      <div className="
        grid gap-4
        lg:grid-cols-3
      "
      >
        <QuickActionsSection t={t} />
      </div>

      <ActivitiesAlertsSection metrics={metrics} t={t} />
    </motion.div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>
      <div className="
        grid gap-4
        md:grid-cols-2
        lg:grid-cols-4
      "
      >
        {Array.from({ length: 4 }, (_, i) => `metric-${i}`).map(key => (
          <Skeleton key={key} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="
        grid gap-4
        lg:grid-cols-2
      "
      >
        <Skeleton className="h-[380px] rounded-xl" />
        <Skeleton className="h-[380px] rounded-xl" />
      </div>
      <div className="
        grid gap-4
        lg:grid-cols-3
      "
      >
        <Skeleton className="h-[300px] rounded-xl" />
        <Skeleton className="
          h-[300px] rounded-xl
          lg:col-span-2
        "
        />
      </div>
    </div>
  )
}
