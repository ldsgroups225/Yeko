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
      <div className="
        text-muted-foreground border-border/30 bg-card/10 m-4 flex flex-col
        items-center justify-center rounded-xl border-2 border-dashed py-16
        text-center
      "
      >
        <div className="bg-muted/20 mb-4 rounded-full p-4">
          <IconCreditCard className="text-muted-foreground/50 h-8 w-8" />
        </div>
        <p className="text-lg font-medium">{t.finance.payments.noPayments()}</p>
        <p className="text-muted-foreground/70 mt-1 max-w-sm text-sm">
          {t.finance.payments.description()}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="
        hidden
        md:block
      "
      >
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="
              border-border/40
              hover:bg-transparent
            "
            >
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

      <div className="
        space-y-4 p-4
        md:hidden
      "
      >
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
