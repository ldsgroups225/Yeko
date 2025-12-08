import {
  cancelPayment,
  createPaymentWithAllocations,
  getCashierDailySummary,
  getPaymentById,
  getPaymentByReceiptNumber,
  getPayments,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { cancelPaymentSchema, createPaymentSchema } from '@/schemas/payment'
import { getSchoolContext } from '../middleware/school-context'

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
export const getPaymentsList = createServerFn()
  .inputValidator(paymentFiltersSchema.optional())
  .handler(async ({ data: filters }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getPayments({
      schoolId: context.schoolId,
      ...filters,
    })
  })

/**
 * Get single payment
 */
export const getPayment = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: paymentId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getPaymentById(paymentId)
  })

/**
 * Get payment by receipt number
 */
export const getPaymentByReceipt = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: receiptNumber }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getPaymentByReceiptNumber(context.schoolId, receiptNumber)
  })

/**
 * Record new payment with allocations
 */
export const recordPayment = createServerFn()
  .inputValidator(createPaymentSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await createPaymentWithAllocations({
      schoolId: context.schoolId,
      processedBy: context.userId,
      ...data,
    })
  })

/**
 * Cancel payment
 */
export const cancelExistingPayment = createServerFn()
  .inputValidator(cancelPaymentSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await cancelPayment(data.paymentId, context.userId, data.reason)
  })

/**
 * Get cashier daily summary
 */
export const getCashierSummary = createServerFn()
  .inputValidator(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    cashierId: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const cashierId = data.cashierId || context.userId
    return await getCashierDailySummary(context.schoolId, cashierId, data.date)
  })
