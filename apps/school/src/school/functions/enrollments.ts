import * as enrollmentQueries from '@repo/data-ops/queries/enrollments'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requirePermission } from '../middleware/permissions'
import { getSchoolContext } from '../middleware/school-context'

// ==================== Schemas ====================

const enrollmentSchema = z.object({
  studentId: z.string(),
  classId: z.string(),
  schoolYearId: z.string(),
  enrollmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  rollNumber: z.number().int().positive().optional(),
})

const transferSchema = z.object({
  enrollmentId: z.string(),
  newClassId: z.string(),
  reason: z.string().max(500).optional(),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

const reEnrollSchema = z.object({
  fromYearId: z.string(),
  toYearId: z.string(),
  gradeMapping: z.record(z.string(), z.string()).optional(),
  autoConfirm: z.boolean().optional(),
})

const enrollmentFiltersSchema = z.object({
  schoolYearId: z.string().optional(),
  classId: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
})

// ==================== Server Functions ====================

export const getEnrollments = createServerFn()
  .inputValidator(enrollmentFiltersSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'view')
    return await enrollmentQueries.getEnrollments({ ...data, schoolId: context.schoolId })
  })

export const getEnrollmentById = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'view')
    return await enrollmentQueries.getEnrollmentById(id)
  })

export const createEnrollment = createServerFn()
  .inputValidator(enrollmentSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'create')

    const enrollment = await enrollmentQueries.createEnrollment(data)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'create',
      tableName: 'enrollments',
      recordId: enrollment.id,
      newValues: data,
    })

    return enrollment
  })

export const confirmEnrollment = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'edit')

    const enrollment = await enrollmentQueries.confirmEnrollment(id, context.userId)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'update',
      tableName: 'enrollments',
      recordId: id,
      newValues: { status: 'confirmed' },
    })

    return enrollment
  })

export const cancelEnrollment = createServerFn()
  .inputValidator(
    z.object({
      id: z.string(),
      reason: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'edit')

    const enrollment = await enrollmentQueries.cancelEnrollment(data.id, context.userId, data.reason)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'update',
      tableName: 'enrollments',
      recordId: data.id,
      newValues: { status: 'cancelled', reason: data.reason },
    })

    return enrollment
  })

export const deleteEnrollment = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'delete')

    await enrollmentQueries.deleteEnrollment(id)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'delete',
      tableName: 'enrollments',
      recordId: id,
    })

    return { success: true }
  })

export const transferStudent = createServerFn()
  .inputValidator(transferSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'edit')

    const enrollment = await enrollmentQueries.transferStudent(data, context.userId)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'update',
      tableName: 'enrollments',
      recordId: data.enrollmentId,
      newValues: { transferred: true, newClassId: data.newClassId, reason: data.reason },
    })

    return enrollment
  })

export const bulkReEnroll = createServerFn()
  .inputValidator(reEnrollSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'create')

    const results = await enrollmentQueries.bulkReEnroll(context.schoolId, data.fromYearId, data.toYearId, {
      gradeMapping: data.gradeMapping,
      autoConfirm: data.autoConfirm,
    })

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'create',
      tableName: 'enrollments',
      recordId: 'bulk-reenroll',
      newValues: {
        fromYearId: data.fromYearId,
        toYearId: data.toYearId,
        success: results.success,
        errors: results.errors.length,
      },
    })

    return results
  })

export const getEnrollmentStatistics = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: schoolYearId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'view')
    return await enrollmentQueries.getEnrollmentStatistics(context.schoolId, schoolYearId)
  })
