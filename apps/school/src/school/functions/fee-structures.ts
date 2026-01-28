import type { ServerContext } from '../lib/server-fn'
import {
  createFeeStructure,
  createFeeStructuresBulk,
  deleteFeeStructure,

  getFeeStructureById,
  getFeeStructures,
  getFeeStructuresWithTypes,
  updateFeeStructure,
} from '@repo/data-ops'
import { DatabaseError } from '@repo/data-ops/errors'
import { z } from 'zod'
import { bulkCreateFeeStructuresSchema, createFeeStructureSchema, updateFeeStructureSchema } from '@/schemas/fee-structure'
import { createAuthenticatedServerFn } from '../lib/server-fn'

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
export const getFeeStructuresList = createAuthenticatedServerFn()
  .inputValidator(feeStructureFiltersSchema.optional())
  .handler(async ({ data: filters, context }) => {
    const { school, schoolYear } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const schoolYearId = filters?.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      throw new DatabaseError('VALIDATION_ERROR', 'No school year context')

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
export const getFeeStructuresWithDetails = createAuthenticatedServerFn()
  .inputValidator(feeStructureFiltersSchema.optional())
  .handler(async ({ data: filters, context }) => {
    const { school, schoolYear } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const schoolYearId = filters?.schoolYearId || schoolYear?.schoolYearId
    if (!schoolYearId)
      throw new DatabaseError('VALIDATION_ERROR', 'No school year context')

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
export const getFeeStructure = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: feeStructureId, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await getFeeStructureById(feeStructureId)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Create new fee structure
 */
export const createNewFeeStructure = createAuthenticatedServerFn()
  .inputValidator(createFeeStructureSchema)
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await createFeeStructure({
      schoolId: school.schoolId,
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
export const bulkCreateFeeStructures = createAuthenticatedServerFn()
  .inputValidator(bulkCreateFeeStructuresSchema)
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

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
export const updateExistingFeeStructure = createAuthenticatedServerFn()
  .inputValidator(updateFeeStructureSchema)
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

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
export const deleteExistingFeeStructure = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: feeStructureId, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await deleteFeeStructure(feeStructureId)
    return result.match(
      () => ({ success: true as const }),
      error => ({ success: false as const, error: error.message }),
    )
  })
