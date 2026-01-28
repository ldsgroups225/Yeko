import {
  and,
  classes,
  discounts,
  enrollments,
  eq,
  feeStructures,
  feeTypes,
  inArray,
  isNull,
  sql,
  studentDiscounts,
  studentFees,
  students,
} from '@repo/data-ops'
import { getDb } from '@repo/data-ops/database/setup'
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
 * Shared logic to calculate fee breakdown for a student
 * Uses cents (integers) for precision to avoid floating point issues
 */
export function calculateBreakdown(params: {
  isNewStudent: boolean
  applicableFees: any[]
  studentDiscounts: any[]
}) {
  const { isNewStudent, applicableFees, studentDiscounts } = params
  const breakdown: FeeBreakdownItem[] = []

  for (const fee of applicableFees) {
    // Convert to cents for calculation (using millimes/cents as integers)
    const baseAmountCents = Math.round(
      (isNewStudent && fee.fee_structures.newStudentAmount
        ? Number(fee.fee_structures.newStudentAmount)
        : Number(fee.fee_structures.amount)) * 100,
    )

    let discountCents = 0
    for (const sd of studentDiscounts) {
      const appliesToFeeTypes = sd.discount.appliesToFeeTypes as string[] | null
      if (!appliesToFeeTypes || appliesToFeeTypes.includes(fee.fee_types.id)) {
        if (sd.discount.calculationType === 'percentage') {
          discountCents += Math.round(baseAmountCents * (Number(sd.discount.value) / 100))
        }
        else {
          discountCents += Math.round(Number(sd.calculatedAmount) * 100)
        }
      }
    }

    // Apply max discount cap
    const maxDiscountCents = studentDiscounts.reduce((max: number, sd: any) => {
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

    // Get student's current enrollment - SCOPED by schoolId
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
        eq(students.schoolId, context.schoolId),
        eq(enrollments.studentId, data.studentId),
        eq(enrollments.schoolYearId, schoolYearId),
        eq(enrollments.status, 'confirmed'),
      ))
      .limit(1)

    if (!enrollment) {
      return { success: false as const, error: 'Étudiant non inscrit pour cette année ou accès refusé' }
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

    // Get student's approved discounts - SCOPED by schoolId
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
        eq(students.schoolId, context.schoolId),
        eq(studentDiscounts.studentId, data.studentId),
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

    // IconCheck for existing fees
    const existingFees = await db
      .select({ feeStructureId: studentFees.feeStructureId })
      .from(studentFees)
      .where(eq(studentFees.enrollmentId, enrollmentId))

    const existingFeeStructureIds = new Set(existingFees.map((f: { feeStructureId: string }) => f.feeStructureId))

    // Insert new fees (skip existing)
    const newFees = fees.filter(f => !existingFeeStructureIds.has(f.feeStructureId))

    if (newFees.length === 0) {
      return { success: true as const, message: 'Tous les frais sont déjà assignés', data: calculation.data }
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
      message: `${newFees.length} frais assignés`,
    }
  })

/**
 * Core logic for bulk fee assignment
 * Optimized to handle multiple students in batch
 */
export async function executeBulkFeeAssignment(params: {
  studentIds: string[]
  schoolId: string
  schoolYearId: string
  // Optional filters for grade/class to narrow down fee structures
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

  // 1. IconCheck which students are "new" (only have 0 or 1 confirmed enrollment ever)
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

  // 2. Fetch all confirmed enrollments for this year with their class/grade details
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

  // 3. Get all applicable fee structures
  // Note: We might have students from different grades if called from bulkAssignFees
  const gradeIds = Array.from(new Set(currentEnrollments.map((e: { gradeId: string }) => e.gradeId)))

  const applicableFees = await db
    .select()
    .from(feeStructures)
    .innerJoin(feeTypes, eq(feeStructures.feeTypeId, feeTypes.id))
    .where(and(
      eq(feeStructures.schoolId, params.schoolId),
      eq(feeStructures.schoolYearId, params.schoolYearId),
      inArray(feeStructures.gradeId, gradeIds.filter((id): id is string => typeof id === 'string') as string[]),
      eq(feeTypes.status, 'active'),
    ))

  // 4. Get all approved discounts for these students
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

  // 5. IconCheck existing student fees to avoid duplicates
  const enrollmentIds = currentEnrollments.map((e: { id: string }) => e.id)
  const existingStudentFees = await db
    .select({ studentId: studentFees.studentId, feeStructureId: studentFees.feeStructureId })
    .from(studentFees)
    .where(inArray(studentFees.enrollmentId, enrollmentIds))

  const existingFeesSet = new Set(existingStudentFees.map((f: { studentId: string, feeStructureId: string }) => `${f.studentId}-${f.feeStructureId}`))

  // 6. Calculate and prepare batch insert
  const toInsert: {
    id: string
    studentId: string
    enrollmentId: string
    feeStructureId: string
    originalAmount: string
    discountAmount: string
    finalAmount: string
    balance: string
    status: 'pending' | 'paid' | 'partial' | 'overdue'
  }[] = []

  for (const enrollment of currentEnrollments) {
    const isNewStudent = (enrollmentCounts.get(enrollment.studentId) || 0) <= 1
    const studentDiscountsList = discountMap.get(enrollment.studentId) || []

    // IconFilter applicable fees for this specific enrollment
    const studentApplicableFees = applicableFees.filter((f: any) =>
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
        // Chunk inserts for large datasets
        const chunkSize = 100
        for (let i = 0; i < toInsert.length; i += chunkSize) {
          await tx.insert(studentFees).values(toInsert.slice(i, i + chunkSize) as any[])
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
    const enrolledStudentsData = await db
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

    const studentIds = enrolledStudentsData.map((s: { studentId: string }) => s.studentId)
    const results = await executeBulkFeeAssignment({
      studentIds,
      schoolId: context.schoolId,
      schoolYearId,
      gradeId: data.gradeId,
    })

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

    const parentIds = (studentParentLinks.rows as Array<{ parent_id: string }>).map(r => r.parent_id)

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

    // IconCheck if discount already applied
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
