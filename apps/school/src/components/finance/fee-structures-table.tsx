'use client'

import { Pencil, Trash2 } from 'lucide-react'
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

interface FeeStructure {
  id: string
  feeTypeName: string
  feeTypeCode: string
  gradeName: string
  seriesName?: string
  amount: number
  newStudentAmount?: number
  currency: string
}

interface FeeStructuresTableProps {
  feeStructures: FeeStructure[]
  isLoading?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

function formatCurrency(amount: number, currency: string = 'XOF') {
  return `${new Intl.NumberFormat('fr-FR').format(amount)} ${currency === 'XOF' ? 'FCFA' : currency}`
}

export function FeeStructuresTable({ feeStructures, isLoading, onEdit, onDelete }: FeeStructuresTableProps) {
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

  if (feeStructures.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t('finance.feeStructures.noFeeStructures')}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('finance.feeTypes.title')}</TableHead>
          <TableHead>{t('grades.grade')}</TableHead>
          <TableHead>{t('series.series')}</TableHead>
          <TableHead className="text-right">{t('finance.amount')}</TableHead>
          <TableHead className="text-right">{t('finance.feeStructures.newStudentAmount')}</TableHead>
          <TableHead className="text-right">{t('common.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {feeStructures.map(structure => (
          <TableRow key={structure.id}>
            <TableCell>
              <div>
                <span className="font-medium">{structure.feeTypeName}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {structure.feeTypeCode}
                </Badge>
              </div>
            </TableCell>
            <TableCell>{structure.gradeName}</TableCell>
            <TableCell>{structure.seriesName || '-'}</TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(structure.amount, structure.currency)}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {structure.newStudentAmount
                ? formatCurrency(structure.newStudentAmount, structure.currency)
                : '-'}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit?.(structure.id)}
                  aria-label={t('common.edit')}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete?.(structure.id)}
                  aria-label={t('common.delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
