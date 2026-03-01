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
        'border-border/40 space-y-3 rounded-2xl border p-4 backdrop-blur-md',
        {
          'bg-muted/10': account.isHeader,
          'bg-card/50': !account.isHeader,
        },
      )}
      style={{ marginLeft: `${(account.level - 1) * 16}px` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="
            text-muted-foreground bg-muted/20 rounded-md px-2 py-1 font-mono
            text-xs font-bold
          "
          >
            {account.code}
          </div>
          <Badge
            variant="outline"
            className={cn(
              'border text-[10px] font-medium',
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
      </div>

      <div className="text-lg font-bold">{account.name}</div>

      {!account.isHeader && (
        <div className="
          border-border/30 flex items-center justify-between border-t pt-2
        "
        >
          <span className="text-muted-foreground text-sm">
            {t.finance.accounts.balance()}
          </span>
          <div className="text-lg font-bold">
            {formatCurrency(account.balance)}
            {' '}
            <span className="text-muted-foreground text-sm font-normal">
              FCFA
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
