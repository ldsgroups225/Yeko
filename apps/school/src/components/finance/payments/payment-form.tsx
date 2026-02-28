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
                <FormLabel className="
                  text-muted-foreground text-xs font-bold tracking-wider
                  uppercase
                "
                >
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

        <div className="
          grid gap-4
          md:grid-cols-2
        "
        >
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="
                  text-muted-foreground text-xs font-bold tracking-wider
                  uppercase
                "
                >
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
                      className="
                        border-border/40 bg-muted/20
                        focus:bg-background
                        rounded-xl pr-16 text-lg font-bold transition-colors
                      "
                      placeholder="0"
                    />
                    <span className="
                      text-muted-foreground absolute top-1/2 right-3
                      -translate-y-1/2 text-sm font-medium
                    "
                    >
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
                <FormLabel className="
                  text-muted-foreground text-xs font-bold tracking-wider
                  uppercase
                "
                >
                  {t.finance.method()}
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
                      <SelectValue placeholder={t.finance.method()}>
                        {field.value
                          ? paymentMethodLabels[
                            field.value as keyof typeof paymentMethodLabels
                          ]
                          : null}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="
                    bg-popover/95 border-border/40 rounded-xl shadow-xl
                    backdrop-blur-xl
                  "
                  >
                    {paymentMethods.map(method => (
                      <SelectItem
                        key={method}
                        value={method}
                        className="
                          focus:bg-primary/10
                          cursor-pointer rounded-lg
                        "
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
              <FormLabel className="
                text-muted-foreground text-xs font-bold tracking-wider uppercase
              "
              >
                {t.finance.payments.reference()}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t.finance.payments.referencePlaceholder()}
                  className="
                    border-border/40 bg-muted/20
                    focus:bg-background
                    rounded-xl transition-colors
                  "
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
              <FormLabel className="
                text-muted-foreground text-xs font-bold tracking-wider uppercase
              "
              >
                {t.finance.description()}
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

        <div className="border-border/10 flex justify-end gap-3 border-t pt-4">
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
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.common.save()}
          </Button>
        </div>
      </form>
    </Form>
  )
}
