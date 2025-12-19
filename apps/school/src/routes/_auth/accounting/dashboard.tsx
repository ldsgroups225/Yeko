import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { FinancialDashboard } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { refundsOptions, studentFeesOptions } from '@/lib/queries'

export const Route = createFileRoute('/_auth/accounting/dashboard')({
  component: FinanceDashboardPage,
})

function FinanceDashboardPage() {
  const { t } = useTranslation()

  const { data: studentsWithBalance, isLoading: isLoadingStudents } = useQuery(
    studentFeesOptions.withBalance(),
  )

  const { data: pendingRefunds, isLoading: isLoadingRefunds } = useQuery(
    refundsOptions.pendingCount(),
  )

  // Calculate dashboard metrics
  const totalStudents = studentsWithBalance?.length ?? 0
  const studentsWithBalanceCount = studentsWithBalance?.filter(
    (s: { balance?: string | null }) => Number(s.balance ?? 0) > 0,
  ).length ?? 0

  const totalExpectedRevenue = studentsWithBalance?.reduce(
    (sum: number, s: { totalFees?: string | null }) => sum + Number(s.totalFees ?? 0),
    0,
  ) ?? 0

  const totalCollected = studentsWithBalance?.reduce(
    (sum: number, s: { paidAmount?: string | null }) => sum + Number(s.paidAmount ?? 0),
    0,
  ) ?? 0

  const totalOutstanding = studentsWithBalance?.reduce(
    (sum: number, s: { balance?: string | null }) => sum + Number(s.balance ?? 0),
    0,
  ) ?? 0

  const collectionRate = totalExpectedRevenue > 0
    ? (totalCollected / totalExpectedRevenue) * 100
    : 0

  const isLoading = isLoadingStudents || isLoadingRefunds

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.finance'), href: '/accounting' },
          { label: t('finance.dashboard.title') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('finance.dashboard.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('finance.title')}
        </p>
      </div>

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
