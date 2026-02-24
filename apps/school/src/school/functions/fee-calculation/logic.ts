import type { FeeBreakdownItem, FeeItem, StudentDiscountItem } from './types'
import { getDb } from '@repo/data-ops/database/setup'
import {
  and,
  eq,
  inArray,
} from '@repo/data-ops/drizzle/operators'
import {
  classes,
  discounts,
  enrollments,
  feeStructures,
  feeTypes,
  studentDiscounts,
  studentFees,
} from '@repo/data-ops/drizzle/school-schema'
import { generateUUID } from '@/utils/generateUUID'

/**
 * Shared logic to calculate fee breakdown for a student
 */
export function calculateBreakdown(params: {
  isNewStudent: boolean
  applicableFees: FeeItem[]
  studentDiscounts: StudentDiscountItem[]
}) {
  const { isNewStudent, applicableFees, studentDiscounts } = params
  const breakdown: FeeBreakdownItem[] = []

  for (const fee of applicableFees) {
    const baseAmountCents = Math.round(
      (isNewStudent && fee.fee_structures.newStudentAmount
        ? Number(fee.fee_structures.newStudentAmount)
        : Number(fee.fee_structures.amount)) * 100,
    )

    let discountCents = 0
    for (const sd of studentDiscounts) {
      const appliesToFeeTypes = sd.discount.appliesToFeeTypes
      if (!appliesToFeeTypes || appliesToFeeTypes.includes(fee.fee_types.id)) {
        if (sd.discount.calculationType === 'percentage') {
          discountCents += Math.round(baseAmountCents * (Number(sd.discount.value) / 100))
        }
        else {
          discountCents += Math.round(Number(sd.calculatedAmount || 0) * 100)
        }
      }
    }

    const maxDiscountCents = studentDiscounts.reduce((max: number, sd: StudentDiscountItem) => {
      if (sd.discount.maxDiscountAmount) {
        return Math.min(max, Math.round(Number(sd.discount.maxDiscountAmount) * 100))
      }
      return max
    }, discountCents)

    const finalDiscountCents = Math.min(discountCents, maxDiscountCents, baseAmountCents)
    const finalAmountCents = baseAmountCents - finalDiscountCents

    breakdown.push({
      feeStructureId: fee.fee_structures.id,
      feeTypeId: fee.fee_types.id,
      feeTypeName: fee.fee_types.name,
      feeTypeCategory: fee.fee_types.category,
      originalAmount: baseAmountCents / 100,
      discountAmount: finalDiscountCents / 100,
      finalAmount: finalAmountCents / 100,
      isNewStudent,
    })
  }

  return breakdown
}

/**
 * Core logic for bulk fee assignment
 */
export async function executeBulkFeeAssignment(params: {
  studentIds: string[]
  schoolId: string
  schoolYearId: string
  // Optional filters for grade/class
  gradeId?: string
}) {
  const db = getDb()
  const results = {
    total: params.studentIds.length,
    succeeded: 0,
    failed: 0,
    errors: [] as Array<{ studentId: string, error: string }>,
  }

  if (params.studentIds.length === 0)
    return results

  const allEnrollments = await db
    .select({ studentId: enrollments.studentId })
    .from(enrollments)
    .where(and(
      inArray(enrollments.studentId, params.studentIds),
      eq(enrollments.status, 'confirmed'),
    ))

  const enrollmentCounts = new Map<string, number>()
  for (const e of allEnrollments) {
    enrollmentCounts.set(e.studentId, (enrollmentCounts.get(e.studentId) || 0) + 1)
  }

  const currentEnrollments = await db
    .select({
      id: enrollments.id,
      studentId: enrollments.studentId,
      gradeId: classes.gradeId,
      seriesId: classes.seriesId,
    })
    .from(enrollments)
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .where(and(
      inArray(enrollments.studentId, params.studentIds),
      eq(enrollments.schoolYearId, params.schoolYearId),
      eq(enrollments.status, 'confirmed'),
    ))

  if (currentEnrollments.length === 0)
    return results

  const gradeIds = Array.from(new Set(currentEnrollments.map(e => e.gradeId)))

  const applicableFees = await db
    .select()
    .from(feeStructures)
    .innerJoin(feeTypes, eq(feeStructures.feeTypeId, feeTypes.id))
    .where(and(
      eq(feeStructures.schoolId, params.schoolId),
      eq(feeStructures.schoolYearId, params.schoolYearId),
      inArray(feeStructures.gradeId, gradeIds.filter((id): id is string => typeof id === 'string')),
      eq(feeTypes.status, 'active'),
    ))

  const allStudentDiscounts = await db
    .select({
      studentId: studentDiscounts.studentId,
      discountId: studentDiscounts.discountId,
      calculatedAmount: studentDiscounts.calculatedAmount,
      discount: discounts,
    })
    .from(studentDiscounts)
    .innerJoin(discounts, eq(studentDiscounts.discountId, discounts.id))
    .where(and(
      inArray(studentDiscounts.studentId, params.studentIds),
      eq(studentDiscounts.schoolYearId, params.schoolYearId),
      eq(studentDiscounts.status, 'approved'),
    ))

  const discountMap = new Map<string, typeof allStudentDiscounts>()
  for (const sd of allStudentDiscounts) {
    if (!discountMap.has(sd.studentId))
      discountMap.set(sd.studentId, [])
    discountMap.get(sd.studentId)!.push(sd)
  }

  const enrollmentIdsValue = currentEnrollments.map(e => e.id)
  const existingStudentFees = await db
    .select({ studentId: studentFees.studentId, feeStructureId: studentFees.feeStructureId })
    .from(studentFees)
    .where(inArray(studentFees.enrollmentId, enrollmentIdsValue))

  const existingFeesSet = new Set(existingStudentFees.map(f => `${f.studentId}-${f.feeStructureId}`))

  const toInsert: (typeof studentFees.$inferInsert)[] = []

  for (const enrollment of currentEnrollments) {
    const isNewStudent = (enrollmentCounts.get(enrollment.studentId) || 0) <= 1
    const studentDiscountsList = discountMap.get(enrollment.studentId) || []

    const studentApplicableFees = applicableFees.filter((f: FeeItem) =>
      f.fee_structures.gradeId === enrollment.gradeId
      && (enrollment.seriesId
        ? f.fee_structures.seriesId === enrollment.seriesId
        : !f.fee_structures.seriesId),
    )

    const feeBreakdown = calculateBreakdown({
      isNewStudent,
      applicableFees: studentApplicableFees,
      studentDiscounts: studentDiscountsList,
    })

    for (const fee of feeBreakdown) {
      if (existingFeesSet.has(`${enrollment.studentId}-${fee.feeStructureId}`)) {
        continue
      }

      toInsert.push({
        id: generateUUID(),
        studentId: enrollment.studentId,
        enrollmentId: enrollment.id,
        feeStructureId: fee.feeStructureId,
        originalAmount: fee.originalAmount.toString(),
        discountAmount: fee.discountAmount.toString(),
        finalAmount: fee.finalAmount.toString(),
        balance: fee.finalAmount.toString(),
        status: 'pending' as const,
      })
    }
  }

  if (toInsert.length > 0) {
    try {
      await db.transaction(async (tx) => {
        const chunkSize = 100
        for (let i = 0; i < toInsert.length; i += chunkSize) {
          await tx.insert(studentFees).values(toInsert.slice(i, i + chunkSize))
        }
      })
      results.succeeded = params.studentIds.length
    }
    catch (error) {
      results.failed = params.studentIds.length
      results.errors.push({ studentId: 'batch', error: error instanceof Error ? error.message : 'L\'assignation groupée a échoué' })
    }
  }
  else {
    results.succeeded = params.studentIds.length
  }

  return results
}
