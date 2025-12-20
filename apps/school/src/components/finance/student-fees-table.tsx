'use client'

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
import { useTranslations } from '@/i18n'
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
  const t = useTranslations()

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
        {t.finance.studentFees.noStudentFees()}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.students.matricule()}</TableHead>
          <TableHead>{t.students.name()}</TableHead>
          <TableHead>{t.students.class()}</TableHead>
          <TableHead className="text-right">{t.finance.studentFees.totalFees()}</TableHead>
          <TableHead className="text-right">{t.finance.studentFees.paidAmount()}</TableHead>
          <TableHead className="text-right">{t.finance.studentFees.balance()}</TableHead>
          <TableHead>{t.common.status()}</TableHead>
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
                {{
                  pending: t.finance.payments.status.pending,
                  completed: t.finance.payments.status.completed,
                  cancelled: t.finance.payments.status.cancelled,
                  refunded: t.finance.payments.status.refunded,
                  paid: t.finance.payments.status.completed,
                  partial: t.finance.payments.status.pending,
                  waived: t.finance.payments.status.cancelled,
                }[fee.status as 'pending' | 'completed' | 'cancelled' | 'refunded' | 'paid' | 'partial' | 'waived']()}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
