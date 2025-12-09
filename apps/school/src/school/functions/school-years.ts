import { getSchoolYearTemplates } from '@repo/data-ops/queries/programs'
import {
  createSchoolYear as createSchoolYearQuery,
  deleteSchoolYear as deleteSchoolYearQuery,
  getSchoolYearsBySchool,
  updateSchoolYear as updateSchoolYearQuery,
} from '@repo/data-ops/queries/school-admin/school-years'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getSchoolContext } from '../middleware/school-context'

export const getSchoolYears = createServerFn().handler(async () => {
  const context = await getSchoolContext()
  if (!context)
    throw new Error('No school context')
  return await getSchoolYearsBySchool(context.schoolId, {})
})

export const getActiveSchoolYear = createServerFn()
  .handler(async () => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const schoolYears = await getSchoolYearsBySchool(context.schoolId, { isActive: true, limit: 1 })
    return schoolYears[0] || null
  })

// Get available school year templates from Core
export const getAvailableSchoolYearTemplates = createServerFn().handler(async () => {
  return await getSchoolYearTemplates()
})

// Create a new school year from a template
export const createSchoolYear = createServerFn()
  .inputValidator(
    z.object({
      schoolYearTemplateId: z.string().min(1, 'Template requis'),
      startDate: z.string().min(1, 'Date de début requise'),
      endDate: z.string().min(1, 'Date de fin requise'),
      isActive: z.boolean().optional().default(false),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const schoolYear = await createSchoolYearQuery({
      schoolId: context.schoolId,
      schoolYearTemplateId: data.schoolYearTemplateId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isActive: data.isActive,
    })

    return schoolYear
  })

// Update a school year
export const updateSchoolYear = createServerFn()
  .inputValidator(
    z.object({
      id: z.string().min(1),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      isActive: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const updateData: { startDate?: Date, endDate?: Date, isActive?: boolean } = {}
    if (data.startDate)
      updateData.startDate = new Date(data.startDate)
    if (data.endDate)
      updateData.endDate = new Date(data.endDate)
    if (data.isActive !== undefined)
      updateData.isActive = data.isActive

    const schoolYear = await updateSchoolYearQuery(data.id, context.schoolId, updateData)
    return schoolYear
  })

// Delete a school year
export const deleteSchoolYear = createServerFn()
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    await deleteSchoolYearQuery(data.id, context.schoolId)
    return { success: true }
  })

// Set a school year as active
export const setActiveSchoolYear = createServerFn()
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const schoolYear = await updateSchoolYearQuery(data.id, context.schoolId, { isActive: true })
    return schoolYear
  })
