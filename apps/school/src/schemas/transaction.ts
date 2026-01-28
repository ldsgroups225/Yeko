import { z } from 'zod'

export const transactionTypeSchema = z.enum([
  'journal',
  'payment',
  'receipt',
  'refund',
  'adjustment',
  'opening',
  'closing',
])

export const transactionStatusSchema = z.enum(['draft', 'posted', 'voided'])

export const transactionLineSchema = z.object({
  accountId: z.string(),
  debitAmount: z.number().default(0),
  creditAmount: z.number().default(0),
  description: z.string().optional(),
})

export const createTransactionSchema = z.object({
  date: z.string(),
  type: transactionTypeSchema,
  description: z.string().min(1),
  reference: z.string().optional(),
  currency: z.string().default('XOF'),
  studentId: z.string().optional(),
  paymentId: z.string().optional(),
  lines: z.array(transactionLineSchema).min(2, 'Transaction must have at least 2 lines'),
})

export const voidTransactionSchema = z.object({
  transactionId: z.string(),
  voidReason: z.string().min(5),
})

export const transactionFiltersSchema = z.object({
  type: transactionTypeSchema.optional(),
  status: transactionStatusSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  studentId: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
})
