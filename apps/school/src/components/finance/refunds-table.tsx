'use client'

import { Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

interface Refund {
  id: string
  studentName: string
  amount: number
  reason: string
  status: string
  requestedAt: string
}

interface RefundsTableProps {
  refunds: Refund[]
  isLoading?: boolean
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'approved':
      return 'default'
    case 'pending':
      return 'outline'
    case 'rejected':
      return 'destructive'
    case 'processed':
      return 'secondary'
    default:
      return 'outline'
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function RefundsTable({ refunds, isLoading, onApprove, onReject }: RefundsTableProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map(() => (
          <Skeleton key={generateUUID()} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (refunds.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t('finance.refunds.noRefunds')}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('students.student')}</TableHead>
          <TableHead className="text-right">{t('finance.amount')}</TableHead>
          <TableHead>{t('finance.refunds.reason')}</TableHead>
          <TableHead>{t('common.date')}</TableHead>
          <TableHead>{t('common.status')}</TableHead>
          <TableHead className="text-right">{t('common.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {refunds.map(refund => (
          <TableRow key={refund.id}>
            <TableCell className="font-medium">{refund.studentName}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(refund.amount)}
              {' '}
              FCFA
            </TableCell>
            <TableCell className="max-w-[200px] truncate">{refund.reason}</TableCell>
            <TableCell>{formatDate(refund.requestedAt)}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(refund.status)}>
                {t(`finance.refunds.status.${refund.status}`)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {refund.status === 'pending' && (
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600 hover:text-green-700"
                    onClick={() => onApprove?.(refund.id)}
                    aria-label={t('finance.refunds.approve')}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                    onClick={() => onReject?.(refund.id)}
                    aria-label={t('finance.refunds.reject')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
