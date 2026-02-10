import { Result as R } from '@praha/byethrow'
import { getSchoolYearTemplates } from '@repo/data-ops/queries/programs'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import {
  createSchoolYear as createSchoolYearQuery,
  deleteSchoolYear as deleteSchoolYearQuery,
  getSchoolYearsBySchool,
  updateSchoolYear as updateSchoolYearQuery,
} from '@repo/data-ops/queries/school-admin/school-years'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

export const getSchoolYears = authServerFn.handler(async ({ context }) => {
  if (!context?.school)
    return { success: false as const, error: 'Établissement non sélectionné' }

  await requirePermission('settings', 'view')
  const _result1 = await getSchoolYearsBySchool(context.school.schoolId, {})
  if (R.isFailure(_result1))
    return { success: false as const, error: 'Erreur lors de la récupération des années scolaires' }
  return { success: true as const, data: _result1.value }
})

export const getActiveSchoolYear = authServerFn
  .handler(async ({ context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('settings', 'view')
    const _result2 = await getSchoolYearsBySchool(context.school.schoolId, { isActive: true, limit: 1 })
    if (R.isFailure(_result2))
      return { success: false as const, error: 'Erreur lors de la récupération de l\'année scolaire active' }
    return { success: true as const, data: _result2.value[0] || null }
  })

// Get available school year templates from Core
export const getAvailableSchoolYearTemplates = authServerFn.handler(async ({ context }) => {
  if (!context?.school)
    return { success: false as const, error: 'Établissement non sélectionné' }

  await requirePermission('settings', 'view')
  const _result3 = await getSchoolYearTemplates()
  if (R.isFailure(_result3))
    return { success: false as const, error: 'Erreur lors de la récupération des modèles d\'année scolaire' }
  return { success: true as const, data: _result3.value }
})

// Create a new school year from a template
export const createSchoolYear = authServerFn
  .inputValidator(
    z.object({
      schoolYearTemplateId: z.string().min(1, 'Template requis'),
      startDate: z.string().min(1, 'Date de début requise'),
      endDate: z.string().min(1, 'Date de fin requise'),
      isActive: z.boolean().optional().default(false),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('settings', 'edit')

    const _result4 = await createSchoolYearQuery({
      schoolId,
      schoolYearTemplateId: data.schoolYearTemplateId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isActive: data.isActive,
    })
    if (R.isFailure(_result4))
      return { success: false as const, error: 'Erreur lors de la création de l\'année scolaire' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'school_years',
      recordId: _result4.value.id,
      newValues: data,
    })
    return { success: true as const, data: _result4.value }
  })

// Update a school year
export const updateSchoolYear = authServerFn
  .inputValidator(
    z.object({
      id: z.string().min(1),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      isActive: z.boolean().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('settings', 'edit')

    const updateData: { startDate?: Date, endDate?: Date, isActive?: boolean } = {}
    if (data.startDate)
      updateData.startDate = new Date(data.startDate)
    if (data.endDate)
      updateData.endDate = new Date(data.endDate)
    if (data.isActive !== undefined)
      updateData.isActive = data.isActive

    const _result5 = await updateSchoolYearQuery(data.id, schoolId, updateData)
    if (R.isFailure(_result5))
      return { success: false as const, error: 'Erreur lors de la mise à jour de l\'année scolaire' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'school_years',
      recordId: data.id,
      newValues: data,
    })
    return { success: true as const, data: _result5.value }
  })

// Delete a school year
export const deleteSchoolYear = authServerFn
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('settings', 'delete')

    const _result6 = await deleteSchoolYearQuery(data.id, schoolId)
    if (R.isFailure(_result6))
      return { success: false as const, error: 'Erreur lors de la suppression de l\'année scolaire' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'delete',
      tableName: 'school_years',
      recordId: data.id,
    })
    return { success: true as const, data: { success: true } }
  })

// Set a school year as active
export const setActiveSchoolYear = authServerFn
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('settings', 'edit')

    const _result7 = await updateSchoolYearQuery(data.id, schoolId, { isActive: true })
    if (R.isFailure(_result7))
      return { success: false as const, error: 'Erreur lors de l\'activation de l\'année scolaire' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'school_years',
      recordId: data.id,
      newValues: { isActive: true },
    })
    return { success: true as const, data: _result7.value }
  })
