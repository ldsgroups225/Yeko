import { IconPlus } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
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
import { FinanceStats, PaymentFormDialog, PaymentsTable } from '@/components/finance'
import { useTranslations } from '@/i18n'
import { financeStatsOptions, paymentsOptions } from '@/lib/queries'

export const Route = createFileRoute('/_auth/accounting/payments')({
  component: PaymentsPage,
})

function PaymentsPage() {
  const t = useTranslations()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const { data: paymentsData, isPending } = useQuery(
    paymentsOptions.list({
      status: statusFilter === 'all' ? undefined : statusFilter as 'completed' | 'pending' | 'cancelled',
      pageSize: 20,
    }),
  )

  const { data: statsData, isPending: statsPending } = useQuery(financeStatsOptions.summary())

  const payments = paymentsData?.data?.map(p => ({
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
      <div className="flex justify-end">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Select value={statusFilter} onValueChange={val => setStatusFilter(val ?? '')}>
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
      </div>

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
              isPending={isPending}
            />
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
