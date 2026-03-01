import { getDb } from '@repo/data-ops/database/setup'
import { studentFees } from '@repo/data-ops/drizzle/school-schema'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { generateUUID } from '@/utils/generateUUID'
import { computeFeesForStudent } from './student'

export interface FeeAssignmentResult {
  success: boolean
  feesAssigned: number
  error?: string
}

/**
 * Auto-assign fees after enrollment confirmation.
 * Called as a system side-effect — no permission checks needed.
 * Idempotent: uses onConflictDoNothing on the unique_student_fee constraint.
 */
export async function autoAssignFeesForEnrollment(params: {
  studentId: string
  schoolId: string
  schoolYearId: string
  userId: string
}): Promise<FeeAssignmentResult> {
  const { studentId, schoolId, schoolYearId, userId } = params
  try {
    const calculation = await computeFeesForStudent({ studentId, schoolId, schoolYearId })
    if (!calculation.success || !calculation.data) {
      return { success: false, feesAssigned: 0, error: calculation.error }
    }

    const { enrollmentId, fees } = calculation.data
    if (fees.length === 0) {
      return { success: true, feesAssigned: 0 }
    }

    const db = getDb()

    const inserted = await db.insert(studentFees).values(
      fees.map(fee => ({
        id: generateUUID(),
        studentId,
        enrollmentId,
        feeStructureId: fee.feeStructureId,
        originalAmount: fee.originalAmount.toString(),
        discountAmount: fee.discountAmount.toString(),
        finalAmount: fee.finalAmount.toString(),
        balance: fee.finalAmount.toString(),
        status: 'pending' as const,
      })),
    ).onConflictDoNothing().returning()

    const feesAssigned = inserted.length

    if (feesAssigned > 0) {
      await createAuditLog({
        schoolId,
        userId,
        action: 'create',
        tableName: 'student_fees',
        recordId: 'auto-assign',
        newValues: { studentId, feeCount: feesAssigned, trigger: 'enrollment_confirmation' },
      })
    }

    return { success: true, feesAssigned }
  }
  catch {
    return { success: false, feesAssigned: 0, error: 'Erreur lors de l\'assignation automatique des frais' }
  }
}
