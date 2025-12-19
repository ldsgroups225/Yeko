import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FinanceStats, PaymentFormDialog, PaymentsTable } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { paymentsOptions } from '@/lib/queries'

export const Route = createFileRoute('/_auth/accounting/payments')({
  component: PaymentsPage,
})

function PaymentsPage() {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const { data: paymentsData, isLoading } = useQuery(
    paymentsOptions.list({
      status: statusFilter === 'all' ? undefined : statusFilter as 'completed' | 'pending' | 'cancelled',
      pageSize: 20,
    }),
  )

  const payments = paymentsData?.data?.map(p => ({
    id: p.id,
    receiptNumber: p.receiptNumber ?? undefined,
    studentName: p.payerName ?? 'N/A',
    studentMatricule: p.studentId ?? 'N/A',
    amount: Number(p.amount),
    method: p.method,
    status: p.status ?? 'pending',
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  })) ?? []

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.finance'), href: '/accounting' },
          { label: t('finance.payments.title') },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('finance.payments.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('finance.payments.description')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('common.filter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="completed">{t('finance.payments.status.completed')}</SelectItem>
              <SelectItem value="pending">{t('finance.payments.status.pending')}</SelectItem>
              <SelectItem value="cancelled">{t('finance.payments.status.cancelled')}</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setShowPaymentDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('finance.payments.recordPayment')}
          </Button>
        </div>
      </div>

      <FinanceStats
        totalPayments={paymentsData?.total ?? 0}
        isLoading={isLoading}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('finance.payments.recentPayments')}</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentsTable
            payments={payments}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <PaymentFormDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
      />
    </div>
  )
}
