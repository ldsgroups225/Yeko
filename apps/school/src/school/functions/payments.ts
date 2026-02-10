import { Result as R } from '@praha/byethrow'
import { getFinanceStats } from '@repo/data-ops/queries/finance-stats'
import {
  cancelPayment,
  createPaymentWithAllocations,
  getCashierDailySummary,
  getPaymentById,
  getPaymentByReceiptNumber,
  getPayments,
} from '@repo/data-ops/queries/payments'
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

    const _result1 = await getPayments({
      schoolId,
      ...filters,
    })
    if (R.isFailure(_result1))
      return { success: false as const, error: 'Erreur lors de la récupération des paiements' }
    return { success: true as const, data: _result1.value }
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

    const _result2 = await getPaymentById(paymentId)
    if (R.isFailure(_result2))
      return { success: false as const, error: 'Erreur lors de la récupération du paiement' }
    return { success: true as const, data: _result2.value }
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

    const _result3 = await getPaymentByReceiptNumber(schoolId, receiptNumber)
    if (R.isFailure(_result3))
      return { success: false as const, error: 'Erreur lors de la récupération du paiement par numéro de reçu' }
    return { success: true as const, data: _result3.value }
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

    const _result4 = await createPaymentWithAllocations({
      schoolId,
      processedBy: userId,
      ...data,
    })
    if (R.isFailure(_result4))
      return { success: false as const, error: 'Erreur lors de l\'enregistrement du paiement' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'payments',
      recordId: _result4.value.payment.id,
      newValues: data,
    })
    return { success: true as const, data: _result4.value }
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

    const _result5 = await cancelPayment(data.paymentId, userId, data.reason)
    if (R.isFailure(_result5))
      return { success: false as const, error: 'Erreur lors de l\'annulation du paiement' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'payments',
      recordId: data.paymentId,
      newValues: { status: 'cancelled', reason: data.reason },
    })
    return { success: true as const, data: _result5.value }
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
    const _result6 = await getCashierDailySummary(schoolId, cashierId, data.date)
    if (R.isFailure(_result6))
      return { success: false as const, error: 'Erreur lors de la récupération du résumé de la caisse' }
    return { success: true as const, data: _result6.value }
  })

/**
 * Get finance stats (dashboard metrics)
 * Necessary docstring: Public API documentation
 */
export const getFinanceDashboardStats = authServerFn
  .handler(async ({ context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('finance', 'view')

    const _result7 = await getFinanceStats(schoolId)
    if (R.isFailure(_result7))
      return { success: false as const, error: 'Erreur lors de la récupération des statistiques financières' }
    return { success: true as const, data: _result7.value }
  })
