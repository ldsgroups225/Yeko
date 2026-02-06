import {
  createFeeType,
  deleteFeeType,
  getFeeTypeById,
  getFeeTypes,
  updateFeeType,
} from '@repo/data-ops/queries/fee-types'
import { getFeeTypeTemplates } from '@repo/data-ops/queries/fee-type-templates'
import { z } from 'zod'
import { createFeeTypeSchema, updateFeeTypeSchema } from '@/schemas/fee-type'
import { authServerFn } from '../lib/server-fn'

/**
 * Filters for fee types queries
 */
const feeTypeFiltersSchema = z.object({
  category: z.enum(['tuition', 'registration', 'exam', 'transport', 'uniform', 'books', 'meals', 'activities', 'other']).optional(),
  includeInactive: z.boolean().optional(),
})

/**
 * Get fee types list
 */
export const getFeeTypesList = authServerFn
  .inputValidator(feeTypeFiltersSchema.optional())
  .handler(async ({ data: filters, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await getFeeTypes({
      schoolId: context.school.schoolId,
      ...filters,
    })

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get single fee type
 */
export const getFeeType = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: feeTypeId }) => {
    const result = await getFeeTypeById(feeTypeId)

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Create new fee type
 */
export const createNewFeeType = authServerFn
  .inputValidator(createFeeTypeSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await createFeeType({
      schoolId: context.school.schoolId,
      ...data,
    })

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Update fee type
 */
export const updateExistingFeeType = authServerFn
  .inputValidator(updateFeeTypeSchema)
  .handler(async ({ data }) => {
    const { id, ...updateData } = data
    const result = await updateFeeType(id, updateData)

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Delete fee type
 */
export const deleteExistingFeeType = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: feeTypeId }) => {
    const result = await deleteFeeType(feeTypeId)

    return result.match(
      () => ({ success: true as const, data: { success: true } }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get available templates for importing
 */
export const getAvailableTemplates = authServerFn.handler(async () => {
  const result = await getFeeTypeTemplates({})

  return result.match(
    data => ({ success: true as const, data }),
    error => ({ success: false as const, error: error.message }),
  )
})

/**
 * Import fee types from templates
 */
const importFromTemplatesSchema = z.object({
  templateIds: z.array(z.string()).min(1),
})

export const importFeeTypesFromTemplates = authServerFn
  .inputValidator(importFromTemplatesSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const templatesResult = await getFeeTypeTemplates({})
    
    return templatesResult.match(
      async (templates) => {
        const selectedTemplates = templates.filter(t => data.templateIds.includes(t.id))
        let created = 0
        
        for (const template of selectedTemplates) {
          const result = await createFeeType({
            schoolId: context.school!.schoolId,
            feeTypeTemplateId: template.id,
            code: template.code,
            name: template.name,
            nameEn: template.nameEn ?? undefined,
            category: template.category,
            isMandatory: template.isMandatory,
            isRecurring: template.isRecurring,
            displayOrder: template.displayOrder,
            status: 'active',
          })
          
          if (result.isOk()) created++
        }
        
        return { success: true as const, data: { created } } as const
      },
      (error) => ({ success: false as const, error: error.message }),
    )
  })
