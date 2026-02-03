import {
  cancelPayment,
  createPaymentWithAllocations,
  getCashierDailySummary,
  getPaymentById,
  getPaymentByReceiptNumber,
  getPayments,
} from '@repo/data-ops'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { z } from 'zod'
import { cancelPaymentSchema, createPaymentSchema } from '@/schemas/payment'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

/**
 * Filters for payments queries
 */
const paymentFiltersSchema = z.object({
  studentId: z.string().optional(),
  paymentPlanId: z.string().optional(),
  method: z.enum(['cash', 'bank_transfer', 'mobile_money', 'card', 'check', 'other']).optional(),
  status: z.enum(['pending', 'completed', 'cancelled', 'refunded', 'partial_refund']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
})

/**
 * Get payments list with pagination
 */
export const getPaymentsList = authServerFn
  .inputValidator(paymentFiltersSchema.optional())
  .handler(async ({ data: filters, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('finance', 'view')

    return (await getPayments({
      schoolId,
      ...filters,
    })).match(
      data => ({ success: true as const, data }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des paiements' }),
    )
  })

/**
 * Get single payment
 */
export const getPayment = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: paymentId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('finance', 'view')

    return (await getPaymentById(paymentId)).match(
      data => ({ success: true as const, data }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération du paiement' }),
    )
  })

/**
 * Get payment by receipt number
 */
export const getPaymentByReceipt = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: receiptNumber, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('finance', 'view')

    return (await getPaymentByReceiptNumber(schoolId, receiptNumber)).match(
      data => ({ success: true as const, data }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération du paiement par numéro de reçu' }),
    )
  })

/**
 * Record new payment with allocations
 */
export const recordPayment = authServerFn
  .inputValidator(createPaymentSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('finance', 'create')

    return (await createPaymentWithAllocations({
      schoolId,
      processedBy: userId,
      ...data,
    })).match(
      async (result) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'create',
          tableName: 'payments',
          recordId: result.payment.id,
          newValues: data,
        })
        return { success: true as const, data: result }
      },
      _ => ({ success: false as const, error: 'Erreur lors de l\'enregistrement du paiement' }),
    )
  })

/**
 * Cancel payment
 */
export const cancelExistingPayment = authServerFn
  .inputValidator(cancelPaymentSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('finance', 'edit')

    return (await cancelPayment(data.paymentId, userId, data.reason)).match(
      async (result) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'update',
          tableName: 'payments',
          recordId: data.paymentId,
          newValues: { status: 'cancelled', reason: data.reason },
        })
        return { success: true as const, data: result }
      },
      _ => ({ success: false as const, error: 'Erreur lors de l\'annulation du paiement' }),
    )
  })

/**
 * Get cashier daily summary
 */
export const getCashierSummary = authServerFn
  .inputValidator(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    cashierId: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('finance', 'view')

    const cashierId = data.cashierId || userId
    return (await getCashierDailySummary(schoolId, cashierId, data.date)).match(
      data => ({ success: true as const, data }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération du résumé de la caisse' }),
    )
  })
