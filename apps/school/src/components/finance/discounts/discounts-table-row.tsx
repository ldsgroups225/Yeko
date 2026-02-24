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
      className="group hover:bg-muted/30 border-border/40 transition-colors"
    >
      <TableCell className="font-mono text-sm font-medium text-muted-foreground">
        {discount.code}
      </TableCell>
      <TableCell>
        <div>
          <div className="font-bold text-foreground">
            {discount.name}
          </div>
          <div className="flex gap-1 mt-1">
            {discount.autoApply && (
              <Badge
                variant="outline"
                className="text-[10px] h-5 px-1.5 bg-secondary/10 text-secondary border-secondary/20"
              >
                Auto
              </Badge>
            )}
            {discount.requiresApproval && (
              <Badge
                variant="outline"
                className="text-[10px] h-5 px-1.5 bg-accent/10 text-accent border-accent/20"
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
      <TableCell className="font-bold text-primary">
        {formatValue(discount)}
      </TableCell>
      <TableCell>
        <Badge
          variant={discount.status === 'active' ? 'default' : 'secondary'}
          className="capitalize rounded-md"
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
                className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
      </TableCell>
    </motion.tr>
  )
}
