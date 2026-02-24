import { getDb } from '@repo/data-ops/database/setup'
import {
  and,
  eq,
} from '@repo/data-ops/drizzle/operators'
import {
  classes,
  enrollments,
} from '@repo/data-ops/drizzle/school-schema'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import {
  bulkFeeAssignmentSchema,
} from '@/schemas/bulk-operations'
import { authServerFn } from '../../lib/server-fn'
import { requirePermission } from '../../middleware/permissions'
import { executeBulkFeeAssignment } from '../fee-calculation'

/**
 * Bulk assign fees to students
 */
export const bulkAssignFees = authServerFn
  .inputValidator(bulkFeeAssignmentSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('finance', 'edit')
    const db = getDb()

    let studentIds = data.studentIds ?? []

    if (studentIds.length === 0) {
      const enrolledStudents = await db
        .select({ studentId: enrollments.studentId })
        .from(enrollments)
        .innerJoin(classes, eq(enrollments.classId, classes.id))
        .where(and(
          eq(classes.schoolId, schoolId),
          eq(enrollments.schoolYearId, data.schoolYearId),
          eq(enrollments.status, 'confirmed'),
          data.gradeId ? eq(classes.gradeId, data.gradeId) : undefined,
          data.classId ? eq(enrollments.classId, data.classId) : undefined,
        ))

      studentIds = enrolledStudents.map((e: { studentId: string }) => e.studentId)
    }

    const results = await executeBulkFeeAssignment({
      studentIds,
      schoolId,
      schoolYearId: data.schoolYearId,
      gradeId: data.gradeId,
    })

    await createAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'student_fees',
      recordId: 'bulk-assign',
      newValues: { ...results },
    })

    return { success: true as const, data: results }
  })
