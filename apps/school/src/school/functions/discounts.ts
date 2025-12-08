import {
  createDiscount,
  deactivateDiscount,
  deleteDiscount,
  getAutoApplyDiscounts,
  getDiscountById,
  getDiscounts,
  updateDiscount,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createDiscountSchema, updateDiscountSchema } from '@/schemas/discount'
import { getSchoolContext } from '../middleware/school-context'

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
export const getDiscountsList = createServerFn()
  .inputValidator(discountFiltersSchema.optional())
  .handler(async ({ data: filters }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getDiscounts({
      schoolId: context.schoolId,
      ...filters,
    })
  })

/**
 * Get auto-apply discounts
 */
export const getAutoApplyDiscountsList = createServerFn()
  .handler(async () => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getAutoApplyDiscounts(context.schoolId)
  })

/**
 * Get single discount
 */
export const getDiscount = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: discountId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getDiscountById(discountId)
  })

/**
 * Create new discount
 */
export const createNewDiscount = createServerFn()
  .inputValidator(createDiscountSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await createDiscount({
      schoolId: context.schoolId,
      ...data,
    })
  })

/**
 * Update discount
 */
export const updateExistingDiscount = createServerFn()
  .inputValidator(updateDiscountSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const { id, ...updateData } = data
    return await updateDiscount(id, updateData)
  })

/**
 * Deactivate discount
 */
export const deactivateExistingDiscount = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: discountId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await deactivateDiscount(discountId)
  })

/**
 * Delete discount
 */
export const deleteExistingDiscount = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: discountId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    await deleteDiscount(discountId)
    return { success: true }
  })
