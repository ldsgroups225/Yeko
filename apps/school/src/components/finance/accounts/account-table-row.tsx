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
        'group hover:bg-muted/30 border-border/40 transition-colors',
        {
          'bg-muted/5': account.isHeader,
        },
      )}
    >
      <TableCell className="font-mono text-sm font-medium text-muted-foreground">
        {account.code}
      </TableCell>
      <TableCell>
        <div
          className={cn('flex items-center gap-2', {
            'font-bold text-foreground': account.isHeader,
            'font-medium': !account.isHeader,
          })}
          style={{ paddingLeft: `${(account.level - 1) * 24}px` }}
        >
          {account.level > 1 && (
            <IconChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          )}
          {account.name}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn(
            'font-medium border',
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
            <span className="text-xs text-muted-foreground font-medium ml-1">
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
              onClick={() => onEdit?.(account)}
              className="rounded-lg cursor-pointer focus:bg-primary/10 font-medium"
            >
              <IconEdit className="mr-2 h-4 w-4 text-muted-foreground" />
              {t.common.edit()}
            </DropdownMenuItem>
            {!account.isHeader && (
              <>
                <DropdownMenuSeparator className="bg-border/40" />
                <DropdownMenuItem
                  onClick={() => onDelete?.(account)}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer font-medium"
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
