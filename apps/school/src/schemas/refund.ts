import { z } from 'zod'

// Refund statuses
export const refundStatuses = ['pending', 'approved', 'rejected', 'processed', 'cancelled'] as const
export type RefundStatus = (typeof refundStatuses)[number]

// Refund reason categories
export const refundReasonCategories = ['overpayment', 'withdrawal', 'transfer', 'error', 'other'] as const
export type RefundReasonCategory = (typeof refundReasonCategories)[number]

// Refund methods
export const refundMethods = ['cash', 'bank_transfer', 'mobile_money', 'check', 'credit'] as const
export type RefundMethod = (typeof refundMethods)[number]

// Amount validation
export const amountSchema = z.string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Montant invalide')
  .refine(val => Number.parseFloat(val) > 0, 'Le montant doit être positif')

// Create refund request schema
export const createRefundSchema = z.object({
  paymentId: z.string().min(1, 'Paiement requis'),
  amount: amountSchema,
  reason: z.string().min(10, 'Motif requis (min 10 caractères)').max(500),
  reasonCategory: z.enum(refundReasonCategories).optional(),
  method: z.enum(refundMethods, { message: 'Méthode de remboursement invalide' }),
})

export type CreateRefundInput = z.infer<typeof createRefundSchema>

// Approve refund schema
export const approveRefundSchema = z.object({
  refundId: z.string().min(1),
})

export type ApproveRefundInput = z.infer<typeof approveRefundSchema>

// Reject refund schema
export const rejectRefundSchema = z.object({
  refundId: z.string().min(1),
  rejectionReason: z.string().min(5, 'Motif de rejet requis').max(500),
})

export type RejectRefundInput = z.infer<typeof rejectRefundSchema>

// Process refund schema
export const processRefundSchema = z.object({
  refundId: z.string().min(1),
  reference: z.string().max(100).optional(),
})

export type ProcessRefundInput = z.infer<typeof processRefundSchema>

// Refund status labels (French)
export const refundStatusLabels: Record<RefundStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
  processed: 'Traité',
  cancelled: 'Annulé',
}

// Refund reason category labels (French)
export const refundReasonCategoryLabels: Record<RefundReasonCategory, string> = {
  overpayment: 'Trop-perçu',
  withdrawal: 'Retrait',
  transfer: 'Transfert',
  error: 'Erreur',
  other: 'Autre',
}

// Refund method labels (French)
export const refundMethodLabels: Record<RefundMethod, string> = {
  cash: 'Espèces',
  bank_transfer: 'Virement bancaire',
  mobile_money: 'Mobile Money',
  check: 'Chèque',
  credit: 'Avoir',
}
