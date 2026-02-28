import type { PaymentPlanTemplateFormData } from './payment-plan-templates/payment-plan-template-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { paymentPlanTemplatesKeys } from '@/lib/queries/payment-plan-templates'
import { createPaymentPlanTemplate, updatePaymentPlanTemplate } from '@/school/functions/payment-plan-templates'
import { PaymentPlanTemplateForm } from './payment-plan-templates/payment-plan-template-form'
import { paymentPlanTemplateFormSchema } from './payment-plan-templates/payment-plan-template-schema'

interface PaymentPlanTemplateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolYearId: string
  initialData?: PaymentPlanTemplateFormData & { id: string }
}

export function PaymentPlanTemplateFormDialog({
  open,
  onOpenChange,
  schoolYearId,
  initialData,
}: PaymentPlanTemplateFormDialogProps) {
  const queryClient = useQueryClient()
  const isEditMode = !!initialData

  const form = useForm<PaymentPlanTemplateFormData>({
    resolver: zodResolver(paymentPlanTemplateFormSchema) as never,
    defaultValues: {
      name: '',
      nameEn: '',
      installmentsCount: 3,
      schedule: [
        { number: 1, percentage: 33.33, dueDaysFromStart: 0, label: 'Premier acompte' },
        { number: 2, percentage: 33.33, dueDaysFromStart: 30, label: 'Deuxième acompte' },
        { number: 3, percentage: 33.34, dueDaysFromStart: 60, label: 'Solde' },
      ],
      isDefault: false,
      ...initialData,
    },
  })

  const resetForm = useCallback(() => {
    form.reset({
      name: '',
      nameEn: '',
      installmentsCount: 3,
      schedule: [
        { number: 1, percentage: 33.33, dueDaysFromStart: 0, label: 'Premier acompte' },
        { number: 2, percentage: 33.33, dueDaysFromStart: 30, label: 'Deuxième acompte' },
        { number: 3, percentage: 33.34, dueDaysFromStart: 60, label: 'Solde' },
      ],
      isDefault: false,
      ...initialData,
    })
  }, [form, initialData])

  useEffect(() => {
    if (open)
      resetForm()
  }, [open, resetForm])

  const createMutation = useMutation({
    mutationKey: schoolMutationKeys.paymentPlanTemplates.create,
    mutationFn: async (data: PaymentPlanTemplateFormData) => {
      const result = await createPaymentPlanTemplate({
        data: { schoolYearId, ...data },
      })
      if (!result.success)
        throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentPlanTemplatesKeys.all })
      toast.success('Modèle de plan de paiement créé avec succès')
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationKey: schoolMutationKeys.paymentPlanTemplates.update,
    mutationFn: async (data: PaymentPlanTemplateFormData) => {
      if (!initialData?.id)
        return
      const result = await updatePaymentPlanTemplate({
        data: { id: initialData.id, ...data },
      })
      if (!result.success)
        throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentPlanTemplatesKeys.all })
      toast.success('Modèle de plan de paiement mis à jour avec succès')
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const onSubmit = (data: PaymentPlanTemplateFormData) => {
    if (isEditMode)
      updateMutation.mutate(data)
    else createMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        bg-card/95 border-border/40 max-h-[90vh] overflow-y-auto rounded-3xl p-6
        shadow-2xl backdrop-blur-xl
        sm:max-w-[600px]
      "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditMode ? 'Modifier le modèle de plan de paiement' : 'Créer un modèle de plan de paiement'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            {isEditMode ? 'Modifiez les informations du modèle' : 'Définissez les échéances et le calendrier de paiement pour ce modèle'}
          </DialogDescription>
        </DialogHeader>

        <PaymentPlanTemplateForm
          form={form}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isPending={createMutation.isPending || updateMutation.isPending}
          isEditMode={isEditMode}
        />
      </DialogContent>
    </Dialog>
  )
}
