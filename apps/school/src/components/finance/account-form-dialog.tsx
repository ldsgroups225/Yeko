'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'

import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useTranslations } from '@/i18n'
import { accountsKeys } from '@/lib/queries/accounts'
import {
  accountTypeLabels,
  accountTypes,
  normalBalanceLabels,
  normalBalances,
} from '@/schemas/account'
import { createNewAccount } from '@/school/functions/accounts'

const accountFormSchema = z.object({
  code: z.string().min(1, 'Code requis').max(20, 'Code trop long'),
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  nameEn: z.string().max(100).optional(),
  type: z.enum(accountTypes, { message: 'Type de compte invalide' }),
  normalBalance: z.enum(normalBalances, { message: 'Solde normal invalide' }),
  isHeader: z.boolean(),
  description: z.string().max(500).optional(),
})

type AccountFormData = z.infer<typeof accountFormSchema>

interface AccountFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountFormDialog({ open, onOpenChange }: AccountFormDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      code: '',
      name: '',
      nameEn: '',
      type: 'asset',
      normalBalance: 'debit',
      isHeader: false,
      description: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: AccountFormData) =>
      createNewAccount({
        data: {
          code: data.code,
          name: data.name,
          nameEn: data.nameEn,
          type: data.type,
          normalBalance: data.normalBalance,
          isHeader: data.isHeader,
          description: data.description,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsKeys.all })
      toast.success(t.finance.accounts.created())
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

  // Auto-set normal balance based on account type
  const getDefaultNormalBalance = (type: string) => {
    if (type === 'asset' || type === 'expense')
      return 'debit'
    return 'credit'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t.finance.accounts.create()}</DialogTitle>
          <DialogDescription>
            {t.finance.accounts.createDescription()}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.common.code()}
                      {' '}
                      *
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="1000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.finance.accounts.type()}
                      {' '}
                      *
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        form.setValue('normalBalance', getDefaultNormalBalance(value))
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accountTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {accountTypeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.common.name()}
                    {' '}
                    *
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t.finance.accounts.placeholders.name()} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.common.nameEn()}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t.finance.accounts.placeholders.nameEn()} />
                  </FormControl>
                  <FormDescription>
                    {t.common.optionalEnglishName()}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="normalBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.finance.accounts.normalBalance()}
                    {' '}
                    *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {normalBalances.map(balance => (
                        <SelectItem key={balance} value={balance}>
                          {normalBalanceLabels[balance]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.common.description()}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isHeader"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {t.finance.accounts.isHeader()}
                  </FormLabel>
                  <FormDescription className="ml-2">
                    {t.finance.accounts.isHeaderDescription()}
                  </FormDescription>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t.common.cancel()}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t.common.save()}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
