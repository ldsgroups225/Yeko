import type { DiscountsTableItem } from './discounts/discounts-table-row'
import { IconTag } from '@tabler/icons-react'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence } from 'motion/react'
import { useTranslations } from '@/i18n'
import { generateUUID } from '@/utils/generateUUID'
import { DiscountMobileCard } from './discounts/discounts-mobile-card'
import { DiscountTableRow } from './discounts/discounts-table-row'

export type { DiscountsTableItem }

interface DiscountsTableProps {
  discounts: DiscountsTableItem[]
  isPending?: boolean
  onEdit?: (discount: DiscountsTableItem) => void
  onDelete?: (discount: DiscountsTableItem) => void
}

export function DiscountsTable({
  discounts,
  isPending = false,
  onEdit,
  onDelete,
}: DiscountsTableProps) {
  const t = useTranslations()

  const getTypeLabel = (type: string) => {
    const typeTranslations = {
      sibling: t.finance.discountTypes.sibling,
      scholarship: t.finance.discountTypes.scholarship,
      staff: t.finance.discountTypes.staff,
      early_payment: t.finance.discountTypes.early_payment,
      financial_aid: t.finance.discountTypes.financial_aid,
      other: t.finance.discountTypes.other,
    }
    return typeTranslations[type as keyof typeof typeTranslations]?.() || type
  }

  const formatValue = (discount: DiscountsTableItem) => {
    if (discount.calculationType === 'percentage') {
      return `${discount.value}%`
    }
    return `${new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(discount.value)} FCFA`
  }

  if (isPending) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map(() => (
          <Skeleton key={generateUUID()} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (discounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border-2 border-dashed border-border/30 rounded-xl bg-card/10 m-4">
        <div className="p-4 rounded-full bg-muted/20 mb-4">
          <IconTag className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-medium">{t.finance.discounts.noDiscounts()}</p>
        <p className="text-sm max-w-sm mt-1 text-muted-foreground/70">{t.finance.discounts.createDescription()}</p>
      </div>
    )
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="font-semibold">{t.finance.discounts.code()}</TableHead>
              <TableHead className="font-semibold">{t.common.name()}</TableHead>
              <TableHead className="font-semibold">{t.finance.discounts.type()}</TableHead>
              <TableHead className="font-semibold">{t.finance.discounts.value()}</TableHead>
              <TableHead className="font-semibold">{t.common.status()}</TableHead>
              <TableHead className="text-right font-semibold">{t.common.actions()}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {discounts.map((discount, index) => (
                <DiscountTableRow
                  key={discount.id}
                  discount={discount}
                  index={index}
                  getTypeLabel={getTypeLabel}
                  formatValue={formatValue}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-4 p-4">
        <AnimatePresence>
          {discounts.map((discount, index) => (
            <DiscountMobileCard
              key={discount.id}
              discount={discount}
              index={index}
              getTypeLabel={getTypeLabel}
              formatValue={formatValue}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
