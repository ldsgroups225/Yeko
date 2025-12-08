import { ChevronRight, Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { generateUUID } from '@/utils/generateUUID'

interface Account {
  id: string
  code: string
  name: string
  type: string
  level: number
  balance: number
  isHeader: boolean
  status: string
}

interface AccountsTableProps {
  accounts: Account[]
  isLoading?: boolean
  onEdit?: (account: Account) => void
  onDelete?: (account: Account) => void
}

export function AccountsTable({
  accounts,
  isLoading = false,
  onEdit,
  onDelete,
}: AccountsTableProps) {
  const { t } = useTranslation()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      asset: 'Actif',
      liability: 'Passif',
      equity: 'Capitaux',
      revenue: 'Produits',
      expense: 'Charges',
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'asset':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'liability':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'equity':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'revenue':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'expense':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      default:
        return ''
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map(() => (
          <Skeleton key={generateUUID()} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{t('finance.accounts.noAccounts')}</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Code</TableHead>
          <TableHead>Compte</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Solde</TableHead>
          <TableHead className="text-right">{t('common.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map(account => (
          <TableRow key={account.id}>
            <TableCell className="font-mono text-sm">{account.code}</TableCell>
            <TableCell>
              <div
                className={cn('flex items-center gap-1', {
                  'font-semibold': account.isHeader,
                })}
                style={{ paddingLeft: `${(account.level - 1) * 16}px` }}
              >
                {account.level > 1 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                )}
                {account.name}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={getTypeColor(account.type)}>
                {getTypeLabel(account.type)}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-medium">
              {!account.isHeader && (
                <>
                  {formatCurrency(account.balance)}
                  <span className="ml-1 text-sm text-muted-foreground">FCFA</span>
                </>
              )}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t('common.actions')}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(account)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t('common.edit')}
                  </DropdownMenuItem>
                  {!account.isHeader && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(account)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
