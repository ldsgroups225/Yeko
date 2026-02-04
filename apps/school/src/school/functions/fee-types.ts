import {
  createFeeType,
  deleteFeeType,
  getFeeTypeById,
  getFeeTypes,
  updateFeeType,
} from '@repo/data-ops/queries/fee-types'
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
