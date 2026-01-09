import { IconSparkles } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { FinancialDashboard } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { refundsOptions, studentFeesOptions } from '@/lib/queries'

export const Route = createFileRoute('/_auth/accounting/dashboard')({
  component: FinanceDashboardPage,
})

function FinanceDashboardPage() {
  const t = useTranslations()

  const { data: studentsWithBalance, isLoading: isLoadingStudents } = useQuery(
    studentFeesOptions.withBalance(),
  )

  const { data: pendingRefunds, isLoading: isLoadingRefunds } = useQuery(
    refundsOptions.pendingCount(),
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

  const totalCollected = 0 // Not available in current query

  const totalOutstanding = studentsWithBalance?.reduce(
    (sum: number, s) => sum + Number(s.totalBalance ?? 0),
    0,
  ) ?? 0

  const collectionRate = totalExpectedRevenue > 0
    ? (totalCollected / totalExpectedRevenue) * 100
    : 0

  const isLoading = isLoadingStudents || isLoadingRefunds

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
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
          <IconSparkles className="size-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.finance.dashboard.title()}</h1>
          <p className="text-sm font-medium text-muted-foreground italic max-w-lg">{t.finance.title()}</p>
        </div>
      </motion.div>

      <FinancialDashboard
        totalExpectedRevenue={totalExpectedRevenue}
        totalCollected={totalCollected}
        totalOutstanding={totalOutstanding}
        collectionRate={collectionRate}
        totalStudents={totalStudents}
        studentsWithBalance={studentsWithBalanceCount}
        refundsPending={typeof pendingRefunds === 'number' ? pendingRefunds : 0}
        isLoading={isLoading}
      />
    </div>
  )
}
