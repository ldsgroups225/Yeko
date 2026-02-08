import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import { lazy, Suspense } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { financeStatsOptions, refundsOptions, studentFeesOptions } from '@/lib/queries'

const FinancialDashboard = lazy(() => import('@/components/finance').then(m => ({ default: m.FinancialDashboard })))

export const Route = createFileRoute('/_auth/accounting/dashboard')({
  component: FinanceDashboardPage,
})

function FinanceDashboardPage() {
  const t = useTranslations()

  const { data: studentsWithBalance, isPending: isPendingStudents } = useQuery(
    studentFeesOptions.withBalance(),
  )

  const { data: pendingRefunds, isPending: isPendingRefunds } = useQuery(
    refundsOptions.pendingCount(),
  )

  const { data: financeStats, isPending: isPendingStats } = useQuery(
    financeStatsOptions.summary(),
  )

  // Calculate dashboard metrics
  const totalStudents = studentsWithBalance?.length ?? 0
  const studentsWithBalanceCount = studentsWithBalance?.filter(
    s => Number(s.totalBalance ?? 0) > 0,
  ).length ?? 0

  const totalExpectedRevenue = studentsWithBalance?.reduce(
    (sum: number, s) => sum + Number(s.totalBalance ?? 0),
    0,
  ) ?? 0

  const totalCollected = financeStats?.totalRevenue ?? 0

  const totalOutstanding = studentsWithBalance?.reduce(
    (sum: number, s) => sum + Number(s.totalBalance ?? 0),
    0,
  ) ?? 0

  const collectionRate = totalExpectedRevenue > 0
    ? (totalCollected / totalExpectedRevenue) * 100
    : 0

  const isPending = isPendingStudents || isPendingRefunds || isPendingStats

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.finance(), href: '/accounting' },
          { label: t.finance.dashboard.title() },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.finance.dashboard.title()}</h1>
          <p className="text-sm font-medium text-muted-foreground italic max-w-lg">{t.finance.title()}</p>
        </div>
      </motion.div>

      <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
        <FinancialDashboard
          totalExpectedRevenue={totalExpectedRevenue}
          totalCollected={totalCollected}
          totalOutstanding={totalOutstanding}
          collectionRate={collectionRate}
          totalStudents={totalStudents}
          studentsWithBalance={studentsWithBalanceCount}
          refundsPending={typeof pendingRefunds === 'number' ? pendingRefunds : 0}
          isPending={isPending}
        />
      </Suspense>
    </div>
  )
}
