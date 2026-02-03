import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import * as schoolSubjectQueries from '@repo/data-ops/queries/school-subjects'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

// ===== SCHOOL SUBJECTS SERVER FUNCTIONS =====

const schoolSubjectsFiltersSchema = z.object({
  schoolYearId: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  category: z.enum(['Scientifique', 'Littéraire', 'Sportif', 'Autre']).optional(),
  search: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
}).optional()

/**
 * Get all subjects activated for the current school
 */
export const getSchoolSubjects = authServerFn
  .inputValidator(schoolSubjectsFiltersSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('school_subjects', 'view')

    return (await schoolSubjectQueries.getSchoolSubjects({
      schoolId,
      ...data,
    })).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des matières' }),
    )
  })

/**
 * Get Core subjects available to add to the school
 */
export const getAvailableCoreSubjects = authServerFn
  .inputValidator(
    z.object({
      schoolYearId: z.string().optional(),
      category: z.enum(['Scientifique', 'Littéraire', 'Sportif', 'Autre']).optional(),
      search: z.string().optional(),
    }).optional(),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('school_subjects', 'view')

    return (await schoolSubjectQueries.getAvailableCoreSubjects({
      schoolId,
      ...data,
    })).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des matières disponibles' }),
    )
  })

/**
 * Add subjects from Core catalog to the school
 */
export const addSubjectsToSchool = authServerFn
  .inputValidator(
    z.object({
      subjectIds: z.array(z.string()).min(1, 'Au moins une matière est requise'),
      schoolYearId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('school_subjects', 'create')

    return (await schoolSubjectQueries.addSubjectsToSchool({
      schoolId,
      subjectIds: data.subjectIds,
      schoolYearId: data.schoolYearId,
    })).match(
      async (result) => {
        // Audit log
        if (result.length > 0) {
          await createAuditLog({
            schoolId,
            userId,
            action: 'create',
            tableName: 'school_subjects',
            recordId: 'bulk',
            newValues: { count: result.length },
          })
        }
        return { success: true as const, data: result }
      },
      _ => ({ success: false as const, error: 'Erreur lors de l\'ajout des matières' }),
    )
  })

/**
 * Toggle school subject status (activate/deactivate)
 */
export const toggleSchoolSubjectStatus = authServerFn
  .inputValidator(
    z.object({
      id: z.string(),
      status: z.enum(['active', 'inactive']),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('school_subjects', 'edit')

    // Check if subject is in use before deactivating
    if (data.status === 'inactive') {
      const existingResult = await schoolSubjectQueries.getSchoolSubjectById(schoolId, data.id)

      if (existingResult.isOk() && existingResult.value) {
        const existing = existingResult.value
        const usageResult = await schoolSubjectQueries.checkSubjectInUse({
          schoolId,
          subjectId: existing.subjectId,
          schoolYearId: existing.schoolYearId,
        })

        if (usageResult.isOk() && usageResult.value.inUse) {
          return { success: false as const, error: `Impossible de désactiver : la matière est utilisée par ${usageResult.value.classCount} classe(s)` }
        }
      }
    }

    const status: 'active' | 'inactive' = data.status === 'active' ? 'active' : 'inactive'
    return (await schoolSubjectQueries.toggleSchoolSubjectStatus(data.id, status, schoolId)).match(
      async (result) => {
        // Audit log
        if (result) {
          await createAuditLog({
            schoolId,
            userId,
            action: 'update',
            tableName: 'school_subjects',
            recordId: data.id,
            newValues: { status: data.status },
          })
        }
        return { success: true as const, data: result }
      },
      _ => ({ success: false as const, error: 'Erreur lors du changement de statut de la matière' }),
    )
  })

/**
 * Delete a school subject
 */
export const deleteSchoolSubject = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('school_subjects', 'delete')

    // Check if subject is in use
    // Check if subject is in use
    const existingResult = await schoolSubjectQueries.getSchoolSubjectById(schoolId, id)
    if (existingResult.isOk() && existingResult.value) {
      const existing = existingResult.value
      const usageResult = await schoolSubjectQueries.checkSubjectInUse({
        schoolId,
        subjectId: existing.subjectId,
        schoolYearId: existing.schoolYearId,
      })
      if (usageResult.isOk() && usageResult.value.inUse) {
        return { success: false as const, error: `Impossible de supprimer : la matière est utilisée par ${usageResult.value.classCount} classe(s)` }
      }
    }

    return (await schoolSubjectQueries.deleteSchoolSubject(schoolId, id)).match(
      async () => {
        // Audit log
        await createAuditLog({
          schoolId,
          userId,
          action: 'delete',
          tableName: 'school_subjects',
          recordId: id,
        })
        return { success: true as const, data: { success: true } }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la suppression de la matière' }),
    )
  })

/**
 * Get subject usage statistics
 */
export const getSubjectUsageStats = authServerFn
  .inputValidator(
    z.object({
      schoolYearId: z.string().optional(),
      subjectId: z.string().optional(),
    }).optional(),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('school_subjects', 'view')

    return (await schoolSubjectQueries.getSubjectUsageStats({
      schoolId,
      ...data,
    })).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des statistiques' }),
    )
  })

/**
 * Get a single school subject by ID
 */
export const getSchoolSubjectById = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('school_subjects', 'view')

    const { schoolId } = context.school
    return (await schoolSubjectQueries.getSchoolSubjectById(schoolId, id)).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération de la matière' }),
    )
  })

/**
 * Check if a subject is in use
 */
export const checkSubjectInUseForUI = authServerFn
  .inputValidator(
    z.object({
      subjectId: z.string(),
      schoolYearId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('school_subjects', 'view')

    return (await schoolSubjectQueries.checkSubjectInUse({
      schoolId,
      ...data,
    })).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la vérification de l\'utilisation' }),
    )
  })
