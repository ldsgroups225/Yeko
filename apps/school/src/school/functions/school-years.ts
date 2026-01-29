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
  return (await getSchoolYearsBySchool(context.school.schoolId, {})).match(
    result => ({ success: true as const, data: result }),
    _ => ({ success: false as const, error: 'Erreur lors de la récupération des années scolaires' }),
  )
})

export const getActiveSchoolYear = authServerFn
  .handler(async ({ context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('settings', 'view')
    return (await getSchoolYearsBySchool(context.school.schoolId, { isActive: true, limit: 1 })).match(
      schoolYears => ({ success: true as const, data: schoolYears[0] || null }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération de l\'année scolaire active' }),
    )
  })

// Get available school year templates from Core
export const getAvailableSchoolYearTemplates = authServerFn.handler(async ({ context }) => {
  if (!context?.school)
    return { success: false as const, error: 'Établissement non sélectionné' }

  await requirePermission('settings', 'view')
  return (await getSchoolYearTemplates()).match(
    result => ({ success: true as const, data: result }),
    _ => ({ success: false as const, error: 'Erreur lors de la récupération des modèles d\'année scolaire' }),
  )
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

    return (await createSchoolYearQuery({
      schoolId,
      schoolYearTemplateId: data.schoolYearTemplateId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isActive: data.isActive,
    })).match(
      async (schoolYear) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'create',
          tableName: 'school_years',
          recordId: schoolYear.id,
          newValues: data,
        })
        return { success: true as const, data: schoolYear }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la création de l\'année scolaire' }),
    )
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

    return (await updateSchoolYearQuery(data.id, schoolId, updateData)).match(
      async (schoolYear) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'update',
          tableName: 'school_years',
          recordId: data.id,
          newValues: data,
        })
        return { success: true as const, data: schoolYear }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la mise à jour de l\'année scolaire' }),
    )
  })

// Delete a school year
export const deleteSchoolYear = authServerFn
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('settings', 'delete')

    return (await deleteSchoolYearQuery(data.id, schoolId)).match(
      async () => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'delete',
          tableName: 'school_years',
          recordId: data.id,
        })
        return { success: true as const, data: { success: true } }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la suppression de l\'année scolaire' }),
    )
  })

// Set a school year as active
export const setActiveSchoolYear = authServerFn
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('settings', 'edit')

    return (await updateSchoolYearQuery(data.id, schoolId, { isActive: true })).match(
      async (schoolYear) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'update',
          tableName: 'school_years',
          recordId: data.id,
          newValues: { isActive: true },
        })
        return { success: true as const, data: schoolYear }
      },
      _ => ({ success: false as const, error: 'Erreur lors de l\'activation de l\'année scolaire' }),
    )
  })
