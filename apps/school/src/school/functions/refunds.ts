import {
  approveRefund,
  cancelRefund,
  createRefund,
  getPendingRefundsCount,
  getRefundById,
  getRefunds,
  processRefund,
  rejectRefund,
} from '@repo/data-ops/queries/refunds'
import { z } from 'zod'
import { approveRefundSchema, createRefundSchema, processRefundSchema, rejectRefundSchema } from '@/schemas/refund'
import { authServerFn } from '../lib/server-fn'

/**
 * Filters for refunds queries
 */
const refundFiltersSchema = z.object({
  paymentId: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'processed', 'cancelled']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
})

/**
 * Get refunds list with pagination
 */
export const getRefundsList = authServerFn
  .inputValidator(refundFiltersSchema.optional())
  .handler(async ({ data: filters, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    const result = await getRefunds({
      schoolId: school.schoolId,
      ...filters,
    })
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get single refund
 */
export const getRefund = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: refundId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await getRefundById(refundId)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get pending refunds count
 */
export const getPendingRefunds = authServerFn
  .handler(async ({ context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    const result = await getPendingRefundsCount(school.schoolId)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Request new refund
 */
export const requestRefund = authServerFn
  .inputValidator(createRefundSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    const result = await createRefund({
      schoolId: school.schoolId,
      requestedBy: school.userId,
      ...data,
    })
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Approve refund
 */
export const approveExistingRefund = authServerFn
  .inputValidator(approveRefundSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    const result = await approveRefund(data.refundId, school.userId)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Reject refund
 */
export const rejectExistingRefund = authServerFn
  .inputValidator(rejectRefundSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await rejectRefund(data.refundId, data.rejectionReason)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Process refund
 */
export const processExistingRefund = authServerFn
  .inputValidator(processRefundSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    const result = await processRefund(data.refundId, school.userId, data.reference)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Cancel refund
 */
export const cancelExistingRefund = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: refundId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await cancelRefund(refundId)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })
