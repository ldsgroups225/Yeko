import type { ServerContext } from '../lib/server-fn'
import {
  createStudentFee,
  createStudentFeesBulk,
  getStudentFeeById,
  getStudentFees,
  getStudentFeeSummary,
  getStudentFeesWithDetails,
  getStudentsWithOutstandingBalance,
  waiveStudentFee,
} from '@repo/data-ops'
import { DatabaseError } from '@repo/data-ops/errors'
import { z } from 'zod'
import { createAuthenticatedServerFn } from '../lib/server-fn'

/**
 * Amount validation
 */
const amountSchema = z.string().regex(/^\d+(\.\d{1,2})?$/)

/**
 * Create student fee schema
 */
const createStudentFeeSchema = z.object({
  studentId: z.string().min(1),
  enrollmentId: z.string().min(1),
  feeStructureId: z.string().min(1),
  originalAmount: amountSchema,
  discountAmount: amountSchema.optional(),
  finalAmount: amountSchema,
  balance: amountSchema,
})

/**
 * Bulk create student fees schema
 */
const bulkCreateStudentFeesSchema = z.object({
  fees: z.array(createStudentFeeSchema).min(1),
})

/**
 * Waive fee schema
 */
const waiveFeeSchema = z.object({
  studentFeeId: z.string().min(1),
  reason: z.string().min(5, 'Motif requis (min 5 caractères)').max(500),
})

/**
 * Get student fees
 */
export const getStudentFeesList = createAuthenticatedServerFn()
  .inputValidator(z.object({
    studentId: z.string().optional(),
    enrollmentId: z.string().optional(),
    status: z.enum(['pending', 'partial', 'paid', 'waived', 'cancelled']).optional(),
  }).optional())
  .handler(async ({ data: filters, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await getStudentFees(filters ?? {})
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get student fees with details
 */
export const getStudentFeesDetails = createAuthenticatedServerFn()
  .inputValidator(z.object({ studentId: z.string(), schoolYearId: z.string().optional() }))
  .handler(async ({ data, context }) => {
    const { school, schoolYear } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const schoolYearId = data.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      throw new DatabaseError('UNAUTHORIZED', 'No school year context')

    const result = await getStudentFeesWithDetails(data.studentId, schoolYearId)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get student fee summary
 */
export const getStudentFeeSummaryData = createAuthenticatedServerFn()
  .inputValidator(z.object({ studentId: z.string(), schoolYearId: z.string().optional() }))
  .handler(async ({ data, context }) => {
    const { school, schoolYear } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const schoolYearId = data.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      throw new DatabaseError('UNAUTHORIZED', 'No school year context')

    const result = await getStudentFeeSummary(data.studentId, schoolYearId)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get single student fee
 */
export const getStudentFee = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: studentFeeId, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await getStudentFeeById(studentFeeId)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Create student fee
 */
export const createNewStudentFee = createAuthenticatedServerFn()
  .inputValidator(createStudentFeeSchema)
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await createStudentFee(data)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Bulk create student fees
 */
export const bulkCreateStudentFees = createAuthenticatedServerFn()
  .inputValidator(bulkCreateStudentFeesSchema)
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await createStudentFeesBulk(data.fees)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Waive student fee
 */
export const waiveExistingStudentFee = createAuthenticatedServerFn()
  .inputValidator(waiveFeeSchema)
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await waiveStudentFee(data.studentFeeId, school.userId, data.reason)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get students with outstanding balance
 */
export const getStudentsWithBalance = createAuthenticatedServerFn()
  .inputValidator(z.object({ schoolYearId: z.string().optional() }).optional())
  .handler(async ({ data, context }) => {
    const { school, schoolYear } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const schoolYearId = data?.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      throw new DatabaseError('UNAUTHORIZED', 'No school year context')

    const result = await getStudentsWithOutstandingBalance(school.schoolId, schoolYearId)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })
