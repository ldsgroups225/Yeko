import type { ServerContext } from '../lib/server-fn'
import {
  createDiscount,
  deactivateDiscount,
  deleteDiscount,
  getAutoApplyDiscounts,
  getDiscountById,
  getDiscounts,
  updateDiscount,
} from '@repo/data-ops'
import { DatabaseError } from '@repo/data-ops/errors'
import { z } from 'zod'
import { createDiscountSchema, updateDiscountSchema } from '@/schemas/discount'
import { createAuthenticatedServerFn } from '../lib/server-fn'

/**
 * Filters for discounts queries
 */
const discountFiltersSchema = z.object({
  type: z.enum(['sibling', 'scholarship', 'staff', 'early_payment', 'financial_aid', 'other']).optional(),
  includeInactive: z.boolean().optional(),
})

/**
 * Get discounts list
 */
export const getDiscountsList = createAuthenticatedServerFn()
  .inputValidator(discountFiltersSchema.optional())
  .handler(async ({ data: filters, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await getDiscounts({
      schoolId: school.schoolId,
      ...filters,
    })

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get auto-apply discounts
 */
export const getAutoApplyDiscountsList = createAuthenticatedServerFn()
  .handler(async ({ context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await getAutoApplyDiscounts(school.schoolId)

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get single discount
 */
export const getDiscount = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: discountId }) => {
    const result = await getDiscountById(discountId)

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Create new discount
 */
export const createNewDiscount = createAuthenticatedServerFn()
  .inputValidator(createDiscountSchema)
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await createDiscount({
      schoolId: school.schoolId,
      ...data,
    })

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Update discount
 */
export const updateExistingDiscount = createAuthenticatedServerFn()
  .inputValidator(updateDiscountSchema)
  .handler(async ({ data }) => {
    const { id, ...updateData } = data
    const result = await updateDiscount(id, updateData)

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Deactivate discount
 */
export const deactivateExistingDiscount = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: discountId }) => {
    const result = await deactivateDiscount(discountId)

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Delete discount
 */
export const deleteExistingDiscount = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: discountId }) => {
    const result = await deleteDiscount(discountId)

    return result.match(
      () => ({ success: true as const }),
      error => ({ success: false as const, error: error.message }),
    )
  })
