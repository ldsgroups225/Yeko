import type { PaymentFormData } from './payments/payment-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { paymentsKeys } from '@/lib/queries/payments'
import { studentFeesOptions } from '@/lib/queries/student-fees'
import { recordPayment } from '@/school/functions/payments'
import { PaymentForm } from './payments/payment-form'
import { paymentFormSchema } from './payments/payment-schema'

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

  const selectedStudentId = useWatch({ control: form.control, name: 'studentId' })

  const { data: studentFees } = useQuery(
    studentFeesOptions.studentDetails(selectedStudentId),
  )

  const mutation = useMutation({
    mutationKey: schoolMutationKeys.payments.create,
    mutationFn: (data: PaymentFormData) => {
      const paymentAmount = Number.parseFloat(data.amount)
      let remainingAmount = paymentAmount
      const allocations: { studentFeeId: string, amount: string, installmentId?: string }[] = []

      const pendingFees = studentFees?.filter(fee => Number.parseFloat(fee.studentFee.balance) > 0) || []

      pendingFees.sort((a, b) => {
        if (a.feeTypeCode.includes('inscription') && !b.feeTypeCode.includes('inscription'))
          return -1
        if (!a.feeTypeCode.includes('inscription') && b.feeTypeCode.includes('inscription'))
          return 1
        return new Date(a.studentFee.createdAt).getTime() - new Date(b.studentFee.createdAt).getTime()
      })

      for (const feeWithDetails of pendingFees) {
        if (remainingAmount <= 0)
          break
        const feeBalance = Number.parseFloat(feeWithDetails.studentFee.balance)
        const allocateAmount = Math.min(remainingAmount, feeBalance)
        if (allocateAmount > 0) {
          allocations.push({
            studentFeeId: feeWithDetails.studentFee.id,
            amount: allocateAmount.toString(),
          })
          remainingAmount -= allocateAmount
        }
      }

      if (allocations.length === 0) {
        throw new Error('Aucun frais en attente trouvé pour cet élève. Impossible d\'affecter le paiement.')
      }

      return recordPayment({
        data: {
          studentId: data.studentId,
          amount: data.amount,
          method: data.method,
          paymentDate: new Date().toISOString().split('T')[0] || '',
          allocations,
          reference: data.reference,
          notes: data.notes,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.all })
      queryClient.invalidateQueries({ queryKey: ['studentFees'] })
      toast.success(t.finance.payments.recordPayment())
      form.reset()
      onOpenChange(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

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
          <DialogTitle className="text-xl font-bold">
            {t.finance.payments.recordPayment()}
          </DialogTitle>
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
              : (
                  t.finance.payments.description()
                )}
          </DialogDescription>
        </DialogHeader>

        <PaymentForm
          form={form}
          onSubmit={data => mutation.mutate(data)}
          onCancel={() => onOpenChange(false)}
          isPending={mutation.isPending}
          hideStudentSelect={!!studentId}
        />
      </DialogContent>
    </Dialog>
  )
}
