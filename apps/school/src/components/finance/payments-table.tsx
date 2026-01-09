'use client'

import { IconCreditCard, IconDots, IconEye, IconPrinter } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { generateUUID } from '@/utils/generateUUID'

interface Payment {
  id: string
  receiptNumber?: string
  studentName: string
  studentMatricule: string
  amount: number
  method: string
  status: string
  createdAt: string
}

interface PaymentsTableProps {
  payments: Payment[]
  isLoading?: boolean
  onView?: (payment: Payment) => void
  onPrintReceipt?: (payment: Payment) => void
}

export function PaymentsTable({
  payments,
  isLoading = false,
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

  if (isLoading) {
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
        <p className="text-sm max-w-sm mt-1 text-muted-foreground/70">{t.finance.payments.description()}</p>
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
                <motion.tr
                  key={payment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-muted/30 border-border/40 transition-colors"
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
                    <span className="font-bold text-foreground">{formatCurrency(payment.amount)}</span>
                    <span className="ml-1 text-xs text-muted-foreground uppercase">{t.common.currency()}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-secondary/50 font-medium">
                      {getMethodLabel(payment.method)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(payment.status)} className="capitalize rounded-md">
                      {{
                        pending: t.finance.payments.status.pending,
                        completed: t.finance.payments.status.completed,
                        cancelled: t.finance.payments.status.cancelled,
                        refunded: t.finance.payments.status.refunded,
                      }[payment.status as 'pending' | 'completed' | 'cancelled' | 'refunded']()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-medium">{formatDate(payment.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted">
                          <IconDots className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 backdrop-blur-xl bg-card/95 border-border/40 shadow-xl rounded-xl p-1">
                        <DropdownMenuItem onClick={() => onView?.(payment)} className="rounded-lg cursor-pointer focus:bg-primary/10 font-medium">
                          <IconEye className="mr-2 h-4 w-4 text-muted-foreground" />
                          {t.common.view()}
                        </DropdownMenuItem>
                        {payment.status === 'completed' && (
                          <DropdownMenuItem onClick={() => onPrintReceipt?.(payment)} className="rounded-lg cursor-pointer focus:bg-primary/10 font-medium">
                            <IconPrinter className="mr-2 h-4 w-4 text-muted-foreground" />
                            {t.finance.receipt()}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-4 p-4">
        <AnimatePresence>
          {payments.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-md space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">{payment.studentName}</div>
                  <div className="text-xs font-mono text-muted-foreground mt-0.5">{payment.receiptNumber || 'N/A'}</div>
                </div>
                <Badge variant={getStatusVariant(payment.status)} className="capitalize rounded-md">
                  {{
                    pending: t.finance.payments.status.pending,
                    completed: t.finance.payments.status.completed,
                    cancelled: t.finance.payments.status.cancelled,
                    refunded: t.finance.payments.status.refunded,
                  }[payment.status as 'pending' | 'completed' | 'cancelled' | 'refunded']()}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-muted/20 border border-border/20 flex-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t.finance.amount()}</div>
                  <div className="font-bold text-lg">
                    {formatCurrency(payment.amount)}
                    {' '}
                    <span className="text-sm font-normal text-muted-foreground">FCFA</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-border/20 flex-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t.finance.method()}</div>
                  <div className="font-bold">{getMethodLabel(payment.method)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <div className="text-xs font-medium text-muted-foreground">
                  {formatDate(payment.createdAt)}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="h-8 rounded-lg" onClick={() => onView?.(payment)}>
                    <IconEye className="mr-2 h-3.5 w-3.5" />
                    {t.common.view()}
                  </Button>
                  {payment.status === 'completed' && (
                    <Button size="sm" variant="ghost" className="h-8 rounded-lg" onClick={() => onPrintReceipt?.(payment)}>
                      <IconPrinter className="mr-2 h-3.5 w-3.5" />
                      {t.finance.receipt()}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
