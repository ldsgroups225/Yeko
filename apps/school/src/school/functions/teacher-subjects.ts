import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { getSchoolSubjects } from '@repo/data-ops/queries/school-subjects'
import {
  assignSubjectsToTeacher,
  getTeacherSubjects,
  removeSubjectsFromTeacher,
} from '@repo/data-ops/queries/teacher-subjects'
import { z } from 'zod'
import { assignSubjectsSchema } from '../../schemas/teacher-subject'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

export const getTeacherAssignments = authServerFn
  .inputValidator(z.object({ teacherId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('teachers', 'view')
    const result = await getTeacherSubjects(data.teacherId)
    return { success: true as const, data: result }
  })

export const getAvailableSubjectsForTeacher = authServerFn
  .inputValidator(z.object({ teacherId: z.string(), schoolYearId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('teachers', 'view')

    // Get all school subjects
    return (await getSchoolSubjects({
      schoolId,
      schoolYearId: data.schoolYearId,
    })).match(
      async (allSubjectsData) => {
        // Get currently assigned subjects
        const assigned = await getTeacherSubjects(data.teacherId)
        const assignedIds = new Set(assigned.map(a => a.subjectId))

        // Return only those not yet assigned
        const filteredSubjects = allSubjectsData.subjects.filter(s => !assignedIds.has(s.subjectId))
        return { success: true as const, data: filteredSubjects }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des matières disponibles' }),
    )
  })

export const saveTeacherAssignments = authServerFn
  .inputValidator(assignSubjectsSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('teachers', 'edit')

    const result = await assignSubjectsToTeacher(data.teacherId, data.subjectIds)

    await createAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'teacher_subjects',
      recordId: 'bulk',
      newValues: { count: data.subjectIds.length },
    })

    return { success: true as const, data: result }
  })

export const removeTeacherAssignment = authServerFn
  .inputValidator(z.object({ teacherId: z.string(), subjectId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('teachers', 'edit')

    const result = await removeSubjectsFromTeacher(data.teacherId, [data.subjectId])

    await createAuditLog({
      schoolId,
      userId,
      action: 'delete',
      tableName: 'teacher_subjects',
      recordId: `${data.teacherId}-${data.subjectId}`,
      oldValues: { teacherId: data.teacherId, subjectId: data.subjectId },
    })

    return { success: true as const, data: result }
  })
