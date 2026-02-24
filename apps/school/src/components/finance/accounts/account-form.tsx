import type { UseFormReturn } from 'react-hook-form'
import type { AccountFormData } from './account-schema'
import { IconLoader2 } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { DialogFooter } from '@workspace/ui/components/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Textarea } from '@workspace/ui/components/textarea'
import { useTranslations } from '@/i18n'
import { accountTypeLabels, accountTypes, normalBalanceLabels, normalBalances } from '@/schemas/account'

interface AccountFormProps {
  form: UseFormReturn<AccountFormData>
  onSubmit: (data: AccountFormData) => void
  isPending: boolean
  onCancel: () => void
}

export function AccountForm({ form, onSubmit, isPending, onCancel }: AccountFormProps) {
  const t = useTranslations()

  const getDefaultNormalBalance = (type: string) => {
    if (type === 'asset' || type === 'expense')
      return 'debit'
    return 'credit'
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  {t.common.code()}
                  {' '}
                  *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="1000"
                    className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors font-mono"
                  />
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
                <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  {t.finance.accounts.type()}
                  {' '}
                  *
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    if (value) {
                      form.setValue(
                        'normalBalance',
                        getDefaultNormalBalance(value),
                      )
                    }
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors">
                      <SelectValue placeholder={t.finance.accounts.type()}>
                        {field.value && accountTypeLabels[field.value as keyof typeof accountTypeLabels]}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl backdrop-blur-xl bg-popover/95 border-border/40 shadow-xl">
                    {accountTypes.map(type => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="rounded-lg cursor-pointer focus:bg-primary/10"
                      >
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
              <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                {t.common.name()}
                {' '}
                *
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t.finance.accounts.placeholders.name()}
                  className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                />
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
              <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                {t.common.nameEn()}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t.finance.accounts.placeholders.nameEn()}
                  className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                />
              </FormControl>
              <FormDescription className="text-[11px]">
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
              <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                {t.finance.accounts.normalBalance()}
                {' '}
                *
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors">
                    <SelectValue placeholder={t.finance.accounts.normalBalance()}>
                      {field.value && normalBalanceLabels[field.value as keyof typeof normalBalanceLabels]}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl backdrop-blur-xl bg-popover/95 border-border/40 shadow-xl">
                  {normalBalances.map(balance => (
                    <SelectItem
                      key={balance}
                      value={balance}
                      className="rounded-lg cursor-pointer focus:bg-primary/10"
                    >
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
              <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                {t.common.description()}
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={2}
                  className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isHeader"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 space-y-0 p-3 rounded-xl border border-border/40 bg-muted/10">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-0.5">
                <FormLabel className="font-bold text-sm">
                  {t.finance.accounts.isHeader()}
                </FormLabel>
                <FormDescription className="text-xs">
                  {t.finance.accounts.isHeaderDescription()}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl border-border/40"
          >
            {t.common.cancel()}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="rounded-xl shadow-lg shadow-primary/20"
          >
            {isPending && (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t.common.save()}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
