import { IconChevronRight, IconDots, IconEdit, IconTrash } from '@tabler/icons-react'
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
import { cn } from '@/lib/utils'
import { formatCurrency, getTypeColor, getTypeLabel } from './account-utils'

interface AccountTableRowProps {
  account: any
  index: number
  onEdit?: (account: any) => void
  onDelete?: (account: any) => void
  t: any
}

export function AccountTableRow({ account, index, onEdit, onDelete, t }: AccountTableRowProps) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        `
          group
          hover:bg-muted/30
          border-border/40 transition-colors
        `,
        {
          'bg-muted/5': account.isHeader,
        },
      )}
    >
      <TableCell className="text-muted-foreground font-mono text-sm font-medium">
        {account.code}
      </TableCell>
      <TableCell>
        <div
          className={cn('flex items-center gap-2', {
            'text-foreground font-bold': account.isHeader,
            'font-medium': !account.isHeader,
          })}
          style={{ paddingLeft: `${(account.level - 1) * 24}px` }}
        >
          {account.level > 1 && (
            <IconChevronRight className="text-muted-foreground/50 h-3.5 w-3.5" />
          )}
          {account.name}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn(
            'border font-medium',
            getTypeColor(account.type),
          )}
        >
          {getTypeLabel(account.type)}
        </Badge>
      </TableCell>
      <TableCell className="text-right font-bold tabular-nums">
        {!account.isHeader && (
          <>
            {formatCurrency(account.balance)}
            {' '}
            <span className="text-muted-foreground ml-1 text-xs font-medium">
              FCFA
            </span>
          </>
        )}
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
              onClick={() => onEdit?.(account)}
              className="
                focus:bg-primary/10
                cursor-pointer rounded-lg font-medium
              "
            >
              <IconEdit className="text-muted-foreground mr-2 h-4 w-4" />
              {t.common.edit()}
            </DropdownMenuItem>
            {!account.isHeader && (
              <>
                <DropdownMenuSeparator className="bg-border/40" />
                <DropdownMenuItem
                  onClick={() => onDelete?.(account)}
                  className="
                    text-destructive
                    focus:bg-destructive/10 focus:text-destructive
                    cursor-pointer rounded-lg font-medium
                  "
                >
                  <IconTrash className="mr-2 h-4 w-4" />
                  {t.common.delete()}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </motion.tr>
  )
}
