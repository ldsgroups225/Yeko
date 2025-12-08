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
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createPaymentPlanFromTemplateSchema, createPaymentPlanTemplateSchema, updatePaymentPlanTemplateSchema } from '@/schemas/payment-plan'
import { getSchoolContext, getSchoolYearContext } from '../middleware/school-context'

// ============ PAYMENT PLAN TEMPLATES ============

/**
 * Get payment plan templates
 */
export const getPaymentPlanTemplatesList = createServerFn()
  .inputValidator(z.object({ schoolYearId: z.string().optional(), includeInactive: z.boolean().optional() }).optional())
  .handler(async ({ data: filters }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const yearContext = await getSchoolYearContext()
    const schoolYearId = filters?.schoolYearId || yearContext?.schoolYearId
    if (!schoolYearId)
      throw new Error('No school year context')

    return await getPaymentPlanTemplates({
      schoolId: context.schoolId,
      schoolYearId,
      includeInactive: filters?.includeInactive,
    })
  })

/**
 * Get default payment plan template
 */
export const getDefaultTemplate = createServerFn()
  .inputValidator(z.object({ schoolYearId: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const yearContext = await getSchoolYearContext()
    const schoolYearId = data?.schoolYearId || yearContext?.schoolYearId
    if (!schoolYearId)
      throw new Error('No school year context')

    return await getDefaultPaymentPlanTemplate(context.schoolId, schoolYearId)
  })

/**
 * Get single template
 */
export const getPaymentPlanTemplate = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: templateId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getPaymentPlanTemplateById(templateId)
  })

/**
 * Create payment plan template
 */
export const createNewPaymentPlanTemplate = createServerFn()
  .inputValidator(createPaymentPlanTemplateSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await createPaymentPlanTemplate({
      schoolId: context.schoolId,
      ...data,
    })
  })

/**
 * Update payment plan template
 */
export const updateExistingPaymentPlanTemplate = createServerFn()
  .inputValidator(updatePaymentPlanTemplateSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const { id, ...updateData } = data
    return await updatePaymentPlanTemplate(id, updateData)
  })

/**
 * Set default template
 */
export const setDefaultTemplate = createServerFn()
  .inputValidator(z.object({ templateId: z.string(), schoolYearId: z.string().optional() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const yearContext = await getSchoolYearContext()
    const schoolYearId = data.schoolYearId || yearContext?.schoolYearId
    if (!schoolYearId)
      throw new Error('No school year context')

    await setDefaultPaymentPlanTemplate(context.schoolId, schoolYearId, data.templateId)
    return { success: true }
  })

/**
 * Delete template
 */
export const deleteExistingPaymentPlanTemplate = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: templateId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    await deletePaymentPlanTemplate(templateId)
    return { success: true }
  })

// ============ PAYMENT PLANS ============

/**
 * Get payment plans
 */
export const getPaymentPlansList = createServerFn()
  .inputValidator(z.object({
    schoolYearId: z.string().optional(),
    studentId: z.string().optional(),
    status: z.enum(['active', 'completed', 'defaulted', 'cancelled']).optional(),
  }).optional())
  .handler(async ({ data: filters }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const yearContext = await getSchoolYearContext()
    const schoolYearId = filters?.schoolYearId || yearContext?.schoolYearId
    if (!schoolYearId)
      throw new Error('No school year context')

    return await getPaymentPlans({
      schoolYearId,
      ...filters,
    })
  })

/**
 * Get payment plan for student
 */
export const getStudentPaymentPlan = createServerFn()
  .inputValidator(z.object({ studentId: z.string(), schoolYearId: z.string().optional() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const yearContext = await getSchoolYearContext()
    const schoolYearId = data.schoolYearId || yearContext?.schoolYearId
    if (!schoolYearId)
      throw new Error('No school year context')

    return await getPaymentPlanForStudent(data.studentId, schoolYearId)
  })

/**
 * Get payment plan with installments
 */
export const getPaymentPlanWithInstallments = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: paymentPlanId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const [plan, installments] = await Promise.all([
      getPaymentPlanById(paymentPlanId),
      getInstallmentsByPaymentPlan(paymentPlanId),
    ])

    return { plan, installments }
  })

/**
 * Create payment plan from template
 */
export const createStudentPaymentPlan = createServerFn()
  .inputValidator(createPaymentPlanFromTemplateSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await createPaymentPlanFromTemplate({
      ...data,
      createdBy: context.userId,
    })
  })

/**
 * Cancel payment plan
 */
export const cancelStudentPaymentPlan = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: paymentPlanId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await cancelPaymentPlan(paymentPlanId)
  })

/**
 * Get payment plans summary
 */
export const getPaymentPlansSummaryData = createServerFn()
  .inputValidator(z.object({ schoolYearId: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const yearContext = await getSchoolYearContext()
    const schoolYearId = data?.schoolYearId || yearContext?.schoolYearId
    if (!schoolYearId)
      throw new Error('No school year context')

    return await getPaymentPlansSummary(schoolYearId)
  })
