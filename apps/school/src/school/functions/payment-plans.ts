import type { ServerContext } from '../lib/server-fn'
import {
  cancelPaymentPlan,
  createPaymentPlanFromTemplate,
  createPaymentPlanTemplate,
  deletePaymentPlanTemplate,
  getDefaultPaymentPlanTemplate,
  getInstallmentsByPaymentPlan,
  getPaymentPlanById,
  getPaymentPlanForStudent,
  getPaymentPlans,
  getPaymentPlansSummary,
  getPaymentPlanTemplateById,
  getPaymentPlanTemplates,
  setDefaultPaymentPlanTemplate,
  updatePaymentPlanTemplate,
} from '@repo/data-ops'
import { DatabaseError } from '@repo/data-ops/errors'
import { ResultAsync } from 'neverthrow'
import { z } from 'zod'
import { createPaymentPlanFromTemplateSchema, createPaymentPlanTemplateSchema, updatePaymentPlanTemplateSchema } from '@/schemas/payment-plan'
import { createAuthenticatedServerFn } from '../lib/server-fn'

// ============ PAYMENT PLAN TEMPLATES ============

/**
 * Get payment plan templates
 */
export const getPaymentPlanTemplatesList = createAuthenticatedServerFn()
  .inputValidator(z.object({ schoolYearId: z.string().optional(), includeInactive: z.boolean().optional() }).optional())
  .handler(async ({ data: filters, context }) => {
    const { school, schoolYear } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const schoolYearId = filters?.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      throw new DatabaseError('VALIDATION_ERROR', 'No school year context')

    const result = await getPaymentPlanTemplates({
      schoolId: school.schoolId,
      schoolYearId,
      includeInactive: filters?.includeInactive,
    })

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get default payment plan template
 */
export const getDefaultTemplate = createAuthenticatedServerFn()
  .inputValidator(z.object({ schoolYearId: z.string().optional() }).optional())
  .handler(async ({ data, context }) => {
    const { school, schoolYear } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const schoolYearId = data?.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      throw new DatabaseError('VALIDATION_ERROR', 'No school year context')

    const result = await getDefaultPaymentPlanTemplate(school.schoolId, schoolYearId)

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get single template
 */
export const getPaymentPlanTemplate = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: templateId }) => {
    const result = await getPaymentPlanTemplateById(templateId)

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Create payment plan template
 */
export const createNewPaymentPlanTemplate = createAuthenticatedServerFn()
  .inputValidator(createPaymentPlanTemplateSchema)
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await createPaymentPlanTemplate({
      schoolId: school.schoolId,
      ...data,
    })

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Update payment plan template
 */
export const updateExistingPaymentPlanTemplate = createAuthenticatedServerFn()
  .inputValidator(updatePaymentPlanTemplateSchema)
  .handler(async ({ data }) => {
    const { id, ...updateData } = data
    const result = await updatePaymentPlanTemplate(id, updateData)

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Set default template
 */
export const setDefaultTemplate = createAuthenticatedServerFn()
  .inputValidator(z.object({ templateId: z.string(), schoolYearId: z.string().optional() }))
  .handler(async ({ data, context }) => {
    const { school, schoolYear } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const schoolYearId = data.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      throw new DatabaseError('VALIDATION_ERROR', 'No school year context')

    const result = await setDefaultPaymentPlanTemplate(school.schoolId, schoolYearId, data.templateId)

    return result.match(
      () => ({ success: true as const }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Delete template
 */
export const deleteExistingPaymentPlanTemplate = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: templateId }) => {
    const result = await deletePaymentPlanTemplate(templateId)

    return result.match(
      () => ({ success: true as const }),
      error => ({ success: false as const, error: error.message }),
    )
  })

// ============ PAYMENT PLANS ============

/**
 * Get payment plans
 */
export const getPaymentPlansList = createAuthenticatedServerFn()
  .inputValidator(z.object({
    schoolYearId: z.string().optional(),
    studentId: z.string().optional(),
    status: z.enum(['active', 'completed', 'defaulted', 'cancelled']).optional(),
  }).optional())
  .handler(async ({ data: filters, context }) => {
    const { school, schoolYear } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const schoolYearId = filters?.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      throw new DatabaseError('VALIDATION_ERROR', 'No school year context')

    const result = await getPaymentPlans({
      schoolYearId,
      ...filters,
    })

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get payment plan for student
 */
export const getStudentPaymentPlan = createAuthenticatedServerFn()
  .inputValidator(z.object({ studentId: z.string(), schoolYearId: z.string().optional() }))
  .handler(async ({ data, context }) => {
    const { school, schoolYear } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const schoolYearId = data.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      throw new DatabaseError('VALIDATION_ERROR', 'No school year context')

    const result = await getPaymentPlanForStudent(data.studentId, schoolYearId)

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get payment plan with installments
 */
export const getPaymentPlanWithInstallments = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: paymentPlanId }) => {
    const result = await ResultAsync.combine([
      getPaymentPlanById(paymentPlanId),
      getInstallmentsByPaymentPlan(paymentPlanId),
    ])

    return result.match(
      ([plan, installments]) => ({ success: true as const, data: { plan, installments } }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Create payment plan from template
 */
export const createStudentPaymentPlan = createAuthenticatedServerFn()
  .inputValidator(createPaymentPlanFromTemplateSchema)
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await createPaymentPlanFromTemplate({
      ...data,
      createdBy: school.userId,
    })

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Cancel payment plan
 */
export const cancelStudentPaymentPlan = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: paymentPlanId }) => {
    const result = await cancelPaymentPlan(paymentPlanId)

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get payment plans summary
 */
export const getPaymentPlansSummaryData = createAuthenticatedServerFn()
  .inputValidator(z.object({ schoolYearId: z.string().optional() }).optional())
  .handler(async ({ data, context }) => {
    const { school, schoolYear } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const schoolYearId = data?.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      throw new DatabaseError('VALIDATION_ERROR', 'No school year context')

    const result = await getPaymentPlansSummary(schoolYearId)

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })
