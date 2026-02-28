import type { DiscountsTableItem } from './discounts-table-row'
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'

interface DiscountMobileCardProps {
  discount: DiscountsTableItem
  index: number
  getTypeLabel: (type: string) => string
  formatValue: (discount: DiscountsTableItem) => string
  onEdit?: (discount: DiscountsTableItem) => void
  onDelete?: (discount: DiscountsTableItem) => void
}

export function DiscountMobileCard({
  discount,
  index,
  getTypeLabel,
  formatValue,
  onEdit,
  onDelete,
}: DiscountMobileCardProps) {
  const t = useTranslations()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="
        bg-card/50 border-border/40 space-y-3 rounded-2xl border p-4
        backdrop-blur-md
      "
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="
            text-muted-foreground bg-muted/20 rounded-md px-2 py-1 font-mono
            text-xs font-bold
          "
          >
            {discount.code}
          </div>
          <Badge
            variant={discount.status === 'active' ? 'default' : 'secondary'}
            className="rounded-md text-[10px] capitalize"
          >
            {discount.status === 'active'
              ? t.common.active()
              : t.common.inactive()}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(
              <Button
                variant="ghost"
                size="icon"
                className="-mt-2 -mr-2 h-8 w-8 rounded-lg"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
              >
                <IconDots className="h-4 w-4" />
              </Button>
            )}
          />
          <DropdownMenuContent
            align="end"
            className="
              bg-card/95 border-border/40 rounded-xl p-1 shadow-xl
              backdrop-blur-xl
            "
          >
            <DropdownMenuItem
              onClick={() => onEdit?.(discount)}
              className="
                focus:bg-primary/10
                cursor-pointer rounded-lg font-medium
              "
            >
              <IconEdit className="text-muted-foreground mr-2 h-4 w-4" />
              {t.common.edit()}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem
              onClick={() => onDelete?.(discount)}
              className="
                text-destructive
                focus:bg-destructive/10 focus:text-destructive
                cursor-pointer rounded-lg font-medium
              "
            >
              <IconTrash className="mr-2 h-4 w-4" />
              {t.common.delete()}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <div className="text-lg font-bold">{discount.name}</div>
        <div className="mt-2 flex gap-1">
          <Badge variant="secondary" className="text-xs font-medium">
            {getTypeLabel(discount.type)}
          </Badge>
          {discount.autoApply && (
            <Badge
              variant="outline"
              className="
                bg-secondary/10 text-secondary border-secondary/20 text-[10px]
              "
            >
              Auto
            </Badge>
          )}
          {discount.requiresApproval && (
            <Badge
              variant="outline"
              className="bg-accent/10 text-accent border-accent/20 text-[10px]"
            >
              Approbation
            </Badge>
          )}
        </div>
      </div>

      <div className="
        bg-muted/20 border-border/20 flex items-center justify-between
        rounded-xl border p-3
      "
      >
        <span className="text-muted-foreground text-sm font-medium">
          {t.finance.discounts.value()}
        </span>
        <span className="text-primary text-lg font-bold">
          {formatValue(discount)}
        </span>
      </div>
    </motion.div>
  )
}
