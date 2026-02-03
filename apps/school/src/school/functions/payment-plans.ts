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
import { ResultAsync } from 'neverthrow'
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

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
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

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get single template
 */
export const getPaymentPlanTemplate = authServerFn
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
export const createNewPaymentPlanTemplate = authServerFn
  .inputValidator(createPaymentPlanTemplateSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await createPaymentPlanTemplate({
      schoolId: context.school.schoolId,
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
export const updateExistingPaymentPlanTemplate = authServerFn
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

    return result.match(
      () => ({ success: true as const, data: { success: true } }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Delete template
 */
export const deleteExistingPaymentPlanTemplate = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: templateId }) => {
    const result = await deletePaymentPlanTemplate(templateId)

    return result.match(
      () => ({ success: true as const, data: { success: true } }),
      error => ({ success: false as const, error: error.message }),
    )
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

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
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

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get payment plan with installments
 */
export const getPaymentPlanWithInstallments = authServerFn
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
export const createStudentPaymentPlan = authServerFn
  .inputValidator(createPaymentPlanFromTemplateSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await createPaymentPlanFromTemplate({
      ...data,
      createdBy: context.school.userId,
    })

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Cancel payment plan
 */
export const cancelStudentPaymentPlan = authServerFn
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

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })
