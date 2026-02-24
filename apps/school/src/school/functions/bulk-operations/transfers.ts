import { getDb } from '@repo/data-ops/database/setup'
import {
  and,
  eq,
  inArray,
} from '@repo/data-ops/drizzle/operators'
import {
  enrollments,
  students,
} from '@repo/data-ops/drizzle/school-schema'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import {
  bulkTransferSchema,
} from '@/schemas/bulk-operations'
import { generateUUID } from '@/utils/generateUUID'
import { authServerFn } from '../../lib/server-fn'
import { requirePermission } from '../../middleware/permissions'

/**
 * Bulk transfer students to a new class
 */
export const bulkTransferStudents = authServerFn
  .inputValidator(bulkTransferSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('enrollments', 'edit')
    const { schoolYear } = context
    if (!schoolYear)
      return { success: false as const, error: 'Année scolaire non sélectionnée' }

    const db = getDb()

    const results = {
      total: data.studentIds.length,
      succeeded: 0,
      failed: 0,
      errors: [] as Array<{ studentId: string, error: string }>,
    }

    const now = new Date()

    try {
      const currentEnrollments = await db
        .select({
          id: enrollments.id,
          studentId: enrollments.studentId,
        })
        .from(enrollments)
        .innerJoin(students, eq(enrollments.studentId, students.id))
        .where(and(
          eq(students.schoolId, schoolId),
          inArray(enrollments.studentId, data.studentIds),
          eq(enrollments.schoolYearId, schoolYear.schoolYearId),
          eq(enrollments.status, 'confirmed'),
        ))

      if (currentEnrollments.length === 0) {
        return {
          success: true as const,
          data: {
            ...results,
            failed: data.studentIds.length,
            errors: data.studentIds.map(id => ({ studentId: id, error: 'No active enrollment found' })),
          },
        }
      }

      const enrolledStudentIds = new Set(currentEnrollments.map(e => e.studentId))
      const enrollmentIds = currentEnrollments.map(e => e.id)

      for (const id of data.studentIds) {
        if (!enrolledStudentIds.has(id)) {
          results.failed++
          results.errors.push({ studentId: id, error: 'Aucune inscription active trouvée' })
        }
      }

      await db.transaction(async (tx) => {
        await tx
          .update(enrollments)
          .set({
            status: 'transferred',
            transferredAt: now,
            transferredTo: data.newClassId,
            transferReason: data.reason,
          })
          .where(inArray(enrollments.id, enrollmentIds))

        const toInsert = currentEnrollments.map(e => ({
          id: generateUUID(),
          studentId: e.studentId,
          classId: data.newClassId,
          schoolYearId: schoolYear.schoolYearId,
          status: 'confirmed' as const,
          enrollmentDate: now.toISOString().split('T')[0] ?? now.toISOString().slice(0, 10),
          confirmedAt: now,
          previousEnrollmentId: e.id,
        }))

        await tx.insert(enrollments).values(toInsert)
        results.succeeded = toInsert.length
      })

      await createAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'enrollments',
        recordId: 'bulk-transfer',
        newValues: { newClassId: data.newClassId, count: results.succeeded },
      })

      return { success: true as const, data: results }
    }
    catch {
      return {
        success: false as const,
        error: 'Le transfert groupé a échoué',
      }
    }
  })
