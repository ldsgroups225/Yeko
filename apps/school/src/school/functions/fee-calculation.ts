import { getDb } from '@repo/data-ops/database/setup'
import {
  and,
  eq,
  inArray,
  isNull,
  sql,
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
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

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

interface FeeItem {
  fee_structures: {
    id: string
    amount: string | number
    newStudentAmount?: string | number | null
    gradeId: string | null
    seriesId: string | null
  }
  fee_types: {
    id: string
    name: string
    category: string
  }
}

interface StudentDiscountItem {
  discount: {
    id: string
    appliesToFeeTypes: string[] | null
    calculationType: 'percentage' | 'fixed'
    value: string | number
    maxDiscountAmount?: string | number | null
  }
  calculatedAmount?: string | number
}

/**
 * Shared logic to calculate fee breakdown for a student
 * Uses cents (integers) for precision to avoid floating point issues
 */
export function calculateBreakdown(params: {
  isNewStudent: boolean
  applicableFees: FeeItem[]
  studentDiscounts: StudentDiscountItem[]
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

    // Apply max discount cap
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
 * Calculate fees for a single student based on their enrollment
 */
export const calculateStudentFees = authServerFn
  .inputValidator(z.object({
    studentId: z.string(),
    schoolYearId: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      await requirePermission('finance', 'view')
      const { schoolId } = context.school
      const schoolYearId = data.schoolYearId ?? context.schoolYear?.schoolYearId
      if (!schoolYearId)
        return { success: false as const, error: 'Année scolaire non sélectionnée' }

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
        .innerJoin(students, eq(enrollments.studentId, students.id))
        .where(and(
          eq(students.schoolId, schoolId),
          eq(enrollments.studentId, data.studentId),
          eq(enrollments.schoolYearId, schoolYearId),
          eq(enrollments.status, 'confirmed'),
        ))
        .limit(1)

      if (!enrollment) {
        return { success: false as const, error: 'Étudiant non inscrit pour cette année ou accès refusé' }
      }

      // Check if student is new
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
          eq(feeStructures.schoolId, schoolId),
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
        .innerJoin(students, eq(studentDiscounts.studentId, students.id))
        .where(and(
          eq(students.schoolId, schoolId),
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

  // 1. Check which students are "new"
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

  // 2. Fetch all confirmed enrollments for this year
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

  // 5. Check existing student fees
  const enrollmentIdsValue = currentEnrollments.map(e => e.id)
  const existingStudentFees = await db
    .select({ studentId: studentFees.studentId, feeStructureId: studentFees.feeStructureId })
    .from(studentFees)
    .where(inArray(studentFees.enrollmentId, enrollmentIdsValue))

  const existingFeesSet = new Set(existingStudentFees.map(f => `${f.studentId}-${f.feeStructureId}`))

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
    status: 'pending' | 'paid' | 'partial' | 'waived' | 'cancelled'
  }[] = []

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

/**
 * Bulk assign fees to all students in a grade
 */
export const bulkAssignFeesByGrade = authServerFn
  .inputValidator(z.object({
    gradeId: z.string(),
    schoolYearId: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    try {
      await requirePermission('finance', 'edit')
      const schoolYearId = data.schoolYearId ?? context.schoolYear?.schoolYearId
      if (!schoolYearId)
        return { success: false as const, error: 'Année scolaire non sélectionnée' }

      const db = getDb()

      // Get all confirmed enrollments for this grade
      const enrolledStudentsData = await db
        .select({
          studentId: enrollments.studentId,
        })
        .from(enrollments)
        .innerJoin(classes, eq(enrollments.classId, classes.id))
        .where(and(
          eq(classes.schoolId, schoolId),
          eq(classes.gradeId, data.gradeId),
          eq(enrollments.schoolYearId, schoolYearId),
          eq(enrollments.status, 'confirmed'),
        ))

      const studentIds = enrolledStudentsData.map(s => s.studentId)
      const results = await executeBulkFeeAssignment({
        studentIds,
        schoolId,
        schoolYearId,
        gradeId: data.gradeId,
      })

      await createAuditLog({
        schoolId,
        userId,
        action: 'create',
        tableName: 'student_fees',
        recordId: 'bulk-grade',
        newValues: { gradeId: data.gradeId, ...results },
      })

      return { success: true as const, data: results }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de l\'assignation groupée' }
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

/**
 * Apply sibling discount automatically
 */
export const applySiblingDiscount = authServerFn
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
      const schoolYearIdValue = data.schoolYearId ?? context.schoolYear?.schoolYearId
      if (!schoolYearIdValue)
        return { success: false as const, error: 'Année scolaire non sélectionnée' }

      const db = getDb()

      // Find sibling discount rule
      const [siblingDiscount] = await db
        .select()
        .from(discounts)
        .where(and(
          eq(discounts.schoolId, schoolId),
          eq(discounts.type, 'sibling'),
          eq(discounts.status, 'active'),
          eq(discounts.autoApply, true),
        ))
        .limit(1)

      if (!siblingDiscount) {
        return { success: false as const, error: 'Aucune remise de fratrie configurée' }
      }

      // Get student's parents
      const studentParentLinks = await db.execute(sql`
        SELECT parent_id FROM student_parents WHERE student_id = ${data.studentId}
      `)

      if (!studentParentLinks.rows.length) {
        return { success: false as const, error: 'Aucun parent lié à l\'étudiant' }
      }

      const parentIds = (studentParentLinks.rows as Array<{ parent_id: string }>).map(r => r.parent_id)

      // Count siblings enrolled this year
      const siblingsCountResult = await db.execute(sql`
        SELECT COUNT(DISTINCT sp.student_id) as count
        FROM student_parents sp
        INNER JOIN enrollments e ON sp.student_id = e.student_id
        WHERE sp.parent_id = ANY(${parentIds})
          AND e.school_year_id = ${schoolYearIdValue}
          AND e.status = 'confirmed'
          AND sp.student_id != ${data.studentId}
      `)

      const siblingCount = Number(siblingsCountResult.rows[0]?.count ?? 0)

      if (siblingCount === 0) {
        return { success: false as const, error: 'Aucun frère ou sœur inscrit' }
      }

      // Check if discount already applied
      const existingDiscount = await db
        .select()
        .from(studentDiscounts)
        .where(and(
          eq(studentDiscounts.studentId, data.studentId),
          eq(studentDiscounts.discountId, siblingDiscount.id),
          eq(studentDiscounts.schoolYearId, schoolYearIdValue),
        ))
        .limit(1)

      if (existingDiscount.length > 0) {
        return { success: false as const, error: 'Remise de fratrie déjà appliquée' }
      }

      // Calculate discount amount
      const calculatedAmount = siblingDiscount.calculationType === 'percentage'
        ? 0 // Will be calculated per fee
        : Number(siblingDiscount.value)

      // Apply discount
      const id = generateUUID()
      await db.insert(studentDiscounts).values({
        id,
        studentId: data.studentId,
        discountId: siblingDiscount.id,
        schoolYearId: schoolYearIdValue,
        calculatedAmount: calculatedAmount.toString(),
        status: siblingDiscount.requiresApproval ? 'pending' : 'approved',
      })

      await createAuditLog({
        schoolId,
        userId,
        action: 'create',
        tableName: 'student_discounts',
        recordId: id,
        newValues: { studentId: data.studentId, discountId: siblingDiscount.id },
      })

      return {
        success: true as const,
        data: {
          discountId: siblingDiscount.id,
          siblingCount,
          requiresApproval: siblingDiscount.requiresApproval,
        },
      }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de l\'application de la remise de fratrie' }
    }
  })
