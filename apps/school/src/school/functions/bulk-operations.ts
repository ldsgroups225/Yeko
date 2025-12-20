import {
  and,
  classes,
  enrollments,
  eq,
  getDb,
  grades,
  inArray,
  parents,
  series,
  studentParents,
  students,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  bulkEnrollmentSchema,
  bulkFeeAssignmentSchema,
  bulkReEnrollmentSchema,
  bulkTransferSchema,
  studentImportRowSchema,
} from '@/schemas/bulk-operations'
import { generateUUID } from '@/utils/generateUUID'
import { requirePermission } from '../middleware/permissions'
import { getSchoolContext, getSchoolYearContext } from '../middleware/school-context'
import { assignFeesToStudent } from './fee-calculation'

/**
 * Bulk enroll students into a class
 */
export const bulkEnrollStudents = createServerFn()
  .inputValidator(bulkEnrollmentSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'create')

    const db = getDb()

    const results = {
      total: data.studentIds.length,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      errors: [] as Array<{ studentId: string, error: string }>,
    }

    // Check class exists and get capacity
    const [targetClass] = await db
      .select()
      .from(classes)
      .where(and(
        eq(classes.id, data.classId),
        eq(classes.schoolId, context.schoolId),
      ))
      .limit(1)

    if (!targetClass) {
      throw new Error('Class not found')
    }

    // Check for existing enrollments
    const existingEnrollments = await db
      .select({ studentId: enrollments.studentId })
      .from(enrollments)
      .where(and(
        inArray(enrollments.studentId, data.studentIds),
        eq(enrollments.schoolYearId, data.schoolYearId),
        inArray(enrollments.status, ['pending', 'confirmed']),
      ))

    const alreadyEnrolled = new Set(existingEnrollments.map((e: { studentId: string }) => e.studentId))

    const today = new Date().toISOString().split('T')[0] ?? new Date().toISOString().slice(0, 10)

    for (const studentId of data.studentIds) {
      if (alreadyEnrolled.has(studentId)) {
        results.skipped++
        continue
      }

      try {
        await db.insert(enrollments).values({
          id: generateUUID(),
          studentId,
          classId: data.classId,
          schoolYearId: data.schoolYearId,
          status: data.autoConfirm ? 'confirmed' : 'pending',
          enrollmentDate: today,
          confirmedAt: data.autoConfirm ? new Date() : null,
        })
        results.succeeded++
      }
      catch (error) {
        results.failed++
        results.errors.push({
          studentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return { success: true as const, data: results }
  })

/**
 * Bulk re-enroll students from previous year
 */
export const bulkReEnrollFromPreviousYear = createServerFn()
  .inputValidator(bulkReEnrollmentSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'create')

    const db = getDb()

    // Get all confirmed enrollments from source year
    const sourceEnrollments = await db
      .select({
        studentId: enrollments.studentId,
        classId: enrollments.classId,
        gradeId: classes.gradeId,
        seriesId: classes.seriesId,
      })
      .from(enrollments)
      .innerJoin(classes, eq(enrollments.classId, classes.id))
      .where(and(
        eq(classes.schoolId, context.schoolId),
        eq(enrollments.schoolYearId, data.fromSchoolYearId),
        eq(enrollments.status, 'confirmed'),
      ))

    // Get target year classes
    const targetClasses = await db
      .select()
      .from(classes)
      .where(and(
        eq(classes.schoolId, context.schoolId),
        eq(classes.schoolYearId, data.toSchoolYearId),
      ))

    // Build class lookup by grade/series
    const classLookup = new Map<string, string>()
    for (const c of targetClasses) {
      const key = `${c.gradeId}-${c.seriesId ?? 'null'}`
      classLookup.set(key, c.id)
    }

    const results = {
      total: sourceEnrollments.length,
      succeeded: 0,
      skipped: 0,
      failed: 0,
      errors: [] as Array<{ studentId: string, error: string }>,
    }

    // Check existing enrollments in target year
    const existingEnrollmentsTarget = await db
      .select({ studentId: enrollments.studentId })
      .from(enrollments)
      .where(and(
        eq(enrollments.schoolYearId, data.toSchoolYearId),
        inArray(enrollments.status, ['pending', 'confirmed']),
      ))

    const alreadyEnrolled = new Set(existingEnrollmentsTarget.map((e: { studentId: string }) => e.studentId))
    const today = new Date().toISOString().split('T')[0] ?? new Date().toISOString().slice(0, 10)

    for (const enrollment of sourceEnrollments) {
      if (alreadyEnrolled.has(enrollment.studentId)) {
        results.skipped++
        continue
      }

      // Find target class (same grade/series or mapped)
      let targetGradeId = enrollment.gradeId
      if (data.gradeMapping) {
        const mapped = data.gradeMapping[enrollment.gradeId]
        if (mapped) {
          targetGradeId = mapped
        }
      }

      const classKey = `${targetGradeId}-${enrollment.seriesId ?? 'null'}`
      const targetClassId = classLookup.get(classKey)

      if (!targetClassId) {
        results.failed++
        results.errors.push({
          studentId: enrollment.studentId,
          error: 'No matching class found in target year',
        })
        continue
      }

      try {
        await db.insert(enrollments).values({
          id: generateUUID(),
          studentId: enrollment.studentId,
          classId: targetClassId,
          schoolYearId: data.toSchoolYearId,
          status: data.autoConfirm ? 'confirmed' : 'pending',
          enrollmentDate: today,
          confirmedAt: data.autoConfirm ? new Date() : null,
        })
        results.succeeded++
      }
      catch (error) {
        results.failed++
        results.errors.push({
          studentId: enrollment.studentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return { success: true as const, data: results }
  })

/**
 * Bulk transfer students to a new class
 */
export const bulkTransferStudents = createServerFn()
  .inputValidator(bulkTransferSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'edit')

    const yearContext = await getSchoolYearContext()
    if (!yearContext?.schoolYearId)
      throw new Error('No school year selected')

    const db = getDb()

    const results = {
      total: data.studentIds.length,
      succeeded: 0,
      failed: 0,
      errors: [] as Array<{ studentId: string, error: string }>,
    }

    const now = new Date()

    for (const studentId of data.studentIds) {
      try {
        // Get current enrollment
        const [currentEnrollment] = await db
          .select()
          .from(enrollments)
          .where(and(
            eq(enrollments.studentId, studentId),
            eq(enrollments.schoolYearId, yearContext.schoolYearId),
            eq(enrollments.status, 'confirmed'),
          ))
          .limit(1)

        if (!currentEnrollment) {
          results.failed++
          results.errors.push({ studentId, error: 'No active enrollment found' })
          continue
        }

        // Update enrollment to transferred
        await db
          .update(enrollments)
          .set({
            status: 'transferred',
            transferredAt: now,
            transferredTo: data.newClassId,
            transferReason: data.reason,
          })
          .where(eq(enrollments.id, currentEnrollment.id))

        // Create new enrollment
        await db.insert(enrollments).values({
          id: generateUUID(),
          studentId,
          classId: data.newClassId,
          schoolYearId: yearContext.schoolYearId,
          status: 'confirmed',
          enrollmentDate: now.toISOString().split('T')[0] ?? now.toISOString().slice(0, 10),
          confirmedAt: now,
          previousEnrollmentId: currentEnrollment.id,
        })

        results.succeeded++
      }
      catch (error) {
        results.failed++
        results.errors.push({
          studentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return { success: true as const, data: results }
  })

/**
 * Bulk assign fees to students
 */
export const bulkAssignFees = createServerFn()
  .inputValidator(bulkFeeAssignmentSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('finance', 'create')

    const db = getDb()

    let studentIds = data.studentIds ?? []

    // If no specific students, get all from grade or class
    if (studentIds.length === 0) {
      const enrolledStudents = await db
        .select({ studentId: enrollments.studentId })
        .from(enrollments)
        .innerJoin(classes, eq(enrollments.classId, classes.id))
        .where(and(
          eq(classes.schoolId, context.schoolId),
          eq(enrollments.schoolYearId, data.schoolYearId),
          eq(enrollments.status, 'confirmed'),
          data.gradeId ? eq(classes.gradeId, data.gradeId) : undefined,
          data.classId ? eq(enrollments.classId, data.classId) : undefined,
        ))

      studentIds = enrolledStudents.map((e: { studentId: string }) => e.studentId)
    }

    const results = {
      total: studentIds.length,
      succeeded: 0,
      failed: 0,
      errors: [] as Array<{ studentId: string, error: string }>,
    }

    for (const studentId of studentIds) {
      try {
        await assignFeesToStudent({ data: { studentId, schoolYearId: data.schoolYearId } })
        results.succeeded++
      }
      catch (error) {
        results.failed++
        results.errors.push({
          studentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return { success: true as const, data: results }
  })

/**
 * Validate import data before processing
 */
export const validateImportData = createServerFn()
  .inputValidator(z.object({
    rows: z.array(z.record(z.string(), z.unknown())),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const db = getDb()

    const results = {
      isValid: true,
      totalRows: data.rows.length,
      validRows: 0,
      invalidRows: 0,
      errors: [] as Array<{ row: number, field: string, message: string }>,
      preview: [] as z.infer<typeof studentImportRowSchema>[],
    }

    // Get valid grade codes
    const gradesList = await db.select({ code: grades.code }).from(grades)
    const validGradeCodes = new Set(gradesList.map((g: { code: string }) => g.code))

    // Get valid series codes
    const seriesList = await db.select({ code: series.code }).from(series)
    const validSeriesCodes = new Set(seriesList.map((s: { code: string }) => s.code))

    for (let i = 0; i < data.rows.length; i++) {
      const row = data.rows[i]
      const rowNum = i + 2 // Excel row number (1-indexed + header)

      if (!row) {
        results.invalidRows++
        results.isValid = false
        results.errors.push({
          row: rowNum,
          field: 'row',
          message: 'Empty row',
        })
        continue
      }

      try {
        const parsed = studentImportRowSchema.parse(row)

        // Validate grade code exists
        if (!validGradeCodes.has(parsed.gradeCode)) {
          results.errors.push({
            row: rowNum,
            field: 'gradeCode',
            message: `Code niveau invalide: ${parsed.gradeCode}`,
          })
          results.invalidRows++
          results.isValid = false
          continue
        }

        // Validate series code if provided
        if (parsed.seriesCode && !validSeriesCodes.has(parsed.seriesCode)) {
          results.errors.push({
            row: rowNum,
            field: 'seriesCode',
            message: `Code série invalide: ${parsed.seriesCode}`,
          })
          results.invalidRows++
          results.isValid = false
          continue
        }

        results.validRows++
        if (results.preview.length < 10) {
          results.preview.push(parsed)
        }
      }
      catch (error) {
        results.invalidRows++
        results.isValid = false

        if (error instanceof z.ZodError) {
          for (const issue of error.issues) {
            results.errors.push({
              row: rowNum,
              field: issue.path.join('.'),
              message: issue.message,
            })
          }
        }
      }
    }

    return { success: true as const, data: results }
  })

/**
 * Import students from validated data
 */
export const importStudents = createServerFn()
  .inputValidator(z.object({
    rows: z.array(studentImportRowSchema),
    classId: z.string().optional(),
    schoolYearId: z.string(),
    autoEnroll: z.boolean().default(true),
  }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'create')

    const db = getDb()

    const results = {
      total: data.rows.length,
      succeeded: 0,
      failed: 0,
      errors: [] as Array<{ row: number, error: string }>,
    }

    // Get grade/series lookup
    const gradesList = await db.select().from(grades)
    type GradeRow = typeof gradesList[number]
    const gradeByCode = new Map(gradesList.map((g: GradeRow) => [g.code, g] as const))

    const seriesList = await db.select().from(series)
    type SeriesRow = typeof seriesList[number]
    const seriesByCode = new Map(seriesList.map((s: SeriesRow) => [s.code, s] as const))

    // Get classes for enrollment
    const classesList = await db
      .select()
      .from(classes)
      .where(and(
        eq(classes.schoolId, context.schoolId),
        eq(classes.schoolYearId, data.schoolYearId),
      ))

    const classLookup = new Map<string, string>()
    for (const c of classesList) {
      const key = `${c.gradeId}-${c.seriesId ?? 'null'}-${c.section}`
      classLookup.set(key, c.id)
    }

    const today = new Date().toISOString().split('T')[0] ?? new Date().toISOString().slice(0, 10)

    for (let i = 0; i < data.rows.length; i++) {
      const row = data.rows[i]
      const rowNum = i + 2

      if (!row) {
        results.failed++
        results.errors.push({ row: rowNum, error: 'Empty row' })
        continue
      }

      try {
        // Parse date from DD/MM/YYYY to YYYY-MM-DD
        const dateParts = row.dob.split('/')
        const day = dateParts[0]
        const month = dateParts[1]
        const year = dateParts[2]
        const dob = `${year}-${month}-${day}`

        // Generate matricule
        const shortId = generateUUID().slice(0, 4).toUpperCase()
        const matricule = `${context.schoolId.slice(0, 2).toUpperCase()}${year}${shortId}`

        // Create student
        const studentId = generateUUID()
        await db.insert(students).values({
          id: studentId,
          schoolId: context.schoolId,
          firstName: row.firstName,
          lastName: row.lastName,
          dob,
          gender: row.gender,
          matricule,
          status: 'active',
          admissionDate: today,
        })

        // Create parent if provided
        if (row.parentName && row.parentPhone) {
          const nameParts = row.parentName.split(' ')
          const parentFirstName = nameParts[0] ?? row.parentName
          const parentLastName = nameParts.slice(1).join(' ') || row.lastName

          const parentId = generateUUID()
          await db.insert(parents).values({
            id: parentId,
            firstName: parentFirstName,
            lastName: parentLastName,
            phone: row.parentPhone,
            email: row.parentEmail || null,
          })

          await db.insert(studentParents).values({
            id: generateUUID(),
            studentId,
            parentId,
            relationship: 'guardian',
            isPrimary: true,
          })
        }

        // Enroll if requested
        if (data.autoEnroll) {
          const grade = gradeByCode.get(row.gradeCode) as GradeRow | undefined
          const seriesObj = row.seriesCode ? seriesByCode.get(row.seriesCode) as SeriesRow | undefined : null

          if (grade) {
            const classKey = `${grade.id}-${seriesObj?.id ?? 'null'}-${row.section ?? '1'}`
            const targetClassId = data.classId ?? classLookup.get(classKey)

            if (targetClassId) {
              await db.insert(enrollments).values({
                id: generateUUID(),
                studentId,
                classId: targetClassId,
                schoolYearId: data.schoolYearId,
                status: 'confirmed',
                enrollmentDate: today,
                confirmedAt: new Date(),
              })
            }
          }
        }

        results.succeeded++
      }
      catch (error) {
        results.failed++
        results.errors.push({
          row: rowNum,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return { success: true as const, data: results }
  })
