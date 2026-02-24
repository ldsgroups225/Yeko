import { z } from 'zod'
import { calculationTypes, discountTypes } from '@/schemas/discount'

export const discountFormSchema = z
  .object({
    code: z.string().min(1, 'Code requis').max(20, 'Code trop long'),
    name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
    nameEn: z.string().max(100).optional(),
    type: z.enum(discountTypes, { message: 'Type de réduction invalide' }),
    calculationType: z.enum(calculationTypes, {
      message: 'Type de calcul invalide',
    }),
    value: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valeur invalide'),
    requiresApproval: z.boolean(),
    autoApply: z.boolean(),
  })
  .refine(
    data =>
      data.calculationType !== 'percentage'
      || Number.parseFloat(data.value) <= 100,
    { message: 'Le pourcentage ne peut pas dépasser 100%', path: ['value'] },
  )

export type DiscountFormData = z.infer<typeof discountFormSchema>

export interface Discount extends DiscountFormData {
  id: string
}
