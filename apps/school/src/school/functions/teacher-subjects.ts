import {
  assignSubjectsToTeacher,
  getTeacherSubjects,
  removeSubjectsFromTeacher,
} from '@repo/data-ops'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { getSchoolSubjects } from '@repo/data-ops/queries/school-subjects'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { assignSubjectsSchema } from '../../schemas/teacher-subject'
import { requirePermission } from '../middleware/permissions'
import { getSchoolContext } from '../middleware/school-context'

export const getTeacherAssignments = createServerFn()
  .inputValidator(z.object({ teacherId: z.string() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('teachers', 'view')
    return getTeacherSubjects(data.teacherId)
  })

export const getAvailableSubjectsForTeacher = createServerFn()
  .inputValidator(z.object({ teacherId: z.string(), schoolYearId: z.string() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('teachers', 'view')

    // Get all school subjects
    const allSubjectsResult = await getSchoolSubjects({
      schoolId: context.schoolId,
      schoolYearId: data.schoolYearId,
    })

    // Get currently assigned subjects
    const assigned = await getTeacherSubjects(data.teacherId)
    const assignedIds = new Set(assigned.map((a: any) => a.subjectId))

    // Return only those not yet assigned
    // allSubjectsResult.subjects is the array
    return allSubjectsResult.subjects.filter((s: any) => !assignedIds.has(s.subjectId))
  })

export const saveTeacherAssignments = createServerFn()
  .inputValidator(assignSubjectsSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('teachers', 'edit')

    const result = await assignSubjectsToTeacher(data.teacherId, data.subjectIds)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'create',
      tableName: 'teacher_subjects', // Using table name consistent with schema
      recordId: 'bulk',
      newValues: { teacherId: data.teacherId, count: data.subjectIds.length },
    })

    return result
  })

export const removeTeacherAssignment = createServerFn()
  .inputValidator(z.object({ teacherId: z.string(), subjectId: z.string() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('teachers', 'edit')

    const result = await removeSubjectsFromTeacher(data.teacherId, [data.subjectId])

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'delete',
      tableName: 'teacher_subjects',
      recordId: `${data.teacherId}-${data.subjectId}`,
      oldValues: { teacherId: data.teacherId, subjectId: data.subjectId },
    })

    return result
  })
