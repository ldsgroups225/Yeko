import { IconCreditCard, IconPlus } from '@tabler/icons-react'
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
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { financeStatsOptions, paymentsOptions } from '@/lib/queries'

export const Route = createFileRoute('/_auth/accounting/payments')({
  component: PaymentsPage,
})

function PaymentsPage() {
  const t = useTranslations()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const { data: paymentsData, isLoading } = useQuery(
    paymentsOptions.list({
      status: statusFilter === 'all' ? undefined : statusFilter as 'completed' | 'pending' | 'cancelled',
      pageSize: 20,
    }),
  )

  const { data: statsData, isLoading: statsLoading } = useQuery(financeStatsOptions.summary())

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
      <Breadcrumbs
        items={[
          { label: t.nav.finance(), href: '/accounting' },
          { label: t.finance.payments.title() },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
            <IconCreditCard className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.finance.payments.title()}</h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-lg">{t.finance.payments.description()}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Select value={statusFilter} onValueChange={val => setStatusFilter(val ?? '')}>
            <SelectTrigger className="w-[180px] h-10 rounded-xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all font-bold shadow-sm hover:bg-card/80">
              <SelectValue placeholder={t.common.filter()} />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
              <SelectItem value="all" className="rounded-lg">{t.common.all()}</SelectItem>
              <SelectItem value="completed" className="rounded-lg">{t.finance.payments.status.completed()}</SelectItem>
              <SelectItem value="pending" className="rounded-lg">{t.finance.payments.status.pending()}</SelectItem>
              <SelectItem value="cancelled" className="rounded-lg">{t.finance.payments.status.cancelled()}</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setShowPaymentDialog(true)} className="h-10 rounded-xl shadow-lg shadow-primary/20">
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
          isLoading={isLoading || statsLoading}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden shadow-sm">
          <CardHeader className="border-b border-border/40 bg-muted/5">
            <CardTitle className="text-lg font-bold">{t.finance.payments.recentPayments()}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <PaymentsTable
              payments={payments}
              isLoading={isLoading}
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
