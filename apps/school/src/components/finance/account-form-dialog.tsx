import type { Account, AccountFormData } from './accounts/account-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { accountsKeys } from '@/lib/queries/accounts'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { createNewAccount, updateExistingAccount } from '@/school/functions/accounts'
import { AccountForm } from './accounts/account-form'
import { accountFormSchema } from './accounts/account-schema'

interface AccountFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<Account>
}

export function AccountFormDialog({
  open,
  onOpenChange,
  initialData,
}: AccountFormDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          code: initialData.code || '',
          name: initialData.name || '',
          nameEn: initialData.nameEn || '',
          type: initialData.type || 'asset',
          normalBalance: initialData.normalBalance || 'debit',
          isHeader: !!initialData.isHeader,
          description: initialData.description || '',
        })
      }
      else {
        form.reset({
          code: '',
          name: '',
          nameEn: '',
          type: 'asset',
          normalBalance: 'debit',
          isHeader: false,
          description: '',
        })
      }
    }
  }, [open, initialData, form])

  const isEditing = !!initialData

  const mutation = useMutation({
    mutationKey: isEditing
      ? schoolMutationKeys.accounts.update
      : schoolMutationKeys.accounts.create,
    mutationFn: (data: AccountFormData) => {
      if (isEditing) {
        return updateExistingAccount({
          data: {
            id: initialData.id!,
            ...data,
          },
        })
      }
      return createNewAccount({
        data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsKeys.all })
      toast.success(
        isEditing ? 'Compte mis à jour' : t.finance.accounts.created(),
      )
      form.reset()
      onOpenChange(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const onSubmit = (data: AccountFormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        bg-card/95 border-border/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl
        sm:max-w-[500px]
      "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? 'Modifier le compte' : t.finance.accounts.create()}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            {isEditing
              ? 'Modifier les paramètres de ce compte'
              : t.finance.accounts.createDescription()}
          </DialogDescription>
        </DialogHeader>

        <AccountForm
          form={form}
          onSubmit={onSubmit}
          isPending={mutation.isPending}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
