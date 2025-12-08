'use client'

import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
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

interface StudentFee {
  id: string
  studentName: string
  matricule: string
  className: string
  totalFees: number
  paidAmount: number
  balance: number
  status: string
}

interface StudentFeesTableProps {
  studentFees: StudentFee[]
  isLoading?: boolean
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'paid':
      return 'default'
    case 'partial':
      return 'secondary'
    case 'pending':
      return 'outline'
    case 'waived':
      return 'secondary'
    default:
      return 'destructive'
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function StudentFeesTable({ studentFees, isLoading }: StudentFeesTableProps) {
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

  if (studentFees.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t('finance.studentFees.noStudentFees')}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('students.matricule')}</TableHead>
          <TableHead>{t('students.name')}</TableHead>
          <TableHead>{t('classes.class')}</TableHead>
          <TableHead className="text-right">{t('finance.studentFees.totalFees')}</TableHead>
          <TableHead className="text-right">{t('finance.studentFees.paidAmount')}</TableHead>
          <TableHead className="text-right">{t('finance.studentFees.balance')}</TableHead>
          <TableHead>{t('common.status')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {studentFees.map(fee => (
          <TableRow key={fee.id}>
            <TableCell className="font-mono text-sm">{fee.matricule}</TableCell>
            <TableCell className="font-medium">{fee.studentName}</TableCell>
            <TableCell>{fee.className}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(fee.totalFees)}
              {' '}
              FCFA
            </TableCell>
            <TableCell className="text-right text-green-600">
              {formatCurrency(fee.paidAmount)}
              {' '}
              FCFA
            </TableCell>
            <TableCell className="text-right font-medium text-orange-600">
              {formatCurrency(fee.balance)}
              {' '}
              FCFA
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(fee.status)}>
                {t(`finance.payments.status.${fee.status}`)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
