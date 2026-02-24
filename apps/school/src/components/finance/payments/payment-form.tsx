import type { UseFormReturn } from 'react-hook-form'
import type { PaymentFormData } from './payment-schema'
import { IconLoader2 } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
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
import { StudentCombobox } from '@/components/attendance/student/student-combobox'
import { useTranslations } from '@/i18n'
import { paymentMethodLabels, paymentMethods } from '@/schemas/payment'

interface PaymentFormProps {
  form: UseFormReturn<PaymentFormData>
  onSubmit: (data: PaymentFormData) => void
  onCancel: () => void
  isPending: boolean
  hideStudentSelect?: boolean
}

export function PaymentForm({
  form,
  onSubmit,
  onCancel,
  isPending,
  hideStudentSelect = false,
}: PaymentFormProps) {
  const t = useTranslations()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!hideStudentSelect && (
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  {t.students.student()}
                  {' '}
                  *
                </FormLabel>
                <FormControl>
                  <StudentCombobox
                    value={field.value}
                    onSelect={id => field.onChange(id)}
                    placeholder={t.students.searchPlaceholder()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  {t.finance.amount()}
                  {' '}
                  *
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      {...field}
                      className="pr-16 rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors font-bold text-lg"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      FCFA
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  {t.finance.method()}
                  {' '}
                  *
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors">
                      <SelectValue placeholder={t.finance.method()}>
                        {field.value
                          ? paymentMethodLabels[
                            field.value as keyof typeof paymentMethodLabels
                          ]
                          : null}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl backdrop-blur-xl bg-popover/95 border-border/40 shadow-xl">
                    {paymentMethods.map(method => (
                      <SelectItem
                        key={method}
                        value={method}
                        className="rounded-lg cursor-pointer focus:bg-primary/10"
                      >
                        {paymentMethodLabels[method]}
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
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                {t.finance.payments.reference()}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t.finance.payments.referencePlaceholder()}
                  className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                />
              </FormControl>
              <FormDescription className="text-[11px]">
                {t.finance.payments.referenceDescription()}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                {t.finance.description()}
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

        <div className="flex justify-end gap-3 pt-4 border-t border-border/10">
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
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.common.save()}
          </Button>
        </div>
      </form>
    </Form>
  )
}
