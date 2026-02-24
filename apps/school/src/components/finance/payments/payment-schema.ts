import { z } from 'zod'
import { paymentMethods } from '@/schemas/payment'

export const paymentFormSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Montant invalide'),
  method: z.enum(paymentMethods),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

export type PaymentFormData = z.infer<typeof paymentFormSchema>
