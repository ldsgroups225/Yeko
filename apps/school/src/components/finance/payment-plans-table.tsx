'use client'

import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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

interface PaymentPlan {
  id: string
  studentName: string
  matricule: string
  totalAmount: number
  paidAmount: number
  installmentsCount: number
  paidInstallments: number
  status: string
}

interface PaymentPlansTableProps {
  paymentPlans: PaymentPlan[]
  isLoading?: boolean
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'completed':
      return 'default'
    case 'active':
      return 'secondary'
    case 'overdue':
      return 'destructive'
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

export function PaymentPlansTable({ paymentPlans, isLoading }: PaymentPlansTableProps) {
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

  if (paymentPlans.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t('finance.paymentPlans.noPaymentPlans')}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('students.matricule')}</TableHead>
          <TableHead>{t('students.name')}</TableHead>
          <TableHead className="text-right">{t('finance.paymentPlans.totalAmount')}</TableHead>
          <TableHead>{t('finance.paymentPlans.progress')}</TableHead>
          <TableHead>{t('finance.paymentPlans.installments')}</TableHead>
          <TableHead>{t('common.status')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paymentPlans.map((plan) => {
          const progressPercent = plan.totalAmount > 0
            ? Math.round((plan.paidAmount / plan.totalAmount) * 100)
            : 0

          return (
            <TableRow key={plan.id}>
              <TableCell className="font-mono text-sm">{plan.matricule}</TableCell>
              <TableCell className="font-medium">{plan.studentName}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(plan.totalAmount)}
                {' '}
                FCFA
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={progressPercent} className="h-2 w-20" />
                  <span className="text-sm text-muted-foreground">
                    {progressPercent}
                    %
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {plan.paidInstallments}
                /
                {plan.installmentsCount}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(plan.status)}>
                  {t(`finance.paymentPlans.status.${plan.status}`)}
                </Badge>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
