import { Result as R } from '@praha/byethrow'
import {
  createDiscount,
  deactivateDiscount,
  deleteDiscount,
  getAutoApplyDiscounts,
  getDiscountById,
  getDiscounts,
  updateDiscount,
} from '@repo/data-ops/queries/discounts'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { z } from 'zod'
import { createDiscountSchema, updateDiscountSchema } from '@/schemas/discount'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

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
export const getDiscountsList = authServerFn
  .inputValidator(discountFiltersSchema.optional())
  .handler(async ({ data: filters, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('finance', 'view')

    const _result1 = await getDiscounts({
      schoolId,
      ...filters,
    })
    if (R.isFailure(_result1))
      return { success: false as const, error: 'Erreur lors de la récupération des remises' }
    return { success: true as const, data: _result1.value }
  })

/**
 * Get auto-apply discounts
 */
export const getAutoApplyDiscountsList = authServerFn
  .handler(async ({ context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('finance', 'view')

    const _result2 = await getAutoApplyDiscounts(schoolId)
    if (R.isFailure(_result2))
      return { success: false as const, error: 'Erreur lors de la récupération des remises automatiques' }
    return { success: true as const, data: _result2.value }
  })

/**
 * Get single discount
 */
export const getDiscount = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: discountId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('finance', 'view')

    const _result3 = await getDiscountById(discountId)
    if (R.isFailure(_result3))
      return { success: false as const, error: 'Erreur lors de la récupération de la remise' }
    return { success: true as const, data: _result3.value }
  })

/**
 * Create new discount
 */
export const createNewDiscount = authServerFn
  .inputValidator(createDiscountSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('finance', 'create')

    const _result4 = await createDiscount({
      schoolId,
      ...data,
    })
    if (R.isFailure(_result4))
      return { success: false as const, error: 'Erreur lors de la création de la remise' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'discounts',
      recordId: _result4.value.id,
      newValues: data,
    })
    return { success: true as const, data: _result4.value }
  })

/**
 * Update discount
 */
export const updateExistingDiscount = authServerFn
  .inputValidator(updateDiscountSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('finance', 'edit')

    const { id, ...updateData } = data
    const _result5 = await updateDiscount(id, updateData)
    if (R.isFailure(_result5))
      return { success: false as const, error: 'Erreur lors de la mise à jour de la remise' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'discounts',
      recordId: id,
      newValues: updateData,
    })
    return { success: true as const, data: _result5.value }
  })

/**
 * Deactivate discount
 */
export const deactivateExistingDiscount = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: discountId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('finance', 'edit')

    const _result6 = await deactivateDiscount(discountId)
    if (R.isFailure(_result6))
      return { success: false as const, error: 'Erreur lors de la désactivation de la remise' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'discounts',
      recordId: discountId,
      newValues: { status: 'inactive' },
    })
    return { success: true as const, data: _result6.value }
  })

/**
 * Delete discount
 */
export const deleteExistingDiscount = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: discountId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('finance', 'delete')

    const _result7 = await deleteDiscount(discountId)
    if (R.isFailure(_result7))
      return { success: false as const, error: 'Erreur lors de la suppression de la remise' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'delete',
      tableName: 'discounts',
      recordId: discountId,
    })
    return { success: true as const, data: { success: true } }
  })
