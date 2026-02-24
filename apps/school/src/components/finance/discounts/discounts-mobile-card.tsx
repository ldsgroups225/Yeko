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
      className="p-4 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-md space-y-3"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="font-mono text-xs font-bold text-muted-foreground bg-muted/20 px-2 py-1 rounded-md">
            {discount.code}
          </div>
          <Badge
            variant={discount.status === 'active' ? 'default' : 'secondary'}
            className="capitalize rounded-md text-[10px]"
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
                className="h-8 w-8 rounded-lg -mr-2 -mt-2"
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
            className="backdrop-blur-xl bg-card/95 border-border/40 shadow-xl rounded-xl p-1"
          >
            <DropdownMenuItem
              onClick={() => onEdit?.(discount)}
              className="rounded-lg cursor-pointer focus:bg-primary/10 font-medium"
            >
              <IconEdit className="mr-2 h-4 w-4 text-muted-foreground" />
              {t.common.edit()}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem
              onClick={() => onDelete?.(discount)}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer font-medium"
            >
              <IconTrash className="mr-2 h-4 w-4" />
              {t.common.delete()}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <div className="font-bold text-lg">{discount.name}</div>
        <div className="flex gap-1 mt-2">
          <Badge variant="secondary" className="font-medium text-xs">
            {getTypeLabel(discount.type)}
          </Badge>
          {discount.autoApply && (
            <Badge
              variant="outline"
              className="text-[10px] bg-secondary/10 text-secondary border-secondary/20"
            >
              Auto
            </Badge>
          )}
          {discount.requiresApproval && (
            <Badge
              variant="outline"
              className="text-[10px] bg-accent/10 text-accent border-accent/20"
            >
              Approbation
            </Badge>
          )}
        </div>
      </div>

      <div className="p-3 rounded-xl bg-muted/20 border border-border/20 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {t.finance.discounts.value()}
        </span>
        <span className="font-bold text-lg text-primary">
          {formatValue(discount)}
        </span>
      </div>
    </motion.div>
  )
}
