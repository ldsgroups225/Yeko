import type { Payment } from './payments/payment-table-row'
import { IconCreditCard } from '@tabler/icons-react'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence } from 'motion/react'
import { useTranslations } from '@/i18n'
import { generateUUID } from '@/utils/generateUUID'
import { PaymentMobileCard } from './payments/payment-mobile-card'
import { PaymentTableRow } from './payments/payment-table-row'

export type { Payment }

interface PaymentsTableProps {
  payments: Payment[]
  isPending?: boolean
  onView?: (payment: Payment) => void
  onPrintReceipt?: (payment: Payment) => void
}

export function PaymentsTable({
  payments,
  isPending = false,
  onView,
  onPrintReceipt,
}: PaymentsTableProps) {
  const t = useTranslations()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString))
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      case 'refunded':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return t.finance.cash()
      case 'card':
        return t.finance.card()
      case 'transfer':
        return t.finance.transfer()
      case 'mobile_money':
        return t.finance.mobile()
      default:
        return method
    }
  }

  if (isPending) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map(() => (
          <Skeleton key={generateUUID()} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border-2 border-dashed border-border/30 rounded-xl bg-card/10 m-4">
        <div className="p-4 rounded-full bg-muted/20 mb-4">
          <IconCreditCard className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-medium">{t.finance.payments.noPayments()}</p>
        <p className="text-sm max-w-sm mt-1 text-muted-foreground/70">
          {t.finance.payments.description()}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="font-semibold">{t.finance.receipt()}</TableHead>
              <TableHead className="font-semibold">{t.students.student()}</TableHead>
              <TableHead className="font-semibold">{t.finance.amount()}</TableHead>
              <TableHead className="font-semibold">{t.finance.method()}</TableHead>
              <TableHead className="font-semibold">{t.common.status()}</TableHead>
              <TableHead className="font-semibold">{t.common.date()}</TableHead>
              <TableHead className="text-right font-semibold">{t.common.actions()}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {payments.map((payment, index) => (
                <PaymentTableRow
                  key={payment.id}
                  payment={payment}
                  index={index}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getStatusVariant={getStatusVariant}
                  getMethodLabel={getMethodLabel}
                  onView={onView}
                  onPrintReceipt={onPrintReceipt}
                />
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-4 p-4">
        <AnimatePresence>
          {payments.map((payment, index) => (
            <PaymentMobileCard
              key={payment.id}
              payment={payment}
              index={index}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getStatusVariant={getStatusVariant}
              getMethodLabel={getMethodLabel}
              onView={onView}
              onPrintReceipt={onPrintReceipt}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
