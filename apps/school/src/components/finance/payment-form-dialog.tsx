'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { IconLoader2 } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
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
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTranslations } from '@/i18n'
import { paymentsKeys } from '@/lib/queries/payments'
import { paymentMethodLabels, paymentMethods } from '@/schemas/payment'
import { recordPayment } from '@/school/functions/payments'

const paymentFormSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Montant invalide'),
  method: z.enum(paymentMethods),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentFormSchema>

interface PaymentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId?: string
  studentName?: string
  outstandingBalance?: number
}

export function PaymentFormDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  outstandingBalance,
}: PaymentFormDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      studentId: studentId || '',
      amount: '',
      method: 'cash',
      reference: '',
      notes: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: PaymentFormData) =>
      recordPayment({
        data: {
          studentId: data.studentId,
          amount: data.amount,
          method: data.method,
          paymentDate: new Date().toISOString().split('T')[0] || '',
          allocations: [],
          reference: data.reference,
          notes: data.notes,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.all })
      toast.success(t.finance.payments.recordPayment())
      form.reset()
      onOpenChange(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const onSubmit = (data: PaymentFormData) => {
    mutation.mutate(data)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t.finance.payments.recordPayment()}</DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            {studentName
              ? (
                  <span>
                    {studentName}
                    {outstandingBalance !== undefined && (
                      <span className="ml-2 text-orange-600 font-medium">
                        (
                        {formatCurrency(outstandingBalance)}
                        {' '}
                        FCFA
                        {' '}
                        {t.dashboard.accountant.unpaidFees()}
                        )
                      </span>
                    )}
                  </span>
                )
              : t.finance.payments.description()}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!studentId && (
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
                      <Input {...field} placeholder={t.students.searchPlaceholder()} className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors" />
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
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl backdrop-blur-xl bg-popover/95 border-border/40 shadow-xl">
                        {paymentMethods.map(method => (
                          <SelectItem key={method} value={method} className="rounded-lg cursor-pointer focus:bg-primary/10">
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
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{t.finance.payments.reference()}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t.finance.payments.referencePlaceholder()} className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors" />
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
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{t.finance.description()}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl border-border/40"
              >
                {t.common.cancel()}
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="rounded-xl shadow-lg shadow-primary/20">
                {mutation.isPending && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
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
