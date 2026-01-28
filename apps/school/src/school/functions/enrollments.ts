import type { EnrollmentStatistics, EnrollmentWithDetails } from '@repo/data-ops/queries/enrollments'
import { DatabaseError } from '@repo/data-ops/errors'
import * as enrollmentQueries from '@repo/data-ops/queries/enrollments'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createAuthenticatedServerFn } from '../lib/server-fn'

// ==================== Server Functions ====================

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

export const getEnrollments = createAuthenticatedServerFn()
  .inputValidator(enrollmentFiltersSchema)
  .handler(async ({ data, context }: any): Promise<{ success: true, data: { data: EnrollmentWithDetails[], total: number, page: number, totalPages: number } } | { success: false, error: string }> => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    await requirePermission('students', 'view')

    const result = await enrollmentQueries.getEnrollments({ ...data, schoolId: school.schoolId } as any)
    return result.match(
      paginatedData => ({ success: true as const, data: paginatedData }),
      (error: any) => ({ success: false as const, error: error.message }),
    )
  })

export const getEnrollmentById = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id, context }: any): Promise<{ success: true, data: EnrollmentWithDetails | undefined } | { success: false, error: string }> => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    await requirePermission('students', 'view')

    const result = await enrollmentQueries.getEnrollmentById(id)
    return result.match(
      enrollment => ({ success: true as const, data: enrollment }),
      (error: any) => ({ success: false as const, error: error.message }),
    )
  })

export const createEnrollment = createAuthenticatedServerFn()
  .inputValidator(enrollmentSchema)
  .handler(async ({ data, context }: any): Promise<{ success: true, data: any } | { success: false, error: string }> => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    await requirePermission('students', 'create')

    const result = await enrollmentQueries.createEnrollment(data)
    return result.match(
      async (enrollment) => {
        await createAuditLog({
          schoolId: school.schoolId,
          userId: school.userId,
          action: 'create',
          tableName: 'enrollments',
          recordId: enrollment.id,
          newValues: data,
        })
        return { success: true as const, data: enrollment }
      },
      (error: any) => ({ success: false as const, error: error.message }),
    )
  })

export const confirmEnrollment = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id, context }: any): Promise<{ success: true, data: any } | { success: false, error: string }> => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    await requirePermission('students', 'edit')

    const result = await enrollmentQueries.confirmEnrollment(id, school.userId)
    return result.match(
      async (enrollment) => {
        await createAuditLog({
          schoolId: school.schoolId,
          userId: school.userId,
          action: 'update',
          tableName: 'enrollments',
          recordId: id,
          newValues: { status: 'confirmed' },
        })
        return { success: true as const, data: enrollment }
      },
      (error: any) => ({ success: false as const, error: error.message }),
    )
  })

export const cancelEnrollment = createAuthenticatedServerFn()
  .inputValidator(
    z.object({
      id: z.string(),
      reason: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }: any): Promise<{ success: true, data: any } | { success: false, error: string }> => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    await requirePermission('students', 'edit')

    const result = await enrollmentQueries.cancelEnrollment(data.id, school.userId, data.reason)
    return result.match(
      async (enrollment) => {
        await createAuditLog({
          schoolId: school.schoolId,
          userId: school.userId,
          action: 'update',
          tableName: 'enrollments',
          recordId: data.id,
          newValues: { status: 'cancelled', reason: data.reason },
        })
        return { success: true as const, data: enrollment }
      },
      (error: any) => ({ success: false as const, error: error.message }),
    )
  })

export const deleteEnrollment = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id, context }: any): Promise<{ success: true } | { success: false, error: string }> => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    await requirePermission('students', 'delete')

    const result = await enrollmentQueries.deleteEnrollment(id)
    return result.match(
      async () => {
        await createAuditLog({
          schoolId: school.schoolId,
          userId: school.userId,
          action: 'delete',
          tableName: 'enrollments',
          recordId: id,
        })
        return { success: true as const }
      },
      (error: any) => ({ success: false as const, error: error.message }),
    )
  })

export const transferStudent = createAuthenticatedServerFn()
  .inputValidator(transferSchema)
  .handler(async ({ data, context }: any): Promise<{ success: true, data: any } | { success: false, error: string }> => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    await requirePermission('students', 'edit')

    const result = await enrollmentQueries.transferStudent(data, school.userId)
    return result.match(
      async (enrollment) => {
        await createAuditLog({
          schoolId: school.schoolId,
          userId: school.userId,
          action: 'update',
          tableName: 'enrollments',
          recordId: data.enrollmentId,
          newValues: { transferred: true, newClassId: data.newClassId, reason: data.reason },
        })
        return { success: true as const, data: enrollment }
      },
      (error: any) => ({ success: false as const, error: error.message }),
    )
  })

export const bulkReEnroll = createAuthenticatedServerFn()
  .inputValidator(reEnrollSchema)
  .handler(async ({ data, context }: any): Promise<{ success: true, data: any } | { success: false, error: string }> => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    await requirePermission('students', 'create')

    const result = await enrollmentQueries.bulkReEnroll(school.schoolId, data.fromYearId, data.toYearId, {
      gradeMapping: data.gradeMapping,
      autoConfirm: data.autoConfirm,
    })
    return result.match(
      async (results) => {
        await createAuditLog({
          schoolId: school.schoolId,
          userId: school.userId,
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
        return { success: true as const, data: results }
      },
      (error: any) => ({ success: false as const, error: error.message }),
    )
  })

export const getEnrollmentStatistics = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: schoolYearId, context }: any): Promise<{ success: true, data: EnrollmentStatistics } | { success: false, error: string }> => {
    const { school } = context
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    await requirePermission('students', 'view')

    const result = await enrollmentQueries.getEnrollmentStatistics(school.schoolId, schoolYearId)
    return result.match(
      data => ({ success: true as const, data }),
      (error: any) => ({ success: false as const, error: error.message }),
    )
  })
