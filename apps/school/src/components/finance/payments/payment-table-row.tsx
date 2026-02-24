import { IconDots, IconPrinter } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { TableCell } from '@workspace/ui/components/table'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'

export interface Payment {
  id: string
  receiptNumber?: string
  studentName: string
  studentMatricule: string
  amount: number
  method: string
  status: string
  createdAt: string
}

interface PaymentTableRowProps {
  payment: Payment
  index: number
  formatCurrency: (amount: number) => string
  formatDate: (dateString: string) => string
  getStatusVariant: (status: string) => any
  getMethodLabel: (method: string) => string
  onView?: (payment: Payment) => void
  onPrintReceipt?: (payment: Payment) => void
}

export function PaymentTableRow({
  payment,
  index,
  formatCurrency,
  formatDate,
  getStatusVariant,
  getMethodLabel,
  onView,
  onPrintReceipt,
}: PaymentTableRowProps) {
  const t = useTranslations()

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group hover:bg-muted/30 border-border/40 transition-colors cursor-pointer"
      onClick={() => onView?.(payment)}
    >
      <TableCell className="font-mono text-sm text-muted-foreground font-medium">
        {payment.receiptNumber || '-'}
      </TableCell>
      <TableCell>
        <div>
          <div className="font-bold text-foreground">{payment.studentName}</div>
          <div className="text-xs font-mono text-muted-foreground mt-0.5">
            {payment.studentMatricule}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="font-bold text-foreground">
          {formatCurrency(payment.amount)}
        </span>
        <span className="ml-1 text-xs text-muted-foreground uppercase">
          {t.common.currency()}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="bg-secondary/50 font-medium">
          {getMethodLabel(payment.method)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant={getStatusVariant(payment.status)}
          className="capitalize rounded-md"
        >
          {payment.status === 'pending' && t.finance.payments.status.pending()}
          {payment.status === 'completed' && t.finance.payments.status.completed()}
          {payment.status === 'cancelled' && t.finance.payments.status.cancelled()}
          {payment.status === 'refunded' && t.finance.payments.status.refunded()}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground font-medium">
        {formatDate(payment.createdAt)}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
              >
                <IconDots className="h-4 w-4" />
              </Button>
            )}
          />
          <DropdownMenuContent
            align="end"
            className="w-48 backdrop-blur-xl bg-card/95 border-border/40 shadow-xl rounded-xl p-1"
          >
            {payment.status === 'completed' && (
              <DropdownMenuItem
                onClick={() => onPrintReceipt?.(payment)}
                className="rounded-lg cursor-pointer focus:bg-primary/10 font-medium"
              >
                <IconPrinter className="mr-2 h-4 w-4 text-muted-foreground" />
                {t.finance.receipt()}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </motion.tr>
  )
}
