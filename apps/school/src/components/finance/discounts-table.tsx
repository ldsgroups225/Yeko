import { Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

interface Discount {
  id: string
  code: string
  name: string
  type: string
  calculationType: string
  value: number
  requiresApproval: boolean
  autoApply: boolean
  status: string
}

interface DiscountsTableProps {
  discounts: Discount[]
  isLoading?: boolean
  onEdit?: (discount: Discount) => void
  onDelete?: (discount: Discount) => void
}

export function DiscountsTable({
  discounts,
  isLoading = false,
  onEdit,
  onDelete,
}: DiscountsTableProps) {
  const { t } = useTranslation()

  const getTypeLabel = (type: string) => {
    const key = `finance.discountTypes.${type}` as const
    return t(key)
  }

  const formatValue = (discount: Discount) => {
    if (discount.calculationType === 'percentage') {
      return `${discount.value}%`
    }
    return `${new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(discount.value)} FCFA`
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map(() => (
          <Skeleton key={generateUUID()} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (discounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{t('finance.discounts.noDiscounts')}</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('finance.discounts.code')}</TableHead>
          <TableHead>{t('common.name')}</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Valeur</TableHead>
          <TableHead>{t('common.status')}</TableHead>
          <TableHead className="text-right">{t('common.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {discounts.map(discount => (
          <TableRow key={discount.id}>
            <TableCell className="font-mono text-sm">{discount.code}</TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{discount.name}</div>
                <div className="flex gap-1 mt-1">
                  {discount.autoApply && (
                    <Badge variant="outline" className="text-xs">
                      Auto
                    </Badge>
                  )}
                  {discount.requiresApproval && (
                    <Badge variant="outline" className="text-xs">
                      Approbation
                    </Badge>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>{getTypeLabel(discount.type)}</TableCell>
            <TableCell className="font-medium">{formatValue(discount)}</TableCell>
            <TableCell>
              <Badge variant={discount.status === 'active' ? 'default' : 'secondary'}>
                {discount.status === 'active' ? t('common.active') : t('common.inactive')}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t('common.actions')}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(discount)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t('common.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(discount)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('common.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
