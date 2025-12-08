import {
  approveRefund,
  cancelRefund,
  createRefund,
  getPendingRefundsCount,
  getRefundById,
  getRefunds,
  processRefund,
  rejectRefund,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { approveRefundSchema, createRefundSchema, processRefundSchema, rejectRefundSchema } from '@/schemas/refund'
import { getSchoolContext } from '../middleware/school-context'

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
export const getRefundsList = createServerFn()
  .inputValidator(refundFiltersSchema.optional())
  .handler(async ({ data: filters }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getRefunds({
      schoolId: context.schoolId,
      ...filters,
    })
  })

/**
 * Get single refund
 */
export const getRefund = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: refundId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getRefundById(refundId)
  })

/**
 * Get pending refunds count
 */
export const getPendingRefunds = createServerFn()
  .handler(async () => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getPendingRefundsCount(context.schoolId)
  })

/**
 * Request new refund
 */
export const requestRefund = createServerFn()
  .inputValidator(createRefundSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await createRefund({
      schoolId: context.schoolId,
      requestedBy: context.userId,
      ...data,
    })
  })

/**
 * Approve refund
 */
export const approveExistingRefund = createServerFn()
  .inputValidator(approveRefundSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await approveRefund(data.refundId, context.userId)
  })

/**
 * Reject refund
 */
export const rejectExistingRefund = createServerFn()
  .inputValidator(rejectRefundSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await rejectRefund(data.refundId, data.rejectionReason)
  })

/**
 * Process refund
 */
export const processExistingRefund = createServerFn()
  .inputValidator(processRefundSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await processRefund(data.refundId, context.userId, data.reference)
  })

/**
 * Cancel refund
 */
export const cancelExistingRefund = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: refundId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await cancelRefund(refundId)
  })
