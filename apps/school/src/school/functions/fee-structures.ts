import {
  createFeeStructure,
  createFeeStructuresBulk,
  deleteFeeStructure,
  getFeeStructureById,
  getFeeStructures,
  getFeeStructuresWithTypes,
  updateFeeStructure,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { bulkCreateFeeStructuresSchema, createFeeStructureSchema, updateFeeStructureSchema } from '@/schemas/fee-structure'
import { getSchoolContext, getSchoolYearContext } from '../middleware/school-context'

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
export const getFeeStructuresList = createServerFn()
  .inputValidator(feeStructureFiltersSchema.optional())
  .handler(async ({ data: filters }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const yearContext = await getSchoolYearContext()
    const schoolYearId = filters?.schoolYearId || yearContext?.schoolYearId
    if (!schoolYearId)
      throw new Error('No school year context')

    return await getFeeStructures({
      schoolId: context.schoolId,
      schoolYearId,
      ...filters,
    })
  })

/**
 * Get fee structures with fee type details
 */
export const getFeeStructuresWithDetails = createServerFn()
  .inputValidator(feeStructureFiltersSchema.optional())
  .handler(async ({ data: filters }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const yearContext = await getSchoolYearContext()
    const schoolYearId = filters?.schoolYearId || yearContext?.schoolYearId
    if (!schoolYearId)
      throw new Error('No school year context')

    return await getFeeStructuresWithTypes({
      schoolId: context.schoolId,
      schoolYearId,
      gradeId: filters?.gradeId,
    })
  })

/**
 * Get single fee structure
 */
export const getFeeStructure = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: feeStructureId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getFeeStructureById(feeStructureId)
  })

/**
 * Create new fee structure
 */
export const createNewFeeStructure = createServerFn()
  .inputValidator(createFeeStructureSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await createFeeStructure({
      schoolId: context.schoolId,
      ...data,
    })
  })

/**
 * Bulk create fee structures
 */
export const bulkCreateFeeStructures = createServerFn()
  .inputValidator(bulkCreateFeeStructuresSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const structures = data.structures.map(s => ({
      schoolId: context.schoolId,
      schoolYearId: data.schoolYearId,
      feeTypeId: data.feeTypeId,
      ...s,
    }))

    return await createFeeStructuresBulk(structures)
  })

/**
 * Update fee structure
 */
export const updateExistingFeeStructure = createServerFn()
  .inputValidator(updateFeeStructureSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const { id, ...updateData } = data
    return await updateFeeStructure(id, updateData)
  })

/**
 * Delete fee structure
 */
export const deleteExistingFeeStructure = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: feeStructureId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    await deleteFeeStructure(feeStructureId)
    return { success: true }
  })
