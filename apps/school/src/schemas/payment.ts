import { z } from 'zod'

// Payment methods
export const paymentMethods = ['cash', 'bank_transfer', 'mobile_money', 'card', 'check', 'other'] as const
export type PaymentMethod = (typeof paymentMethods)[number]

// Mobile providers
export const mobileProviders = ['orange', 'mtn', 'moov', 'wave', 'other'] as const
export type MobileProvider = (typeof mobileProviders)[number]

// Payment statuses
export const paymentStatuses = ['pending', 'completed', 'cancelled', 'refunded', 'partial_refund'] as const
export type PaymentStatus = (typeof paymentStatuses)[number]

// Amount validation
export const amountSchema = z.string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Montant invalide')
  .refine(val => Number.parseFloat(val) > 0, 'Le montant doit être positif')

// Payment allocation schema
export const paymentAllocationSchema = z.object({
  studentFeeId: z.string().min(1, 'Frais requis'),
  installmentId: z.string().optional(),
  amount: amountSchema,
})

// Create payment schema
export const createPaymentSchema = z.object({
  studentId: z.string().min(1, 'Élève requis'),
  paymentPlanId: z.string().optional().nullable(),
  amount: amountSchema,
  currency: z.string().default('XOF'),
  method: z.enum(paymentMethods, { message: 'Méthode de paiement invalide' }),
  reference: z.string().max(100).optional(),
  bankName: z.string().max(100).optional(),
  mobileProvider: z.enum(mobileProviders).optional().nullable(),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide'),
  payerName: z.string().max(100).optional(),
  payerPhone: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
  allocations: z.array(paymentAllocationSchema).min(1, 'Au moins une allocation requise'),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>

// Cancel payment schema
export const cancelPaymentSchema = z.object({
  paymentId: z.string().min(1),
  reason: z.string().min(5, 'Motif requis (min 5 caractères)').max(500),
})

export type CancelPaymentInput = z.infer<typeof cancelPaymentSchema>

// Payment method labels (French)
export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Espèces',
  bank_transfer: 'Virement bancaire',
  mobile_money: 'Mobile Money',
  card: 'Carte bancaire',
  check: 'Chèque',
  other: 'Autre',
}

// Mobile provider labels
export const mobileProviderLabels: Record<MobileProvider, string> = {
  orange: 'Orange Money',
  mtn: 'MTN Mobile Money',
  moov: 'Moov Money',
  wave: 'Wave',
  other: 'Autre',
}

// Payment status labels (French)
export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: 'En attente',
  completed: 'Complété',
  cancelled: 'Annulé',
  refunded: 'Remboursé',
  partial_refund: 'Remboursement partiel',
}
