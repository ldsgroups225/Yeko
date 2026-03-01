import { Result as R } from '@praha/byethrow'
import * as enrollmentQueries from '@repo/data-ops/queries/enrollments'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { databaseLogger } from '@repo/logger'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'
import { autoAssignFeesForEnrollment } from './fee-calculation/auto-assign'

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

    const _result1 = await enrollmentQueries.getEnrollments({
      ...data,
      schoolId,
      status: data.status,
    })
    if (R.isFailure(_result1))
      return { success: false as const, error: 'Erreur lors de la récupération des inscriptions' }
    return { success: true as const, data: _result1.value }
  })

export const getEnrollmentById = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('enrollments', 'view')

    const _result2 = await enrollmentQueries.getEnrollmentById(id)
    if (R.isFailure(_result2))
      return { success: false as const, error: 'Erreur lors de la récupération de l\'inscription' }
    return { success: true as const, data: _result2.value }
  })

export const createEnrollment = authServerFn
  .inputValidator(enrollmentSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('enrollments', 'create')

    const _result3 = await enrollmentQueries.createEnrollment(data)
    if (R.isFailure(_result3))
      return { success: false as const, error: 'Erreur lors de la création de l\'inscription' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'enrollments',
      recordId: _result3.value.id,
      newValues: data,
    })
    return { success: true as const, data: _result3.value }
  })

export const confirmEnrollment = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('enrollments', 'edit')

    const _result4 = await enrollmentQueries.confirmEnrollment(id, userId)
    if (R.isFailure(_result4))
      return { success: false as const, error: 'Erreur lors de la confirmation de l\'inscription' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'enrollments',
      recordId: id,
      newValues: { status: 'confirmed' },
    })

    const enrollment = _result4.value
    const feeResult = await autoAssignFeesForEnrollment({
      studentId: enrollment.studentId,
      schoolId,
      schoolYearId: enrollment.schoolYearId,
      userId,
    })
    if (!feeResult.success) {
      databaseLogger.warning(`Auto fee assignment failed for enrollment ${id}: ${feeResult.error}`)
    }

    return {
      success: true as const,
      data: enrollment,
      feeAssignment: feeResult,
    }
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

    const _result5 = await enrollmentQueries.cancelEnrollment(data.id, userId, data.reason)
    if (R.isFailure(_result5))
      return { success: false as const, error: 'Erreur lors de l\'annulation de l\'inscription' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'enrollments',
      recordId: data.id,
      newValues: { status: 'cancelled', reason: data.reason },
    })
    return { success: true as const, data: _result5.value }
  })

export const deleteEnrollment = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('enrollments', 'delete')

    const _result6 = await enrollmentQueries.deleteEnrollment(id)
    if (R.isFailure(_result6))
      return { success: false as const, error: 'Erreur lors de la suppression de l\'inscription' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'delete',
      tableName: 'enrollments',
      recordId: id,
    })
    return { success: true as const, data: { success: true } }
  })

export const transferStudent = authServerFn
  .inputValidator(transferSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('enrollments', 'edit')

    const _result7 = await enrollmentQueries.transferStudent(data, userId)
    if (R.isFailure(_result7))
      return { success: false as const, error: 'Erreur lors du transfert de l\'étudiant' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'enrollments',
      recordId: data.enrollmentId,
      newValues: { transferred: true, newClassId: data.newClassId, reason: data.reason },
    })
    return { success: true as const, data: _result7.value }
  })

export const bulkReEnroll = authServerFn
  .inputValidator(reEnrollSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('enrollments', 'create')

    const _result8 = await enrollmentQueries.bulkReEnroll(schoolId, data.fromYearId, data.toYearId, {
      gradeMapping: data.gradeMapping,
      autoConfirm: data.autoConfirm,
    })
    if (R.isFailure(_result8))
      return { success: false as const, error: 'Erreur lors de la réinscription en masse' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'enrollments',
      recordId: 'bulk-reenroll',
      newValues: {
        fromYearId: data.fromYearId,
        toYearId: data.toYearId,
        success: _result8.value.success,
        errors: _result8.value.errors.length,
      },
    })
    return { success: true as const, data: _result8.value }
  })

export const getEnrollmentStatistics = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: schoolYearId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('enrollments', 'view')

    const _result9 = await enrollmentQueries.getEnrollmentStatistics(schoolId, schoolYearId)
    if (R.isFailure(_result9))
      return { success: false as const, error: 'Erreur lors de la récupération des statistiques d\'inscription' }
    return { success: true as const, data: _result9.value }
  })
