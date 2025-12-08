import {
  createFeeType,
  deleteFeeType,
  getFeeTypeById,
  getFeeTypes,
  updateFeeType,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createFeeTypeSchema, updateFeeTypeSchema } from '@/schemas/fee-type'
import { getSchoolContext } from '../middleware/school-context'

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
export const getFeeTypesList = createServerFn()
  .inputValidator(feeTypeFiltersSchema.optional())
  .handler(async ({ data: filters }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getFeeTypes({
      schoolId: context.schoolId,
      ...filters,
    })
  })

/**
 * Get single fee type
 */
export const getFeeType = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: feeTypeId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getFeeTypeById(feeTypeId)
  })

/**
 * Create new fee type
 */
export const createNewFeeType = createServerFn()
  .inputValidator(createFeeTypeSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await createFeeType({
      schoolId: context.schoolId,
      ...data,
    })
  })

/**
 * Update fee type
 */
export const updateExistingFeeType = createServerFn()
  .inputValidator(updateFeeTypeSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const { id, ...updateData } = data
    return await updateFeeType(id, updateData)
  })

/**
 * Delete fee type
 */
export const deleteExistingFeeType = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: feeTypeId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    await deleteFeeType(feeTypeId)
    return { success: true }
  })
