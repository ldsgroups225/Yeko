import * as classSubjectQueries from '@repo/data-ops/queries/class-subjects'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requirePermission } from '../middleware/permissions'
import { getSchoolContext } from '../middleware/school-context'

export const getClassSubjects = createServerFn()
  .inputValidator(
    z.object({
      classId: z.string().optional(),
      subjectId: z.string().optional(),
      teacherId: z.string().optional(),
      schoolYearId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('classes', 'view')
    return await classSubjectQueries.getClassSubjects({ ...data, schoolId: context.schoolId })
  })

export const getAssignmentMatrix = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: schoolYearId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('classes', 'view')
    return await classSubjectQueries.getAssignmentMatrix(context.schoolId, schoolYearId)
  })

export const assignTeacherToClassSubject = createServerFn()
  .inputValidator(
    z.object({
      classId: z.string(),
      subjectId: z.string(),
      teacherId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('classes', 'edit')
    const result = await classSubjectQueries.assignTeacherToClassSubject(
      data.classId,
      data.subjectId,
      data.teacherId,
    )

    // Audit log
    if (result) {
      await createAuditLog({
        schoolId: context.schoolId,
        userId: context.userId,
        action: 'update',
        tableName: 'class_subjects',
        recordId: result.id,
        newValues: data,
      })
    }

    return result
  })

export const bulkAssignTeacher = createServerFn()
  .inputValidator(
    z.array(
      z.object({
        classId: z.string(),
        subjectId: z.string(),
        teacherId: z.string(),
      }),
    ),
  )
  .handler(async ({ data: assignments }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('classes', 'edit')
    const results = await classSubjectQueries.bulkAssignTeacher(assignments)

    // Audit log for bulk operation
    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'update',
      tableName: 'class_subjects',
      recordId: 'bulk',
      newValues: { assignments, count: assignments.length },
    })

    return results
  })

export const removeTeacherFromClassSubject = createServerFn()
  .inputValidator(
    z.object({
      classId: z.string(),
      subjectId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('classes', 'edit')
    const result = await classSubjectQueries.removeTeacherFromClassSubject(data.classId, data.subjectId)

    // Audit log
    if (result) {
      await createAuditLog({
        schoolId: context.schoolId,
        userId: context.userId,
        action: 'update',
        tableName: 'class_subjects',
        recordId: result.id,
        oldValues: { teacherId: result.teacherId },
        newValues: { teacherId: null },
      })
    }

    return result
  })

export const detectTeacherConflicts = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolYearId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('classes', 'view')
    return await classSubjectQueries.detectTeacherConflicts(data.teacherId, data.schoolYearId)
  })
