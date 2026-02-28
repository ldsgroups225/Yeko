import { IconBookmark } from '@tabler/icons-react'
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
import { AccountMobileCard } from './accounts/account-mobile-card'
import { AccountTableRow } from './accounts/account-table-row'

export interface AccountsTableItem {
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
  accounts: AccountsTableItem[]
  isPending?: boolean
  onEdit?: (account: AccountsTableItem) => void
  onDelete?: (account: AccountsTableItem) => void
}

export function AccountsTable({
  accounts,
  isPending = false,
  onEdit,
  onDelete,
}: AccountsTableProps) {
  const t = useTranslations()

  if (isPending) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 8 }).map(() => (
          <Skeleton key={generateUUID()} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="
        text-muted-foreground border-border/30 bg-card/10 m-4 flex flex-col
        items-center justify-center rounded-xl border-2 border-dashed py-16
        text-center
      "
      >
        <div className="bg-muted/20 mb-4 rounded-full p-4">
          <IconBookmark className="text-muted-foreground/50 h-8 w-8" />
        </div>
        <p className="text-lg font-medium">{t.finance.accounts.noAccounts()}</p>
        <p className="text-muted-foreground/70 mt-1 max-w-sm text-sm">
          {t.finance.accounts.createDescription()}
        </p>
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
              <TableHead className="w-[120px] font-semibold">
                {t.finance.accounts.code()}
              </TableHead>
              <TableHead className="font-semibold">
                {t.finance.accounts.account()}
              </TableHead>
              <TableHead className="font-semibold">
                {t.finance.accounts.type()}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {t.finance.accounts.balance()}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {t.common.actions()}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {accounts.map((account, index) => (
                <AccountTableRow
                  key={account.id}
                  account={account}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  t={t}
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
          {accounts.map((account, index) => (
            <AccountMobileCard
              key={account.id}
              account={account}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              t={t}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
