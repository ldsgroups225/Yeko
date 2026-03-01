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
        <div className="
          grid gap-4
          md:grid-cols-2
        "
        >
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="
                  text-muted-foreground text-xs font-bold tracking-wider
                  uppercase
                "
                >
                  {t.common.code()}
                  {' '}
                  *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="1000"
                    className="
                      border-border/40 bg-muted/20
                      focus:bg-background
                      rounded-xl font-mono transition-colors
                    "
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
                <FormLabel className="
                  text-muted-foreground text-xs font-bold tracking-wider
                  uppercase
                "
                >
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
                    <SelectTrigger className="
                      border-border/40 bg-muted/20
                      focus:bg-background
                      rounded-xl transition-colors
                    "
                    >
                      <SelectValue placeholder={t.finance.accounts.type()}>
                        {field.value && accountTypeLabels[field.value as keyof typeof accountTypeLabels]}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="
                    bg-popover/95 border-border/40 rounded-xl shadow-xl
                    backdrop-blur-xl
                  "
                  >
                    {accountTypes.map(type => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="
                          focus:bg-primary/10
                          cursor-pointer rounded-lg
                        "
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
              <FormLabel className="
                text-muted-foreground text-xs font-bold tracking-wider uppercase
              "
              >
                {t.common.name()}
                {' '}
                *
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t.finance.accounts.placeholders.name()}
                  className="
                    border-border/40 bg-muted/20
                    focus:bg-background
                    rounded-xl transition-colors
                  "
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
              <FormLabel className="
                text-muted-foreground text-xs font-bold tracking-wider uppercase
              "
              >
                {t.common.nameEn()}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t.finance.accounts.placeholders.nameEn()}
                  className="
                    border-border/40 bg-muted/20
                    focus:bg-background
                    rounded-xl transition-colors
                  "
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
              <FormLabel className="
                text-muted-foreground text-xs font-bold tracking-wider uppercase
              "
              >
                {t.finance.accounts.normalBalance()}
                {' '}
                *
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="
                    border-border/40 bg-muted/20
                    focus:bg-background
                    rounded-xl transition-colors
                  "
                  >
                    <SelectValue placeholder={t.finance.accounts.normalBalance()}>
                      {field.value && normalBalanceLabels[field.value as keyof typeof normalBalanceLabels]}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="
                  bg-popover/95 border-border/40 rounded-xl shadow-xl
                  backdrop-blur-xl
                "
                >
                  {normalBalances.map(balance => (
                    <SelectItem
                      key={balance}
                      value={balance}
                      className="
                        focus:bg-primary/10
                        cursor-pointer rounded-lg
                      "
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
              <FormLabel className="
                text-muted-foreground text-xs font-bold tracking-wider uppercase
              "
              >
                {t.common.description()}
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={2}
                  className="
                    border-border/40 bg-muted/20
                    focus:bg-background
                    resize-none rounded-xl transition-colors
                  "
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
            <FormItem className="
              border-border/40 bg-muted/10 flex items-center gap-3 space-y-0
              rounded-xl border p-3
            "
            >
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-bold">
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
            className="border-border/40 rounded-xl"
          >
            {t.common.cancel()}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="shadow-primary/20 rounded-xl shadow-lg"
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
