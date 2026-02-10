import { Result as R } from '@praha/byethrow'
import {
  createStudentFee,
  createStudentFeesBulk,
  getStudentFeeById,
  getStudentFees,
  getStudentFeeSummary,
  getStudentFeesWithDetails,
  getStudentsWithOutstandingBalance,
  waiveStudentFee,
} from '@repo/data-ops/queries/student-fees'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'

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
export const getStudentFeesList = authServerFn
  .inputValidator(z.object({
    studentId: z.string().optional(),
    enrollmentId: z.string().optional(),
    status: z.enum(['pending', 'partial', 'paid', 'waived', 'cancelled']).optional(),
  }).optional())
  .handler(async ({ data: filters, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await getStudentFees(filters ?? {})
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Get student fees with details
 */
export const getStudentFeesDetails = authServerFn
  .inputValidator(z.object({ studentId: z.string(), schoolYearId: z.string().optional() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolYear } = context
    const schoolYearId = data.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      return { success: false as const, error: 'Année scolaire non sélectionnée' }

    const result = await getStudentFeesWithDetails(data.studentId, schoolYearId)
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Get student fee summary
 */
export const getStudentFeeSummaryData = authServerFn
  .inputValidator(z.object({ studentId: z.string(), schoolYearId: z.string().optional() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolYear } = context
    const schoolYearId = data.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      return { success: false as const, error: 'Année scolaire non sélectionnée' }

    const result = await getStudentFeeSummary(data.studentId, schoolYearId)
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Get single student fee
 */
export const getStudentFee = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: studentFeeId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await getStudentFeeById(studentFeeId)
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Create student fee
 */
export const createNewStudentFee = authServerFn
  .inputValidator(createStudentFeeSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await createStudentFee(data)
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Bulk create student fees
 */
export const bulkCreateStudentFees = authServerFn
  .inputValidator(bulkCreateStudentFeesSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await createStudentFeesBulk(data.fees)
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Waive student fee
 */
export const waiveExistingStudentFee = authServerFn
  .inputValidator(waiveFeeSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    const result = await waiveStudentFee(data.studentFeeId, school.userId, data.reason)
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Get students with outstanding balance
 */
export const getStudentsWithBalance = authServerFn
  .inputValidator(z.object({ schoolYearId: z.string().optional() }).optional())
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school, schoolYear } = context
    const schoolYearId = data?.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      return { success: false as const, error: 'Année scolaire non sélectionnée' }

    const result = await getStudentsWithOutstandingBalance(school.schoolId, schoolYearId)
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })
