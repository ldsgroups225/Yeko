import { getDb } from '@repo/data-ops/database/setup'
import {
  and,
  eq,
  isNull,
} from '@repo/data-ops/drizzle/operators'
import {
  classes,
  discounts,
  enrollments,
  feeStructures,
  feeTypes,
  studentDiscounts,
  studentFees,
  students,
} from '@repo/data-ops/drizzle/school-schema'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { z } from 'zod'
import { generateUUID } from '@/utils/generateUUID'
import { authServerFn } from '../../lib/server-fn'
import { requirePermission } from '../../middleware/permissions'
import { calculateBreakdown } from './logic'

/**
 * Internal logic for student fee calculation
 */
async function executeStudentFeeCalculation(params: {
  studentId: string
  schoolYearId?: string
  context: any
}) {
  const { studentId, schoolYearId: providedSchoolYearId, context } = params
  if (!context?.school)
    return { success: false as const, error: 'Établissement non sélectionné' }

  await requirePermission('finance', 'view')
  const { schoolId } = context.school
  const schoolYearId = providedSchoolYearId ?? context.schoolYear?.schoolYearId
  if (!schoolYearId)
    return { success: false as const, error: 'Année scolaire non sélectionnée' }

  const db = getDb()

  const [enrollment] = await db
    .select({
      id: enrollments.id,
      studentId: enrollments.studentId,
      classId: enrollments.classId,
      gradeId: classes.gradeId,
      seriesId: classes.seriesId,
    })
    .from(enrollments)
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .where(and(
      eq(students.schoolId, schoolId),
      eq(enrollments.studentId, studentId),
      eq(enrollments.schoolYearId, schoolYearId),
      eq(enrollments.status, 'confirmed'),
    ))
    .limit(1)

  if (!enrollment) {
    return { success: false as const, error: 'Étudiant non inscrit pour cette année ou accès refusé' }
  }

  const previousEnrollments = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(and(
      eq(enrollments.studentId, studentId),
      eq(enrollments.status, 'confirmed'),
    ))

  const isNewStudent = previousEnrollments.length <= 1

  const applicableFees = await db
    .select()
    .from(feeStructures)
    .innerJoin(feeTypes, eq(feeStructures.feeTypeId, feeTypes.id))
    .where(and(
      eq(feeStructures.schoolId, schoolId),
      eq(feeStructures.schoolYearId, schoolYearId),
      eq(feeStructures.gradeId, enrollment.gradeId),
      enrollment.seriesId
        ? eq(feeStructures.seriesId, enrollment.seriesId)
        : isNull(feeStructures.seriesId),
      eq(feeTypes.status, 'active'),
    ))

  const studentDiscountsList = await db
    .select({
      discountId: studentDiscounts.discountId,
      calculatedAmount: studentDiscounts.calculatedAmount,
      discount: discounts,
    })
    .from(studentDiscounts)
    .innerJoin(discounts, eq(studentDiscounts.discountId, discounts.id))
    .innerJoin(students, eq(studentDiscounts.studentId, students.id))
    .where(and(
      eq(students.schoolId, schoolId),
      eq(studentDiscounts.studentId, studentId),
      eq(studentDiscounts.schoolYearId, schoolYearId),
      eq(studentDiscounts.status, 'approved'),
    ))

  const feeBreakdown = calculateBreakdown({
    isNewStudent,
    applicableFees,
    studentDiscounts: studentDiscountsList,
  })

  const totalOriginal = feeBreakdown.reduce((sum, f) => sum + f.originalAmount, 0)
  const totalDiscount = feeBreakdown.reduce((sum, f) => sum + f.discountAmount, 0)
  const totalFinal = feeBreakdown.reduce((sum, f) => sum + f.finalAmount, 0)

  return {
    success: true as const,
    data: {
      studentId,
      enrollmentId: enrollment.id,
      schoolYearId,
      isNewStudent,
      fees: feeBreakdown,
      summary: {
        totalOriginal,
        totalDiscount,
        totalFinal,
      },
    },
  }
}

/**
 * Calculate fees for a single student based on their enrollment
 */
export const calculateStudentFees = authServerFn
  .inputValidator(z.object({
    studentId: z.string(),
    schoolYearId: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    try {
      return await executeStudentFeeCalculation({ ...data, context })
    }
    catch {
      return { success: false as const, error: 'Erreur lors du calcul des frais' }
    }
  })

/**
 * Assign calculated fees to a student
 */
export const assignFeesToStudent = authServerFn
  .inputValidator(z.object({
    studentId: z.string(),
    schoolYearId: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    try {
      await requirePermission('finance', 'edit')
      const db = getDb()

      const calculation = await executeStudentFeeCalculation({ ...data, context })
      if (!calculation.success || !calculation.data) {
        return calculation
      }

      const { enrollmentId, fees } = calculation.data

      const existingFees = await db
        .select({ feeStructureId: studentFees.feeStructureId })
        .from(studentFees)
        .where(eq(studentFees.enrollmentId, enrollmentId))

      const existingFeeStructureIds = new Set(existingFees.map((f: { feeStructureId: string }) => f.feeStructureId))

      const newFees = fees.filter(f => !existingFeeStructureIds.has(f.feeStructureId))

      if (newFees.length === 0) {
        return { success: true as const, data: { ...calculation.data, message: 'Tous les frais sont déjà assignés' } }
      }

      await db.insert(studentFees).values(
        newFees.map(fee => ({
          id: generateUUID(),
          studentId: data.studentId,
          enrollmentId,
          feeStructureId: fee.feeStructureId,
          originalAmount: fee.originalAmount.toString(),
          discountAmount: fee.discountAmount.toString(),
          finalAmount: fee.finalAmount.toString(),
          balance: fee.finalAmount.toString(),
          status: 'pending' as const,
        })),
      )

      await createAuditLog({
        schoolId,
        userId,
        action: 'create',
        tableName: 'student_fees',
        recordId: 'multiple',
        newValues: { studentId: data.studentId, feeCount: newFees.length },
      })

      return {
        success: true as const,
        data: {
          ...calculation.data,
          message: `${newFees.length} frais assignés`,
        },
      }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de l\'assignation des frais' }
    }
  })

/**
 * Get fee breakdown for a student
 */
export const getFeeBreakdown = authServerFn
  .inputValidator(z.object({
    studentId: z.string(),
    schoolYearId: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      await requirePermission('finance', 'view')
      const schoolYearId = data.schoolYearId ?? context.schoolYear?.schoolYearId
      if (!schoolYearId)
        return { success: false as const, error: 'Année scolaire non sélectionnée' }

      const db = getDb()

      const assignedFees = await db
        .select({
          id: studentFees.id,
          feeStructureId: studentFees.feeStructureId,
          originalAmount: studentFees.originalAmount,
          discountAmount: studentFees.discountAmount,
          finalAmount: studentFees.finalAmount,
          paidAmount: studentFees.paidAmount,
          balance: studentFees.balance,
          status: studentFees.status,
          feeTypeName: feeTypes.name,
          feeTypeCategory: feeTypes.category,
        })
        .from(studentFees)
        .innerJoin(feeStructures, eq(studentFees.feeStructureId, feeStructures.id))
        .innerJoin(feeTypes, eq(feeStructures.feeTypeId, feeTypes.id))
        .innerJoin(enrollments, eq(studentFees.enrollmentId, enrollments.id))
        .where(and(
          eq(studentFees.studentId, data.studentId),
          eq(enrollments.schoolYearId, schoolYearId),
        ))

      const totalOriginal = assignedFees.reduce((sum, f) => sum + Number(f.originalAmount), 0)
      const totalDiscount = assignedFees.reduce((sum, f) => sum + Number(f.discountAmount), 0)
      const totalFinal = assignedFees.reduce((sum, f) => sum + Number(f.finalAmount), 0)
      const totalPaid = assignedFees.reduce((sum, f) => sum + Number(f.paidAmount), 0)
      const totalBalance = assignedFees.reduce((sum, f) => sum + Number(f.balance), 0)

      return {
        success: true as const,
        data: {
          fees: assignedFees,
          summary: {
            totalOriginal,
            totalDiscount,
            totalFinal,
            totalPaid,
            totalBalance,
          },
        },
      }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la récupération du détail des frais' }
    }
  })
