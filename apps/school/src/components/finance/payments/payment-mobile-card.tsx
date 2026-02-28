import type { Payment } from './payment-table-row'
import { IconEye, IconPrinter } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'

interface PaymentMobileCardProps {
  payment: Payment
  index: number
  formatCurrency: (amount: number) => string
  formatDate: (dateString: string) => string
  getStatusVariant: (status: string) => any
  getMethodLabel: (method: string) => string
  onView?: (payment: Payment) => void
  onPrintReceipt?: (payment: Payment) => void
}

export function PaymentMobileCard({
  payment,
  index,
  formatCurrency,
  formatDate,
  getStatusVariant,
  getMethodLabel,
  onView,
  onPrintReceipt,
}: PaymentMobileCardProps) {
  const t = useTranslations()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="
        bg-card/50 border-border/40 space-y-4 rounded-2xl border p-4
        backdrop-blur-md
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-bold">{payment.studentName}</div>
          <div className="text-muted-foreground mt-0.5 font-mono text-xs">
            {payment.receiptNumber || 'N/A'}
          </div>
        </div>
        <Badge
          variant={getStatusVariant(payment.status)}
          className="rounded-md capitalize"
        >
          {payment.status === 'pending' && t.finance.payments.status.pending()}
          {payment.status === 'completed' && t.finance.payments.status.completed()}
          {payment.status === 'cancelled' && t.finance.payments.status.cancelled()}
          {payment.status === 'refunded' && t.finance.payments.status.refunded()}
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="
          bg-muted/20 border-border/20 flex-1 rounded-xl border p-3
        "
        >
          <div className="
            text-muted-foreground mb-1 text-xs tracking-wider uppercase
          "
          >
            {t.finance.amount()}
          </div>
          <div className="text-lg font-bold">
            {formatCurrency(payment.amount)}
            {' '}
            <span className="text-muted-foreground text-sm font-normal">
              FCFA
            </span>
          </div>
        </div>
        <div className="
          bg-muted/20 border-border/20 flex-1 rounded-xl border p-3
        "
        >
          <div className="
            text-muted-foreground mb-1 text-xs tracking-wider uppercase
          "
          >
            {t.finance.method()}
          </div>
          <div className="font-bold">
            {getMethodLabel(payment.method)}
          </div>
        </div>
      </div>

      <div className="
        border-border/30 flex items-center justify-between border-t pt-2
      "
      >
        <div className="text-muted-foreground text-xs font-medium">
          {formatDate(payment.createdAt)}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 rounded-lg"
            onClick={() => onView?.(payment)}
          >
            <IconEye className="mr-2 h-3.5 w-3.5" />
            {t.common.view()}
          </Button>
          {payment.status === 'completed' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 rounded-lg"
              onClick={() => onPrintReceipt?.(payment)}
            >
              <IconPrinter className="mr-2 h-3.5 w-3.5" />
              {t.finance.receipt()}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
