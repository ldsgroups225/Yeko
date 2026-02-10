import { Result as R } from '@praha/byethrow'
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

    const _result1 = await schoolSubjectQueries.getSchoolSubjects({
      schoolId,
      ...data,
    })
    if (R.isFailure(_result1))
      return { success: false as const, error: 'Erreur lors de la récupération des matières' }
    return { success: true as const, data: _result1.value }
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

    const _result2 = await schoolSubjectQueries.getAvailableCoreSubjects({
      schoolId,
      ...data,
    })
    if (R.isFailure(_result2))
      return { success: false as const, error: 'Erreur lors de la récupération des matières disponibles' }
    return { success: true as const, data: _result2.value }
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

    const _result3 = await schoolSubjectQueries.addSubjectsToSchool({
      schoolId,
      subjectIds: data.subjectIds,
      schoolYearId: data.schoolYearId,
    })
    if (R.isFailure(_result3))
      return { success: false as const, error: 'Erreur lors de l\'ajout des matières' }
    // Audit log
    if (_result3.value.length > 0) {
      await createAuditLog({
        schoolId,
        userId,
        action: 'create',
        tableName: 'school_subjects',
        recordId: 'bulk',
        newValues: { count: _result3.value.length },
      })
    }
    return { success: true as const, data: _result3.value }
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

      if (R.isSuccess(existingResult) && existingResult.value) {
        const existing = existingResult.value
        const usageResult = await schoolSubjectQueries.checkSubjectInUse({
          schoolId,
          subjectId: existing.subjectId,
          schoolYearId: existing.schoolYearId,
        })

        if (R.isSuccess(usageResult) && usageResult.value.inUse) {
          return { success: false as const, error: `Impossible de désactiver : la matière est utilisée par ${usageResult.value.classCount} classe(s)` }
        }
      }
    }

    const status: 'active' | 'inactive' = data.status === 'active' ? 'active' : 'inactive'
    const _result4 = await schoolSubjectQueries.toggleSchoolSubjectStatus(data.id, status, schoolId)
    if (R.isFailure(_result4))
      return { success: false as const, error: 'Erreur lors du changement de statut de la matière' }
    // Audit log
    if (_result4.value) {
      await createAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'school_subjects',
        recordId: data.id,
        newValues: { status: data.status },
      })
    }
    return { success: true as const, data: _result4.value }
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
    if (R.isSuccess(existingResult) && existingResult.value) {
      const existing = existingResult.value
      const usageResult = await schoolSubjectQueries.checkSubjectInUse({
        schoolId,
        subjectId: existing.subjectId,
        schoolYearId: existing.schoolYearId,
      })
      if (R.isSuccess(usageResult) && usageResult.value.inUse) {
        return { success: false as const, error: `Impossible de supprimer : la matière est utilisée par ${usageResult.value.classCount} classe(s)` }
      }
    }

    const _result5 = await schoolSubjectQueries.deleteSchoolSubject(schoolId, id)
    if (R.isFailure(_result5))
      return { success: false as const, error: 'Erreur lors de la suppression de la matière' }
    // Audit log
    await createAuditLog({
      schoolId,
      userId,
      action: 'delete',
      tableName: 'school_subjects',
      recordId: id,
    })
    return { success: true as const, data: { success: true } }
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

    const _result6 = await schoolSubjectQueries.getSubjectUsageStats({
      schoolId,
      ...data,
    })
    if (R.isFailure(_result6))
      return { success: false as const, error: 'Erreur lors de la récupération des statistiques' }
    return { success: true as const, data: _result6.value }
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
    const _result7 = await schoolSubjectQueries.getSchoolSubjectById(schoolId, id)
    if (R.isFailure(_result7))
      return { success: false as const, error: 'Erreur lors de la récupération de la matière' }
    return { success: true as const, data: _result7.value }
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

    const _result8 = await schoolSubjectQueries.checkSubjectInUse({
      schoolId,
      ...data,
    })
    if (R.isFailure(_result8))
      return { success: false as const, error: 'Erreur lors de la vérification de l\'utilisation' }
    return { success: true as const, data: _result8.value }
  })
