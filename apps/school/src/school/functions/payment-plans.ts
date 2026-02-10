import { Result as R } from '@praha/byethrow'
import { getInstallmentsByPaymentPlan } from '@repo/data-ops/queries/installments'
import {
  createPaymentPlanTemplate,
  deletePaymentPlanTemplate,
  getDefaultPaymentPlanTemplate,
  getPaymentPlanTemplateById,
  getPaymentPlanTemplates,
  setDefaultPaymentPlanTemplate,
  updatePaymentPlanTemplate,
} from '@repo/data-ops/queries/payment-plan-templates'
import {
  cancelPaymentPlan,
  createPaymentPlanFromTemplate,
  getPaymentPlanById,
  getPaymentPlanForStudent,
  getPaymentPlans,
  getPaymentPlansSummary,
} from '@repo/data-ops/queries/payment-plans'
import { z } from 'zod'
import { createPaymentPlanFromTemplateSchema, createPaymentPlanTemplateSchema, updatePaymentPlanTemplateSchema } from '@/schemas/payment-plan'
import { authServerFn } from '../lib/server-fn'

// ============ PAYMENT PLAN TEMPLATES ============

/**
 * Get payment plan templates
 */
export const getPaymentPlanTemplatesList = authServerFn
  .inputValidator(z.object({ schoolYearId: z.string().optional(), includeInactive: z.boolean().optional() }).optional())
  .handler(async ({ data: filters, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school, schoolYear } = context
    const schoolYearId = filters?.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      return { success: false as const, error: 'Année scolaire non sélectionnée' }

    const result = await getPaymentPlanTemplates({
      schoolId: school.schoolId,
      schoolYearId,
      includeInactive: filters?.includeInactive,
    })

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Get default payment plan template
 */
export const getDefaultTemplate = authServerFn
  .inputValidator(z.object({ schoolYearId: z.string().optional() }).optional())
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school, schoolYear } = context
    const schoolYearId = data?.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      return { success: false as const, error: 'Année scolaire non sélectionnée' }

    const result = await getDefaultPaymentPlanTemplate(school.schoolId, schoolYearId)

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Get single template
 */
export const getPaymentPlanTemplate = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: templateId }) => {
    const result = await getPaymentPlanTemplateById(templateId)

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Create payment plan template
 */
export const createNewPaymentPlanTemplate = authServerFn
  .inputValidator(createPaymentPlanTemplateSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await createPaymentPlanTemplate({
      schoolId: context.school.schoolId,
      ...data,
    })

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Update payment plan template
 */
export const updateExistingPaymentPlanTemplate = authServerFn
  .inputValidator(updatePaymentPlanTemplateSchema)
  .handler(async ({ data }) => {
    const { id, ...updateData } = data
    const result = await updatePaymentPlanTemplate(id, updateData)

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Set default template
 */
export const setDefaultTemplate = authServerFn
  .inputValidator(z.object({ templateId: z.string(), schoolYearId: z.string().optional() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school, schoolYear } = context
    const schoolYearId = data.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      return { success: false as const, error: 'Année scolaire non sélectionnée' }

    const result = await setDefaultPaymentPlanTemplate(school.schoolId, schoolYearId, data.templateId)

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: { success: true } }
  })

/**
 * Delete template
 */
export const deleteExistingPaymentPlanTemplate = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: templateId }) => {
    const result = await deletePaymentPlanTemplate(templateId)

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: { success: true } }
  })

// ============ PAYMENT PLANS ============

/**
 * Get payment plans
 */
export const getPaymentPlansList = authServerFn
  .inputValidator(z.object({
    schoolYearId: z.string().optional(),
    studentId: z.string().optional(),
    status: z.enum(['active', 'completed', 'defaulted', 'cancelled']).optional(),
  }).optional())
  .handler(async ({ data: filters, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolYear } = context
    const schoolYearId = filters?.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      return { success: false as const, error: 'Année scolaire non sélectionnée' }

    const result = await getPaymentPlans({
      schoolYearId,
      ...filters,
    })

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Get payment plan for student
 */
export const getStudentPaymentPlan = authServerFn
  .inputValidator(z.object({ studentId: z.string(), schoolYearId: z.string().optional() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolYear } = context
    const schoolYearId = data.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      return { success: false as const, error: 'Année scolaire non sélectionnée' }

    const result = await getPaymentPlanForStudent(data.studentId, schoolYearId)

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Get payment plan with installments
 */
export const getPaymentPlanWithInstallments = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: paymentPlanId }) => {
    // We execute both promises first
    const [planParams, installmentsParams] = await Promise.all([
      getPaymentPlanById(paymentPlanId),
      getInstallmentsByPaymentPlan(paymentPlanId),
    ])

    // Then sequence the results using byethrow
    const result = R.sequence([planParams, installmentsParams])

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }

    const [plan, installments] = result.value
    return { success: true as const, data: { plan, installments } }
  })

/**
 * Create payment plan from template
 */
export const createStudentPaymentPlan = authServerFn
  .inputValidator(createPaymentPlanFromTemplateSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await createPaymentPlanFromTemplate({
      ...data,
      createdBy: context.school.userId,
    })

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Cancel payment plan
 */
export const cancelStudentPaymentPlan = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: paymentPlanId }) => {
    const result = await cancelPaymentPlan(paymentPlanId)

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Get payment plans summary
 */
export const getPaymentPlansSummaryData = authServerFn
  .inputValidator(z.object({ schoolYearId: z.string().optional() }).optional())
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolYear } = context
    const schoolYearId = data?.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      return { success: false as const, error: 'Année scolaire non sélectionnée' }

    const result = await getPaymentPlansSummary(schoolYearId)

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })
