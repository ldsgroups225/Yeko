import type { Discount, DiscountFormData } from './discounts/discount-schema'
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
import { discountsKeys } from '@/lib/queries/discounts'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { createNewDiscount, updateExistingDiscount } from '@/school/functions/discounts'
import { DiscountForm } from './discounts/discount-form'
import { discountFormSchema } from './discounts/discount-schema'

interface DiscountFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<Discount>
}

export function DiscountFormDialog({
  open,
  onOpenChange,
  initialData,
}: DiscountFormDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const form = useForm<DiscountFormData>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: {},
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          code: initialData.code || '',
          name: initialData.name || '',
          nameEn: initialData.nameEn || '',
          type: initialData.type || 'sibling',
          calculationType: initialData.calculationType || 'percentage',
          value: String(initialData.value || ''),
          requiresApproval: !!initialData.requiresApproval,
          autoApply: !!initialData.autoApply,
        })
      }
      else {
        form.reset({
          code: '',
          name: '',
          nameEn: '',
          type: 'sibling',
          calculationType: 'percentage',
          value: '',
          requiresApproval: false,
          autoApply: false,
        })
      }
    }
  }, [open, initialData, form])

  const isEditing = !!initialData

  const mutation = useMutation({
    mutationKey: isEditing
      ? schoolMutationKeys.discounts.update
      : schoolMutationKeys.discounts.create,
    mutationFn: async (data: DiscountFormData) => {
      if (isEditing) {
        return updateExistingDiscount({
          data: {
            id: initialData.id!,
            ...data,
          },
        })
      }
      return createNewDiscount({
        data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountsKeys.all })
      toast.success(
        isEditing ? 'Réduction mise à jour' : t.finance.discounts.created(),
      )
      form.reset()
      onOpenChange(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const onSubmit = (data: DiscountFormData) => {
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
            {isEditing ? 'Modifier la réduction' : t.finance.discounts.create()}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            {isEditing
              ? 'Modifier les paramètres de cette réduction'
              : t.finance.discounts.createDescription()}
          </DialogDescription>
        </DialogHeader>

        <DiscountForm
          form={form}
          onSubmit={onSubmit}
          isPending={mutation.isPending}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
