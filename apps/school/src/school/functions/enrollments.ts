import * as enrollmentQueries from '@repo/data-ops/queries/enrollments'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

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
  status: z.enum(['pending', 'confirmed', 'cancelled', 'transferred']).optional(),
  search: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
})

// ==================== Server Functions ====================

export const getEnrollments = authServerFn
  .inputValidator(enrollmentFiltersSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('enrollments', 'view')

    return (await enrollmentQueries.getEnrollments({
      ...data,
      schoolId,
      status: data.status,
    })).match(
      paginatedData => ({ success: true as const, data: paginatedData }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des inscriptions' }),
    )
  })

export const getEnrollmentById = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('enrollments', 'view')

    return (await enrollmentQueries.getEnrollmentById(id)).match(
      enrollment => ({ success: true as const, data: enrollment }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération de l\'inscription' }),
    )
  })

export const createEnrollment = authServerFn
  .inputValidator(enrollmentSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('enrollments', 'create')

    return (await enrollmentQueries.createEnrollment(data)).match(
      async (enrollment) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'create',
          tableName: 'enrollments',
          recordId: enrollment.id,
          newValues: data,
        })
        return { success: true as const, data: enrollment }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la création de l\'inscription' }),
    )
  })

export const confirmEnrollment = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('enrollments', 'edit')

    return (await enrollmentQueries.confirmEnrollment(id, userId)).match(
      async (enrollment) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'update',
          tableName: 'enrollments',
          recordId: id,
          newValues: { status: 'confirmed' },
        })
        return { success: true as const, data: enrollment }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la confirmation de l\'inscription' }),
    )
  })

export const cancelEnrollment = authServerFn
  .inputValidator(
    z.object({
      id: z.string(),
      reason: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('enrollments', 'edit')

    return (await enrollmentQueries.cancelEnrollment(data.id, userId, data.reason)).match(
      async (enrollment) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'update',
          tableName: 'enrollments',
          recordId: data.id,
          newValues: { status: 'cancelled', reason: data.reason },
        })
        return { success: true as const, data: enrollment }
      },
      _ => ({ success: false as const, error: 'Erreur lors de l\'annulation de l\'inscription' }),
    )
  })

export const deleteEnrollment = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('enrollments', 'delete')

    return (await enrollmentQueries.deleteEnrollment(id)).match(
      async () => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'delete',
          tableName: 'enrollments',
          recordId: id,
        })
        return { success: true as const, data: { success: true } }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la suppression de l\'inscription' }),
    )
  })

export const transferStudent = authServerFn
  .inputValidator(transferSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('enrollments', 'edit')

    return (await enrollmentQueries.transferStudent(data, userId)).match(
      async (enrollment) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'update',
          tableName: 'enrollments',
          recordId: data.enrollmentId,
          newValues: { transferred: true, newClassId: data.newClassId, reason: data.reason },
        })
        return { success: true as const, data: enrollment }
      },
      _ => ({ success: false as const, error: 'Erreur lors du transfert de l\'étudiant' }),
    )
  })

export const bulkReEnroll = authServerFn
  .inputValidator(reEnrollSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('enrollments', 'create')

    return (await enrollmentQueries.bulkReEnroll(schoolId, data.fromYearId, data.toYearId, {
      gradeMapping: data.gradeMapping,
      autoConfirm: data.autoConfirm,
    })).match(
      async (results) => {
        await createAuditLog({
          schoolId,
          userId,
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
      _ => ({ success: false as const, error: 'Erreur lors de la réinscription en masse' }),
    )
  })

export const getEnrollmentStatistics = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: schoolYearId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('enrollments', 'view')

    return (await enrollmentQueries.getEnrollmentStatistics(schoolId, schoolYearId)).match(
      data => ({ success: true as const, data }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des statistiques d\'inscription' }),
    )
  })
