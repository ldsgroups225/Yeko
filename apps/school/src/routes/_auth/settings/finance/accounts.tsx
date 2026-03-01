import type { AccountsTableItem, Account as CRUDAccount } from '@/components/finance'
import { IconPlus } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import { motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { AccountFormDialog, AccountsTable } from '@/components/finance'
import { FinanceSubpageToolbar } from '@/components/finance/finance-subpage-toolbar'
import { useTranslations } from '@/i18n'
import { accountsKeys, accountsOptions } from '@/lib/queries'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { deleteExistingAccount } from '@/school/functions/accounts'

export const Route = createFileRoute('/_auth/settings/finance/accounts')({
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
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<CRUDAccount | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: accountsTree, isPending } = useQuery(accountsOptions.tree())

  const deleteMutation = useMutation({
    mutationKey: schoolMutationKeys.accounts.delete,
    mutationFn: (id: string) => deleteExistingAccount({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsKeys.all })
      toast.success('Compte supprimé')
      setDeletingId(null)
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      toast.error(message)
    },
  })

  const handleEdit = (account: AccountsTableItem) => {
    // We need the full account data for editing, but for now we'll cast or fetch
    setEditingAccount(account as unknown as CRUDAccount)
    setIsCreateOpen(true)
  }

  const handleDelete = (account: AccountsTableItem) => {
    setDeletingId(account.id)
  }

  const accountsList: AccountsTableItem[] = accountsTree
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
      <FinanceSubpageToolbar
        actions={(
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="shadow-primary/20 h-10 rounded-xl shadow-lg"
            >
              <IconPlus className="mr-2 h-4 w-4" />
              {t.finance.accounts.create()}
            </Button>
          </motion.div>
        )}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="
          border-border/40 bg-card/40 overflow-hidden shadow-sm backdrop-blur-xl
        "
        >
          <CardHeader className="border-border/40 bg-muted/5 border-b">
            <CardTitle className="text-lg font-bold">
              {t.finance.accounts.title()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <AccountsTable
              accounts={accountsList}
              isPending={isPending}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </motion.div>

      <AccountFormDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open)
            setEditingAccount(null)
        }}
        initialData={editingAccount || undefined}
      />

      <DeleteConfirmationDialog
        open={!!deletingId}
        onOpenChange={open => !open && setDeletingId(null)}
        onConfirm={() => {
          if (deletingId)
            deleteMutation.mutate(deletingId)
        }}
        isPending={deleteMutation.isPending}
        title={t.accounting.accounts.deleteAccount()}
        description={t.accounting.accounts.deleteAccountConfirm()}
      />
    </div>
  )
}
