import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { lazy, Suspense } from 'react'
import { PaymentsTable } from '@/components/finance/payments-table'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { enrollmentsOptions } from '@/lib/queries/enrollments'
import { financeStatsOptions } from '@/lib/queries/finance-stats'
import { paymentsOptions } from '@/lib/queries/payments'
import { refundsOptions } from '@/lib/queries/refunds'
import { studentFeesOptions } from '@/lib/queries/student-fees'

const FinancialDashboard = lazy(() =>
  import('@/components/finance/financial-dashboard').then(m => ({ default: m.FinancialDashboard })),
)

export const Route = createFileRoute('/_auth/accounting/dashboard')({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(studentFeesOptions.withBalance()),
      queryClient.ensureQueryData(refundsOptions.pendingCount()),
      queryClient.ensureQueryData(financeStatsOptions.summary()),
      queryClient.ensureQueryData(paymentsOptions.list({ pageSize: 5 })),
    ])
  },
  component: FinanceDashboardPage,
})

function FinanceDashboardPage() {
  const t = useTranslations()
  const { schoolYearId } = useSchoolYearContext()

  const { data: studentBalanceStats } = useSuspenseQuery({
    ...studentFeesOptions.withBalance(),
    select: (rows) => {
      const totalOutstanding = rows.reduce(
        (sum: number, student) => sum + Number(student.totalBalance ?? 0),
        0,
      )
      const studentsWithBalance = rows.filter(student => Number(student.totalBalance ?? 0) > 0).length
      return {
        studentsWithBalance,
        totalOutstanding,
      }
    },
  })

  const { data: enrollmentStats } = useQuery({
    ...enrollmentsOptions.statistics(schoolYearId ?? ''),
    enabled: !!schoolYearId,
  })

  const { data: pendingRefunds } = useSuspenseQuery(
    refundsOptions.pendingCount(),
  )

  const { data: financeStats } = useSuspenseQuery(
    financeStatsOptions.summary(),
  )

  const { data: recentPayments, isFetching: isPendingPayments } = useSuspenseQuery({
    ...paymentsOptions.list({ pageSize: 5 }),
    select: data => data.data.slice(0, 5).map(payment => ({
      id: payment.id,
      receiptNumber: payment.receiptNumber ?? undefined,
      studentName: payment.studentName ?? 'N/A',
      studentMatricule: payment.studentMatricule ?? 'N/A',
      amount: Number(payment.amount),
      method: payment.method,
      status: payment.status ?? 'pending',
      createdAt:
        payment.createdAt instanceof Date ? payment.createdAt.toISOString() : String(payment.createdAt),
    })),
  })

  const totalStudents = enrollmentStats?.total ?? studentBalanceStats.studentsWithBalance
  const studentsWithBalanceCount = studentBalanceStats.studentsWithBalance
  const totalOutstanding = studentBalanceStats.totalOutstanding
  const totalCollected = financeStats?.totalRevenue ?? 0
  const paymentsThisMonth = financeStats?.paymentsThisMonth ?? 0
  const totalExpectedRevenue = totalOutstanding + totalCollected

  const collectionRate = totalExpectedRevenue > 0
    ? (totalCollected / totalExpectedRevenue) * 100
    : 0

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
          paymentsThisMonth={paymentsThisMonth}
          refundsPending={typeof pendingRefunds === 'number' ? pendingRefunds : 0}
          isPending={false}
        />
      </Suspense>

      <Card
        className="
          border-border/40 bg-card/40 overflow-hidden shadow-sm backdrop-blur-xl
        "
      >
        <CardHeader className="border-border/40 bg-muted/5 border-b">
          <CardTitle className="text-lg font-bold">{t.dashboard.cashier.recentPayments()}</CardTitle>
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
