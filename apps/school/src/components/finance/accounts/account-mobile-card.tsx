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
import { cn } from '@/lib/utils'
import { formatCurrency, getTypeColor, getTypeLabel } from './account-utils'

interface AccountMobileCardProps {
  account: any
  index: number
  onEdit?: (account: any) => void
  onDelete?: (account: any) => void
  t: any
}

export function AccountMobileCard({ account, index, onEdit, onDelete, t }: AccountMobileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'p-4 rounded-2xl border border-border/40 backdrop-blur-md space-y-3',
        {
          'bg-muted/10': account.isHeader,
          'bg-card/50': !account.isHeader,
        },
      )}
      style={{ marginLeft: `${(account.level - 1) * 16}px` }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="font-mono text-xs font-bold text-muted-foreground bg-muted/20 px-2 py-1 rounded-md">
            {account.code}
          </div>
          <Badge
            variant="outline"
            className={cn(
              'font-medium border text-[10px]',
              getTypeColor(account.type),
            )}
          >
            {getTypeLabel(account.type)}
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
      </div>

      <div className="font-bold text-lg">{account.name}</div>

      {!account.isHeader && (
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <span className="text-sm text-muted-foreground">
            {t.finance.accounts.balance()}
          </span>
          <div className="font-bold text-lg">
            {formatCurrency(account.balance)}
            {' '}
            <span className="text-sm font-normal text-muted-foreground">
              FCFA
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
