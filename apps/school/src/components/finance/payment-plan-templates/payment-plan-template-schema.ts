import { z } from 'zod'

export const installmentSchema = z.object({
  number: z.number().int().min(1),
  percentage: z.number().min(0).max(100),
  dueDaysFromStart: z.number().int().min(0),
  label: z.string().min(1, 'Label requis'),
})

export const paymentPlanTemplateFormSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  nameEn: z.string().optional(),
  installmentsCount: z.number().int().min(1, 'Minimum 1 échéance'),
  schedule: z.array(installmentSchema).min(1, 'Au moins une échéance requise'),
  isDefault: z.boolean().default(false),
})

export type PaymentPlanTemplateFormData = z.output<typeof paymentPlanTemplateFormSchema>
export type InstallmentData = z.infer<typeof installmentSchema>
