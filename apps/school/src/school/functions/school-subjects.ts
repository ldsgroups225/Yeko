import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import * as schoolSubjectQueries from '@repo/data-ops/queries/school-subjects'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requirePermission } from '../middleware/permissions'
import { getSchoolContext } from '../middleware/school-context'

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
export const getSchoolSubjects = createServerFn()
  .inputValidator(schoolSubjectsFiltersSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('school_subjects', 'view')

    return await schoolSubjectQueries.getSchoolSubjects({
      schoolId: context.schoolId,
      ...data,
    })
  })

/**
 * Get Core subjects available to add to the school
 */
export const getAvailableCoreSubjects = createServerFn()
  .inputValidator(
    z.object({
      schoolYearId: z.string().optional(),
      category: z.enum(['Scientifique', 'Littéraire', 'Sportif', 'Autre']).optional(),
      search: z.string().optional(),
    }).optional(),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('school_subjects', 'view')

    return await schoolSubjectQueries.getAvailableCoreSubjects({
      schoolId: context.schoolId,
      ...data,
    })
  })

/**
 * Add subjects from Core catalog to the school
 */
export const addSubjectsToSchool = createServerFn()
  .inputValidator(
    z.object({
      subjectIds: z.array(z.string()).min(1, 'At least one subject is required'),
      schoolYearId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('school_subjects', 'create')

    const result = await schoolSubjectQueries.addSubjectsToSchool({
      schoolId: context.schoolId,
      subjectIds: data.subjectIds,
      schoolYearId: data.schoolYearId,
    })

    // Audit log
    if (result.length > 0) {
      await createAuditLog({
        schoolId: context.schoolId,
        userId: context.userId,
        action: 'create',
        tableName: 'school_subjects',
        recordId: 'bulk',
        newValues: { subjectIds: data.subjectIds, count: result.length },
      })
    }

    return result
  })

/**
 * Toggle school subject status (activate/deactivate)
 */
export const toggleSchoolSubjectStatus = createServerFn()
  .inputValidator(
    z.object({
      id: z.string(),
      status: z.enum(['active', 'inactive']),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('school_subjects', 'edit')

    // Check if subject is in use before deactivating
    if (data.status === 'inactive') {
      const existing = await schoolSubjectQueries.getSchoolSubjectById(data.id)
      if (existing) {
        const usage = await schoolSubjectQueries.checkSubjectInUse({
          schoolId: context.schoolId,
          subjectId: existing.subjectId,
          schoolYearId: existing.schoolYearId,
        })
        if (usage.inUse) {
          throw new Error(`Cannot deactivate: subject is used by ${usage.classCount} class(es)`)
        }
      }
    }

    const result = await schoolSubjectQueries.toggleSchoolSubjectStatus(data.id, data.status)

    // Audit log
    if (result) {
      await createAuditLog({
        schoolId: context.schoolId,
        userId: context.userId,
        action: 'update',
        tableName: 'school_subjects',
        recordId: data.id,
        newValues: { status: data.status },
      })
    }

    return result
  })

/**
 * Delete a school subject
 */
export const deleteSchoolSubject = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('school_subjects', 'delete')

    // Check if subject is in use
    const existing = await schoolSubjectQueries.getSchoolSubjectById(id)
    if (existing) {
      const usage = await schoolSubjectQueries.checkSubjectInUse({
        schoolId: context.schoolId,
        subjectId: existing.subjectId,
        schoolYearId: existing.schoolYearId,
      })
      if (usage.inUse) {
        throw new Error(`Cannot delete: subject is used by ${usage.classCount} class(es)`)
      }
    }

    await schoolSubjectQueries.deleteSchoolSubject(id)

    // Audit log
    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'delete',
      tableName: 'school_subjects',
      recordId: id,
      oldValues: existing,
    })

    return { success: true }
  })

/**
 * Get subject usage statistics
 */
export const getSubjectUsageStats = createServerFn()
  .inputValidator(
    z.object({
      schoolYearId: z.string().optional(),
      subjectId: z.string().optional(),
    }).optional(),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('school_subjects', 'view')

    return await schoolSubjectQueries.getSubjectUsageStats({
      schoolId: context.schoolId,
      ...data,
    })
  })

/**
 * Get a single school subject by ID
 */
export const getSchoolSubjectById = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('school_subjects', 'view')

    return await schoolSubjectQueries.getSchoolSubjectById(id)
  })

/**
 * Check if a subject is in use (for UI confirmation dialogs)
 */
export const checkSubjectInUse = createServerFn()
  .inputValidator(
    z.object({
      subjectId: z.string(),
      schoolYearId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context) {
      throw new Error('No school context')
    }
    await requirePermission('school_subjects', 'view')

    return await schoolSubjectQueries.checkSubjectInUse({
      schoolId: context.schoolId,
      ...data,
    })
  })
