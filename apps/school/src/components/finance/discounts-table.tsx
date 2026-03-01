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
      <div className="
        text-muted-foreground border-border/30 bg-card/10 m-4 flex flex-col
        items-center justify-center rounded-xl border-2 border-dashed py-16
        text-center
      "
      >
        <div className="bg-muted/20 mb-4 rounded-full p-4">
          <IconTag className="text-muted-foreground/50 h-8 w-8" />
        </div>
        <p className="text-lg font-medium">{t.finance.discounts.noDiscounts()}</p>
        <p className="text-muted-foreground/70 mt-1 max-w-sm text-sm">{t.finance.discounts.createDescription()}</p>
      </div>
    )
  }

  return (
    <>
      <div className="
        hidden
        md:block
      "
      >
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="
              border-border/40
              hover:bg-transparent
            "
            >
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

      <div className="
        space-y-4 p-4
        md:hidden
      "
      >
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
