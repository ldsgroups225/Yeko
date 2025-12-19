import { Eye, MoreHorizontal, Printer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  const { t } = useTranslation()

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
        return t('finance.cash')
      case 'card':
        return t('finance.card')
      case 'transfer':
        return t('finance.transfer')
      case 'mobile_money':
        return t('finance.mobile')
      default:
        return method
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map(() => (
          <Skeleton key={generateUUID()} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{t('finance.payments.noPayments')}</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('finance.receipt')}</TableHead>
          <TableHead>{t('students.student')}</TableHead>
          <TableHead>{t('finance.amount')}</TableHead>
          <TableHead>{t('finance.method')}</TableHead>
          <TableHead>{t('common.status')}</TableHead>
          <TableHead>{t('common.date')}</TableHead>
          <TableHead className="text-right">{t('common.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map(payment => (
          <TableRow key={payment.id}>
            <TableCell className="font-medium">
              {payment.receiptNumber || '-'}
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{payment.studentName}</div>
                <div className="text-sm text-muted-foreground">
                  {payment.studentMatricule}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <span className="font-medium">{formatCurrency(payment.amount)}</span>
              <span className="ml-1 text-sm text-muted-foreground">{t('common.currency')}</span>
            </TableCell>
            <TableCell>{getMethodLabel(payment.method)}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(payment.status)}>
                {t(`finance.payments.status.${payment.status}`)}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(payment.createdAt)}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t('common.actions')}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView?.(payment)}>
                    <Eye className="mr-2 h-4 w-4" />
                    {t('common.view')}
                  </DropdownMenuItem>
                  {payment.status === 'completed' && (
                    <DropdownMenuItem onClick={() => onPrintReceipt?.(payment)}>
                      <Printer className="mr-2 h-4 w-4" />
                      {t('finance.receipt')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
