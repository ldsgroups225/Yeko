import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { lazy, Suspense } from 'react'
import { PaymentsTable } from '@/components/finance'
import {
  financeStatsOptions,
  paymentsOptions,
  refundsOptions,
  studentFeesOptions,
} from '@/lib/queries'

const FinancialDashboard = lazy(() =>
  import('@/components/finance').then(m => ({ default: m.FinancialDashboard })),
)

export const Route = createFileRoute('/_auth/accounting/dashboard')({
  component: FinanceDashboardPage,
})

function FinanceDashboardPage() {
  const { data: studentsWithBalance, isPending: isPendingStudents } = useQuery(
    studentFeesOptions.withBalance(),
  )

  const { data: pendingRefunds, isPending: isPendingRefunds } = useQuery(
    refundsOptions.pendingCount(),
  )

  const { data: financeStats, isPending: isPendingStats } = useQuery(
    financeStatsOptions.summary(),
  )

  const { data: paymentsData, isPending: isPendingPayments } = useQuery(
    paymentsOptions.list({ pageSize: 5 }),
  )

  const totalStudents = studentsWithBalance?.length ?? 0
  const studentsWithBalanceCount
    = studentsWithBalance?.filter(s => Number(s.totalBalance ?? 0) > 0).length
      ?? 0

  const totalExpectedRevenue
    = studentsWithBalance?.reduce(
      (sum: number, s) => sum + Number(s.totalBalance ?? 0),
      0,
    ) ?? 0

  const totalCollected = financeStats?.totalRevenue ?? 0

  const totalOutstanding
    = studentsWithBalance?.reduce(
      (sum: number, s) => sum + Number(s.totalBalance ?? 0),
      0,
    ) ?? 0

  const collectionRate = totalExpectedRevenue > 0
    ? (totalCollected / totalExpectedRevenue) * 100
    : 0

  const isPending = isPendingStudents || isPendingRefunds || isPendingStats

  const recentPayments = (paymentsData?.data ?? []).slice(0, 5).map(p => ({
    id: p.id,
    receiptNumber: p.receiptNumber ?? undefined,
    studentName: p.studentName ?? 'N/A',
    studentMatricule: p.studentMatricule ?? 'N/A',
    amount: Number(p.amount),
    method: p.method,
    status: p.status ?? 'pending',
    createdAt:
      p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  }))

  return (
    <div className="space-y-8 p-1">
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

      <Card
        className="
          border-border/40 bg-card/40 overflow-hidden shadow-sm backdrop-blur-xl
        "
      >
        <CardHeader className="border-border/40 bg-muted/5 border-b">
          <CardTitle className="text-lg font-bold">5 derniers paiements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <PaymentsTable
            payments={recentPayments}
            isPending={isPendingPayments}
          />
        </CardContent>
      </Card>
    </div>
  )
}
