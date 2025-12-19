import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AccountFormDialog, AccountsTable } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  const { t } = useTranslation()
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
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.finance'), href: '/accounting' },
          { label: t('finance.accounts.title') },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('finance.accounts.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('finance.accounts.description')}
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('finance.accounts.create')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('finance.accounts.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountsTable
            accounts={accountsList}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <AccountFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  )
}
