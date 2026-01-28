import type { ServerContext } from '../lib/server-fn'
import {
  cancelPayment,
  createPaymentWithAllocations,
  getCashierDailySummary,
  getPaymentById,
  getPaymentByReceiptNumber,
  getPayments,
} from '@repo/data-ops'
import { DatabaseError } from '@repo/data-ops/errors'
import { z } from 'zod'
import { cancelPaymentSchema, createPaymentSchema } from '@/schemas/payment'
import { createAuthenticatedServerFn } from '../lib/server-fn'

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
export const getPaymentsList = createAuthenticatedServerFn()
  .inputValidator(paymentFiltersSchema.optional())
  .handler(async ({ data: filters, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await getPayments({
      schoolId: school.schoolId,
      ...filters,
    })

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get single payment
 */
export const getPayment = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: paymentId, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await getPaymentById(paymentId)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get payment by receipt number
 */
export const getPaymentByReceipt = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: receiptNumber, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await getPaymentByReceiptNumber(school.schoolId, receiptNumber)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Record new payment with allocations
 */
export const recordPayment = createAuthenticatedServerFn()
  .inputValidator(createPaymentSchema)
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await createPaymentWithAllocations({
      schoolId: school.schoolId,
      processedBy: school.userId,
      ...data,
    })

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Cancel payment
 */
export const cancelExistingPayment = createAuthenticatedServerFn()
  .inputValidator(cancelPaymentSchema)
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await cancelPayment(data.paymentId, school.userId, data.reason)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get cashier daily summary
 */
export const getCashierSummary = createAuthenticatedServerFn()
  .inputValidator(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    cashierId: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const cashierId = data.cashierId || school.userId
    const result = await getCashierDailySummary(school.schoolId, cashierId, data.date)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })
