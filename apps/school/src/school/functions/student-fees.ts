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
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getSchoolContext, getSchoolYearContext } from '../middleware/school-context'

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
export const getStudentFeesList = createServerFn()
  .inputValidator(z.object({
    studentId: z.string().optional(),
    enrollmentId: z.string().optional(),
    status: z.enum(['pending', 'partial', 'paid', 'waived', 'cancelled']).optional(),
  }).optional())
  .handler(async ({ data: filters }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getStudentFees(filters ?? {})
  })

/**
 * Get student fees with details
 */
export const getStudentFeesDetails = createServerFn()
  .inputValidator(z.object({ studentId: z.string(), schoolYearId: z.string().optional() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const yearContext = await getSchoolYearContext()
    const schoolYearId = data.schoolYearId || yearContext?.schoolYearId
    if (!schoolYearId)
      throw new Error('No school year context')

    return await getStudentFeesWithDetails(data.studentId, schoolYearId)
  })

/**
 * Get student fee summary
 */
export const getStudentFeeSummaryData = createServerFn()
  .inputValidator(z.object({ studentId: z.string(), schoolYearId: z.string().optional() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const yearContext = await getSchoolYearContext()
    const schoolYearId = data.schoolYearId || yearContext?.schoolYearId
    if (!schoolYearId)
      throw new Error('No school year context')

    return await getStudentFeeSummary(data.studentId, schoolYearId)
  })

/**
 * Get single student fee
 */
export const getStudentFee = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: studentFeeId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getStudentFeeById(studentFeeId)
  })

/**
 * Create student fee
 */
export const createNewStudentFee = createServerFn()
  .inputValidator(createStudentFeeSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await createStudentFee(data)
  })

/**
 * Bulk create student fees
 */
export const bulkCreateStudentFees = createServerFn()
  .inputValidator(bulkCreateStudentFeesSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await createStudentFeesBulk(data.fees)
  })

/**
 * Waive student fee
 */
export const waiveExistingStudentFee = createServerFn()
  .inputValidator(waiveFeeSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await waiveStudentFee(data.studentFeeId, context.userId, data.reason)
  })

/**
 * Get students with outstanding balance
 */
export const getStudentsWithBalance = createServerFn()
  .inputValidator(z.object({ schoolYearId: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const yearContext = await getSchoolYearContext()
    const schoolYearId = data?.schoolYearId || yearContext?.schoolYearId
    if (!schoolYearId)
      throw new Error('No school year context')

    return await getStudentsWithOutstandingBalance(context.schoolId, schoolYearId)
  })
