import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { BookMarked, Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { AccountFormDialog, AccountsTable } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from '@/i18n'
import { accountsOptions } from '@/lib/queries'

export const Route = createFileRoute('/_auth/accounting/accounts')({
  component: AccountsPage,
})

interface AccountNode {
  id: string
  code: string
  name: string
  type: string
  level: number
  balance: string | null
  isHeader: boolean | null
  status: string | null
  children?: AccountNode[]
}

function flattenAccounts(accounts: AccountNode[]): AccountNode[] {
  const result: AccountNode[] = []
  for (const account of accounts) {
    result.push(account)
    if (account.children && account.children.length > 0) {
      result.push(...flattenAccounts(account.children))
    }
  }
  return result
}

function AccountsPage() {
  const t = useTranslations()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data: accountsTree, isLoading } = useQuery(accountsOptions.tree())

  const accountsList = accountsTree
    ? flattenAccounts(accountsTree as AccountNode[]).map(acc => ({
        id: acc.id,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        level: acc.level,
        balance: Number(acc.balance ?? 0),
        isHeader: acc.isHeader ?? false,
        status: acc.status ?? 'active',
      }))
    : []

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.finance(), href: '/accounting' },
          { label: t.finance.accounts.title() },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
            <BookMarked className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.finance.accounts.title()}</h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-lg">{t.finance.accounts.description()}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button onClick={() => setIsCreateOpen(true)} className="h-10 rounded-xl shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            {t.finance.accounts.create()}
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden shadow-sm">
          <CardHeader className="border-b border-border/40 bg-muted/5">
            <CardTitle className="text-lg font-bold">{t.finance.accounts.title()}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <AccountsTable
              accounts={accountsList}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </motion.div>

      <AccountFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  )
}
