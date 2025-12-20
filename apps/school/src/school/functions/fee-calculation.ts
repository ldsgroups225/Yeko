import {
  and,
  classes,
  discounts,
  enrollments,
  eq,
  feeStructures,
  feeTypes,
  getDb,
  isNull,
  sql,
  studentDiscounts,
  studentFees,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { generateUUID } from '@/utils/generateUUID'
import { getSchoolContext, getSchoolYearContext } from '../middleware/school-context'

interface FeeBreakdownItem {
  feeStructureId: string
  feeTypeId: string
  feeTypeName: string
  feeTypeCategory: string
  originalAmount: number
  discountAmount: number
  finalAmount: number
  isNewStudent: boolean
}

/**
 * Calculate fees for a single student based on their enrollment
 */
export const calculateStudentFees = createServerFn()
  .inputValidator(z.object({
    studentId: z.string(),
    schoolYearId: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const yearContext = await getSchoolYearContext()
    const schoolYearId = data.schoolYearId ?? yearContext?.schoolYearId
    if (!schoolYearId)
      throw new Error('No school year selected')

    const db = getDb()

    // Get student's current enrollment
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
      .where(and(
        eq(enrollments.studentId, data.studentId),
        eq(enrollments.schoolYearId, schoolYearId),
        eq(enrollments.status, 'confirmed'),
      ))
      .limit(1)

    if (!enrollment) {
      return { success: false as const, error: 'Student not enrolled for this year' }
    }

    // Check if student is new (first enrollment)
    const previousEnrollments = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(and(
        eq(enrollments.studentId, data.studentId),
        eq(enrollments.status, 'confirmed'),
      ))

    const isNewStudent = previousEnrollments.length <= 1

    // Get applicable fee structures
    const applicableFees = await db
      .select()
      .from(feeStructures)
      .innerJoin(feeTypes, eq(feeStructures.feeTypeId, feeTypes.id))
      .where(and(
        eq(feeStructures.schoolId, context.schoolId),
        eq(feeStructures.schoolYearId, schoolYearId),
        eq(feeStructures.gradeId, enrollment.gradeId),
        enrollment.seriesId
          ? eq(feeStructures.seriesId, enrollment.seriesId)
          : isNull(feeStructures.seriesId),
        eq(feeTypes.status, 'active'),
      ))

    // Get student's approved discounts
    const studentDiscountsList = await db
      .select({
        discountId: studentDiscounts.discountId,
        calculatedAmount: studentDiscounts.calculatedAmount,
        discount: discounts,
      })
      .from(studentDiscounts)
      .innerJoin(discounts, eq(studentDiscounts.discountId, discounts.id))
      .where(and(
        eq(studentDiscounts.studentId, data.studentId),
        eq(studentDiscounts.schoolYearId, schoolYearId),
        eq(studentDiscounts.status, 'approved'),
      ))

    type StudentDiscountRow = typeof studentDiscountsList[number]
    const feeBreakdown: FeeBreakdownItem[] = []

    for (const fee of applicableFees) {
      const baseAmount = isNewStudent && fee.fee_structures.newStudentAmount
        ? Number(fee.fee_structures.newStudentAmount)
        : Number(fee.fee_structures.amount)

      // Calculate applicable discounts
      let discountAmount = 0
      for (const sd of studentDiscountsList) {
        const appliesToFeeTypes = sd.discount.appliesToFeeTypes as string[] | null
        if (!appliesToFeeTypes || appliesToFeeTypes.includes(fee.fee_types.id)) {
          if (sd.discount.calculationType === 'percentage') {
            discountAmount += baseAmount * (Number(sd.discount.value) / 100)
          }
          else {
            discountAmount += Number(sd.calculatedAmount)
          }
        }
      }

      // Apply max discount cap if set
      const maxDiscount = studentDiscountsList.reduce((max: number, sd: StudentDiscountRow) => {
        if (sd.discount.maxDiscountAmount) {
          return Math.min(max, Number(sd.discount.maxDiscountAmount))
        }
        return max
      }, discountAmount)

      discountAmount = Math.min(discountAmount, maxDiscount, baseAmount)
      const finalAmount = baseAmount - discountAmount

      feeBreakdown.push({
        feeStructureId: fee.fee_structures.id,
        feeTypeId: fee.fee_types.id,
        feeTypeName: fee.fee_types.name,
        feeTypeCategory: fee.fee_types.category,
        originalAmount: baseAmount,
        discountAmount,
        finalAmount,
        isNewStudent,
      })
    }

    const totalOriginal = feeBreakdown.reduce((sum, f) => sum + f.originalAmount, 0)
    const totalDiscount = feeBreakdown.reduce((sum, f) => sum + f.discountAmount, 0)
    const totalFinal = feeBreakdown.reduce((sum, f) => sum + f.finalAmount, 0)

    return {
      success: true as const,
      data: {
        studentId: data.studentId,
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
  })

/**
 * Assign calculated fees to a student (create studentFees records)
 */
export const assignFeesToStudent = createServerFn()
  .inputValidator(z.object({
    studentId: z.string(),
    schoolYearId: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const db = getDb()

    // First calculate the fees
    const calculation = await calculateStudentFees({ data })
    if (!calculation.success || !calculation.data) {
      return calculation
    }

    const { enrollmentId, fees } = calculation.data

    // Check for existing fees
    const existingFees = await db
      .select({ feeStructureId: studentFees.feeStructureId })
      .from(studentFees)
      .where(eq(studentFees.enrollmentId, enrollmentId))

    const existingFeeStructureIds = new Set(existingFees.map((f: { feeStructureId: string }) => f.feeStructureId))

    // Insert new fees (skip existing)
    const newFees = fees.filter(f => !existingFeeStructureIds.has(f.feeStructureId))

    if (newFees.length === 0) {
      return { success: true as const, message: 'All fees already assigned', data: calculation.data }
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

    return {
      success: true as const,
      data: calculation.data,
      message: `${newFees.length} fees assigned`,
    }
  })

/**
 * Bulk assign fees to all students in a grade
 */
export const bulkAssignFeesByGrade = createServerFn()
  .inputValidator(z.object({
    gradeId: z.string(),
    schoolYearId: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const yearContext = await getSchoolYearContext()
    const schoolYearId = data.schoolYearId ?? yearContext?.schoolYearId
    if (!schoolYearId)
      throw new Error('No school year selected')

    const db = getDb()

    // Get all confirmed enrollments for this grade
    const enrolledStudents = await db
      .select({
        studentId: enrollments.studentId,
      })
      .from(enrollments)
      .innerJoin(classes, eq(enrollments.classId, classes.id))
      .where(and(
        eq(classes.schoolId, context.schoolId),
        eq(classes.gradeId, data.gradeId),
        eq(enrollments.schoolYearId, schoolYearId),
        eq(enrollments.status, 'confirmed'),
      ))

    const results = {
      total: enrolledStudents.length,
      succeeded: 0,
      failed: 0,
      errors: [] as Array<{ studentId: string, error: string }>,
    }

    for (const student of enrolledStudents) {
      try {
        await assignFeesToStudent({ data: { studentId: student.studentId, schoolYearId } })
        results.succeeded++
      }
      catch (error) {
        results.failed++
        results.errors.push({
          studentId: student.studentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return { success: true as const, data: results }
  })

/**
 * Get fee breakdown for a student (preview without assigning)
 */
export const getFeeBreakdown = createServerFn()
  .inputValidator(z.object({
    studentId: z.string(),
    schoolYearId: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const yearContext = await getSchoolYearContext()
    const schoolYearId = data.schoolYearId ?? yearContext?.schoolYearId
    if (!schoolYearId)
      throw new Error('No school year selected')

    const db = getDb()

    // Get assigned fees
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

    type AssignedFeeRow = typeof assignedFees[number]
    const totalOriginal = assignedFees.reduce((sum: number, f: AssignedFeeRow) => sum + Number(f.originalAmount), 0)
    const totalDiscount = assignedFees.reduce((sum: number, f: AssignedFeeRow) => sum + Number(f.discountAmount), 0)
    const totalFinal = assignedFees.reduce((sum: number, f: AssignedFeeRow) => sum + Number(f.finalAmount), 0)
    const totalPaid = assignedFees.reduce((sum: number, f: AssignedFeeRow) => sum + Number(f.paidAmount), 0)
    const totalBalance = assignedFees.reduce((sum: number, f: AssignedFeeRow) => sum + Number(f.balance), 0)

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
  })

/**
 * Apply sibling discount automatically
 */
export const applySiblingDiscount = createServerFn()
  .inputValidator(z.object({
    studentId: z.string(),
    schoolYearId: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const yearContext = await getSchoolYearContext()
    const schoolYearId = data.schoolYearId ?? yearContext?.schoolYearId
    if (!schoolYearId)
      throw new Error('No school year selected')

    const db = getDb()

    // Find sibling discount rule
    const [siblingDiscount] = await db
      .select()
      .from(discounts)
      .where(and(
        eq(discounts.schoolId, context.schoolId),
        eq(discounts.type, 'sibling'),
        eq(discounts.status, 'active'),
        eq(discounts.autoApply, true),
      ))
      .limit(1)

    if (!siblingDiscount) {
      return { success: false as const, error: 'No sibling discount configured' }
    }

    // Get student's parents
    const studentParentLinks = await db.execute(sql`
      SELECT parent_id FROM student_parents WHERE student_id = ${data.studentId}
    `)

    if (!studentParentLinks.rows.length) {
      return { success: false as const, error: 'No parents linked to student' }
    }

    const parentIds = studentParentLinks.rows.map((r: any) => r.parent_id)

    // Count siblings enrolled this year
    const siblingsCount = await db.execute(sql`
      SELECT COUNT(DISTINCT sp.student_id) as count
      FROM student_parents sp
      INNER JOIN enrollments e ON sp.student_id = e.student_id
      WHERE sp.parent_id = ANY(${parentIds})
        AND e.school_year_id = ${schoolYearId}
        AND e.status = 'confirmed'
        AND sp.student_id != ${data.studentId}
    `)

    const siblingCount = Number(siblingsCount.rows[0]?.count ?? 0)

    if (siblingCount === 0) {
      return { success: false as const, error: 'No siblings enrolled' }
    }

    // Check if discount already applied
    const existingDiscount = await db
      .select()
      .from(studentDiscounts)
      .where(and(
        eq(studentDiscounts.studentId, data.studentId),
        eq(studentDiscounts.discountId, siblingDiscount.id),
        eq(studentDiscounts.schoolYearId, schoolYearId),
      ))
      .limit(1)

    if (existingDiscount.length > 0) {
      return { success: false as const, error: 'Sibling discount already applied' }
    }

    // Calculate discount amount (will be applied during fee calculation)
    const calculatedAmount = siblingDiscount.calculationType === 'percentage'
      ? 0 // Will be calculated per fee
      : Number(siblingDiscount.value)

    // Apply discount
    await db.insert(studentDiscounts).values({
      id: generateUUID(),
      studentId: data.studentId,
      discountId: siblingDiscount.id,
      schoolYearId,
      calculatedAmount: calculatedAmount.toString(),
      status: siblingDiscount.requiresApproval ? 'pending' : 'approved',
    })

    return {
      success: true as const,
      data: {
        discountId: siblingDiscount.id,
        siblingCount,
        requiresApproval: siblingDiscount.requiresApproval,
      },
    }
  })
