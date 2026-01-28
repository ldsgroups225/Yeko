import type { ServerContext } from '../lib/server-fn'
import {
  createFeeType,
  deleteFeeType,
  getFeeTypeById,
  getFeeTypes,
  updateFeeType,
} from '@repo/data-ops'
import { DatabaseError } from '@repo/data-ops/errors'
import { z } from 'zod'
import { createFeeTypeSchema, updateFeeTypeSchema } from '@/schemas/fee-type'
import { createAuthenticatedServerFn } from '../lib/server-fn'

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
export const getFeeTypesList = createAuthenticatedServerFn()
  .inputValidator(feeTypeFiltersSchema.optional())
  .handler(async ({ data: filters, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await getFeeTypes({
      schoolId: school.schoolId,
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
export const getFeeType = createAuthenticatedServerFn()
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
export const createNewFeeType = createAuthenticatedServerFn()
  .inputValidator(createFeeTypeSchema)
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await createFeeType({
      schoolId: school.schoolId,
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
export const updateExistingFeeType = createAuthenticatedServerFn()
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
export const deleteExistingFeeType = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: feeTypeId }) => {
    const result = await deleteFeeType(feeTypeId)

    return result.match(
      () => ({ success: true as const }),
      error => ({ success: false as const, error: error.message }),
    )
  })
