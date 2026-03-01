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
import { TableCell } from '@workspace/ui/components/table'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'

export interface DiscountsTableItem {
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

interface DiscountTableRowProps {
  discount: DiscountsTableItem
  index: number
  getTypeLabel: (type: string) => string
  formatValue: (discount: DiscountsTableItem) => string
  onEdit?: (discount: DiscountsTableItem) => void
  onDelete?: (discount: DiscountsTableItem) => void
}

export function DiscountTableRow({
  discount,
  index,
  getTypeLabel,
  formatValue,
  onEdit,
  onDelete,
}: DiscountTableRowProps) {
  const t = useTranslations()

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="
        group
        hover:bg-muted/30
        border-border/40 transition-colors
      "
    >
      <TableCell className="text-muted-foreground font-mono text-sm font-medium">
        {discount.code}
      </TableCell>
      <TableCell>
        <div>
          <div className="text-foreground font-bold">
            {discount.name}
          </div>
          <div className="mt-1 flex gap-1">
            {discount.autoApply && (
              <Badge
                variant="outline"
                className="
                  bg-secondary/10 text-secondary border-secondary/20 h-5 px-1.5
                  text-[10px]
                "
              >
                Auto
              </Badge>
            )}
            {discount.requiresApproval && (
              <Badge
                variant="outline"
                className="
                  bg-accent/10 text-accent border-accent/20 h-5 px-1.5
                  text-[10px]
                "
              >
                Approbation
              </Badge>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-medium">
          {getTypeLabel(discount.type)}
        </Badge>
      </TableCell>
      <TableCell className="text-primary font-bold">
        {formatValue(discount)}
      </TableCell>
      <TableCell>
        <Badge
          variant={discount.status === 'active' ? 'default' : 'secondary'}
          className="rounded-md capitalize"
        >
          {discount.status === 'active'
            ? t.common.active()
            : t.common.inactive()}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(
              <Button
                variant="ghost"
                size="icon"
                className="
                  h-8 w-8 rounded-lg opacity-0 transition-opacity
                  group-hover:opacity-100
                "
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
      </TableCell>
    </motion.tr>
  )
}
