import type { PaymentFilters } from '@/lib/queries/payments'
import { IconPlus } from '@tabler/icons-react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { motion } from 'motion/react'
import { useState } from 'react'
import { FinanceStats } from '@/components/finance/finance-stats'
import { FinanceSubpageToolbar } from '@/components/finance/finance-subpage-toolbar'
import { PaymentFormDialog } from '@/components/finance/payment-form-dialog'
import { PaymentsTable } from '@/components/finance/payments-table'
import { useTranslations } from '@/i18n'
import { financeStatsOptions } from '@/lib/queries/finance-stats'
import { paymentsOptions } from '@/lib/queries/payments'

export const Route = createFileRoute('/_auth/settings/finance/payments')({
  component: PaymentsPage,
})

function PaymentsPage() {
  const t = useTranslations()
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const selectedStatus: PaymentFilters['status'] | undefined = statusFilter === 'all'
    ? undefined
    : statusFilter

  const {
    data: paymentsData,
    isPending,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    paymentsOptions.infiniteKeyset({
      status: selectedStatus,
      pageSize: 20,
    }),
  )

  const { data: statsData, isPending: statsPending } = useQuery(financeStatsOptions.summary())

  const payments = paymentsData?.pages.flatMap(page => page.data).map(p => ({
    id: p.id,
    receiptNumber: p.receiptNumber ?? undefined,
    studentName: p.studentName ?? 'N/A',
    studentMatricule: p.studentMatricule ?? 'N/A',
    amount: Number(p.amount),
    method: p.method,
    status: p.status ?? 'pending',
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  })) ?? []

  return (
    <div className="space-y-8 p-1">
      <FinanceSubpageToolbar
        actions={(
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                if (val === 'all' || val === 'completed' || val === 'pending' || val === 'cancelled') {
                  setStatusFilter(val)
                }
              }}
            >
              <SelectTrigger className="
                bg-card/50 border-border/40
                focus:ring-primary/20
                hover:bg-card/80
                h-10 w-[180px] rounded-xl font-bold shadow-sm backdrop-blur-xl
                transition-all
              "
              >
                <SelectValue placeholder={t.common.filter()} />
              </SelectTrigger>
              <SelectContent className="
                bg-popover/90 border-border/40 rounded-xl backdrop-blur-xl
              "
              >
                <SelectItem value="all" className="rounded-lg">{t.common.all()}</SelectItem>
                <SelectItem value="completed" className="rounded-lg">{t.finance.payments.status.completed()}</SelectItem>
                <SelectItem value="pending" className="rounded-lg">{t.finance.payments.status.pending()}</SelectItem>
                <SelectItem value="cancelled" className="rounded-lg">{t.finance.payments.status.cancelled()}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => setShowPaymentDialog(true)}
              className="shadow-primary/20 h-10 rounded-xl shadow-lg"
            >
              <IconPlus className="mr-2 h-4 w-4" />
              {t.finance.payments.recordPayment()}
            </Button>
          </motion.div>
        )}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FinanceStats
          totalRevenue={statsData?.totalRevenue ?? 0}
          totalPayments={statsData?.totalPayments ?? 0}
          pendingPayments={statsData?.pendingPayments ?? 0}
          overdueAmount={statsData?.overdueAmount ?? 0}
          isPending={isPending || statsPending}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="
          border-border/40 bg-card/40 overflow-hidden shadow-sm backdrop-blur-xl
        "
        >
          <CardHeader className="border-border/40 bg-muted/5 border-b">
            <CardTitle className="text-lg font-bold">{t.finance.payments.recentPayments()}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <PaymentsTable
              payments={payments}
              isPending={isPending && !paymentsData}
            />
            {payments.length > 0 && (
              <div className="border-border/30 flex justify-center border-t p-4">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={!hasNextPage || isFetchingNextPage}
                >
                  {isFetchingNextPage ? t.common.loading() : t.common.next()}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <PaymentFormDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
      />
    </div>
  )
}
