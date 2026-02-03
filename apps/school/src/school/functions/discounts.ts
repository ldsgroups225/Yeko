import {
  createDiscount,
  deactivateDiscount,
  deleteDiscount,
  getAutoApplyDiscounts,
  getDiscountById,
  getDiscounts,
  updateDiscount,
} from '@repo/data-ops'
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

    return (await getDiscounts({
      schoolId,
      ...filters,
    })).match(
      data => ({ success: true as const, data }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des remises' }),
    )
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

    return (await getAutoApplyDiscounts(schoolId)).match(
      data => ({ success: true as const, data }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des remises automatiques' }),
    )
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

    return (await getDiscountById(discountId)).match(
      data => ({ success: true as const, data }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération de la remise' }),
    )
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

    return (await createDiscount({
      schoolId,
      ...data,
    })).match(
      async (result) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'create',
          tableName: 'discounts',
          recordId: result.id,
          newValues: data,
        })
        return { success: true as const, data: result }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la création de la remise' }),
    )
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
    return (await updateDiscount(id, updateData)).match(
      async (result) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'update',
          tableName: 'discounts',
          recordId: id,
          newValues: updateData,
        })
        return { success: true as const, data: result }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la mise à jour de la remise' }),
    )
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

    return (await deactivateDiscount(discountId)).match(
      async (result) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'update',
          tableName: 'discounts',
          recordId: discountId,
          newValues: { status: 'inactive' },
        })
        return { success: true as const, data: result }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la désactivation de la remise' }),
    )
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

    return (await deleteDiscount(discountId)).match(
      async () => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'delete',
          tableName: 'discounts',
          recordId: discountId,
        })
        return { success: true as const, data: { success: true } }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la suppression de la remise' }),
    )
  })
