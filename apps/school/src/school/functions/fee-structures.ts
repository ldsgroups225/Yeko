import {
  createFeeStructure,
  createFeeStructuresBulk,
  deleteFeeStructure,
  getFeeStructureById,
  getFeeStructures,
  getFeeStructuresWithTypes,
  updateFeeStructure,
} from '@repo/data-ops'
import { z } from 'zod'
import { bulkCreateFeeStructuresSchema, createFeeStructureSchema, updateFeeStructureSchema } from '@/schemas/fee-structure'
import { authServerFn } from '../lib/server-fn'

/**
 * Filters for fee structures queries
 */
const feeStructureFiltersSchema = z.object({
  schoolYearId: z.string().optional(),
  gradeId: z.string().optional(),
  seriesId: z.string().optional(),
  feeTypeId: z.string().optional(),
})

/**
 * Get fee structures list
 */
export const getFeeStructuresList = authServerFn
  .inputValidator(feeStructureFiltersSchema.optional())
  .handler(async ({ data: filters, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school, schoolYear } = context
    const schoolYearId = filters?.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      return { success: false as const, error: 'Année scolaire non sélectionnée' }

    const result = await getFeeStructures({
      schoolId: school.schoolId,
      schoolYearId,
      ...filters,
    })

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get fee structures with fee type details
 */
export const getFeeStructuresWithDetails = authServerFn
  .inputValidator(feeStructureFiltersSchema.optional())
  .handler(async ({ data: filters, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school, schoolYear } = context
    const schoolYearId = filters?.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      return { success: false as const, error: 'Année scolaire non sélectionnée' }

    const result = await getFeeStructuresWithTypes({
      schoolId: school.schoolId,
      schoolYearId,
      gradeId: filters?.gradeId,
    })

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get single fee structure
 */
export const getFeeStructure = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: feeStructureId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await getFeeStructureById(feeStructureId)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Create new fee structure
 */
export const createNewFeeStructure = authServerFn
  .inputValidator(createFeeStructureSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await createFeeStructure({
      schoolId: context.school.schoolId,
      ...data,
    })

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Bulk create fee structures
 */
export const bulkCreateFeeStructures = authServerFn
  .inputValidator(bulkCreateFeeStructuresSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    const structures = data.structures.map(s => ({
      ...s,
      schoolId: school.schoolId,
      schoolYearId: data.schoolYearId,
      feeTypeId: data.feeTypeId,
    }))

    const result = await createFeeStructuresBulk(structures)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Update fee structure
 */
export const updateExistingFeeStructure = authServerFn
  .inputValidator(updateFeeStructureSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { id, ...updateData } = data
    const result = await updateFeeStructure(id, updateData)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Delete fee structure
 */
export const deleteExistingFeeStructure = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: feeStructureId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await deleteFeeStructure(feeStructureId)
    return result.match(
      () => ({ success: true as const, data: { success: true } }),
      error => ({ success: false as const, error: error.message }),
    )
  })
