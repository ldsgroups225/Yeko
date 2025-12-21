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
import { executeBulkFeeAssignment } from './fee-calculation'

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

    const toInsert = data.studentIds
      .filter(studentId => !alreadyEnrolled.has(studentId))
      .map(studentId => ({
        id: generateUUID(),
        studentId,
        classId: data.classId,
        schoolYearId: data.schoolYearId,
        status: (data.autoConfirm ? 'confirmed' : 'pending') as 'pending' | 'confirmed' | 'cancelled' | 'transferred',
        enrollmentDate: today,
        confirmedAt: data.autoConfirm ? new Date() : null,
      }))

    if (toInsert.length > 0) {
      try {
        await db.insert(enrollments).values(toInsert)
        results.succeeded = toInsert.length
      }
      catch {
        // Fallback to individual inserts to capture specific errors if batch fails
        for (const item of toInsert) {
          try {
            await db.insert(enrollments).values(item)
            results.succeeded++
          }
          catch (e) {
            results.failed++
            results.errors.push({
              studentId: item.studentId,
              error: e instanceof Error ? e.message : 'Individual insertion failed',
            })
          }
        }
      }
    }

    results.skipped = data.studentIds.length - toInsert.length - results.failed

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

    const toInsert: any[] = []

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

      toInsert.push({
        id: generateUUID(),
        studentId: enrollment.studentId,
        classId: targetClassId,
        schoolYearId: data.toSchoolYearId,
        status: (data.autoConfirm ? 'confirmed' : 'pending') as 'pending' | 'confirmed' | 'cancelled' | 'transferred',
        enrollmentDate: today,
        confirmedAt: data.autoConfirm ? new Date() : null,
      })
    }

    if (toInsert.length > 0) {
      try {
        await db.insert(enrollments).values(toInsert)
        results.succeeded = toInsert.length
      }
      catch {
        // Fallback to individual inserts to capture specific errors if batch fails
        for (const item of toInsert) {
          try {
            await db.insert(enrollments).values(item)
            results.succeeded++
          }
          catch (e) {
            results.failed++
            results.errors.push({
              studentId: item.studentId,
              error: e instanceof Error ? e.message : 'Individual insertion failed',
            })
          }
        }
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

    try {
      // 1. Get all current confirmed enrollments for these students
      const currentEnrollments = await db
        .select()
        .from(enrollments)
        .where(and(
          inArray(enrollments.studentId, data.studentIds),
          eq(enrollments.schoolYearId, yearContext.schoolYearId),
          eq(enrollments.status, 'confirmed'),
        ))

      if (currentEnrollments.length === 0) {
        return { success: true as const, data: { ...results, failed: data.studentIds.length, errors: data.studentIds.map(id => ({ studentId: id, error: 'No active enrollment found' })) } }
      }

      const enrolledStudentIds = new Set(currentEnrollments.map(e => e.studentId))
      const enrollmentIds = currentEnrollments.map(e => e.id)

      // Identify students not found
      for (const id of data.studentIds) {
        if (!enrolledStudentIds.has(id)) {
          results.failed++
          results.errors.push({ studentId: id, error: 'No active enrollment found' })
        }
      }

      // 2. Batch update enrollments to transferred
      await db
        .update(enrollments)
        .set({
          status: 'transferred',
          transferredAt: now,
          transferredTo: data.newClassId,
          transferReason: data.reason,
        })
        .where(inArray(enrollments.id, enrollmentIds))

      // 3. Batch insert new enrollments
      const toInsert = currentEnrollments.map(e => ({
        id: generateUUID(),
        studentId: e.studentId,
        classId: data.newClassId,
        schoolYearId: yearContext.schoolYearId,
        status: 'confirmed' as const,
        enrollmentDate: now.toISOString().split('T')[0] ?? now.toISOString().slice(0, 10),
        confirmedAt: now,
        previousEnrollmentId: e.id,
      }))

      await db.insert(enrollments).values(toInsert)
      results.succeeded = toInsert.length
    }
    catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Batch transfer failed',
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

    const results = await executeBulkFeeAssignment({
      studentIds,
      schoolId: context.schoolId,
      schoolYearId: data.schoolYearId,
      gradeId: data.gradeId,
    })

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

    try {
      await db.transaction(async (tx) => {
        const studentRecords: any[] = []
        const parentRecords: any[] = []
        const studentParentLinks: any[] = []
        const enrollmentRecords: any[] = []
        const parentsByPhone = new Map<string, string>()

        for (const row of data.rows) {
          // 1. Parse date
          const dateParts = row.dob.split('/')
          const dob = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`

          // 2. Generate student
          const studentId = generateUUID()
          const shortId = generateUUID().slice(0, 4).toUpperCase()
          const matricule = `${context.schoolId.slice(0, 2).toUpperCase()}${dateParts[2]}${shortId}`

          studentRecords.push({
            id: studentId,
            schoolId: context.schoolId,
            firstName: row.firstName,
            lastName: row.lastName,
            dob,
            gender: row.gender,
            matricule,
            status: 'active' as const,
            admissionDate: today,
          })

          // 3. Handle Parent (Dedupe by phone)
          if (row.parentName && row.parentPhone) {
            let parentId = parentsByPhone.get(row.parentPhone)
            if (!parentId) {
              parentId = generateUUID()
              parentsByPhone.set(row.parentPhone, parentId)

              const nameParts = row.parentName.split(' ')
              parentRecords.push({
                id: parentId,
                firstName: nameParts[0] ?? row.parentName,
                lastName: nameParts.slice(1).join(' ') || row.lastName,
                phone: row.parentPhone,
                email: row.parentEmail || null,
              })
            }

            studentParentLinks.push({
              id: generateUUID(),
              studentId,
              parentId,
              relationship: 'guardian' as const,
              isPrimary: true,
            })
          }

          // 4. Handle Enrollment
          if (data.autoEnroll) {
            const grade = gradeByCode.get(row.gradeCode) as GradeRow | undefined
            const seriesObj = row.seriesCode ? seriesByCode.get(row.seriesCode) as SeriesRow | undefined : null

            if (grade) {
              const classKey = `${grade.id}-${seriesObj?.id ?? 'null'}-${row.section ?? '1'}`
              const targetClassId = data.classId ?? classLookup.get(classKey)

              if (targetClassId) {
                enrollmentRecords.push({
                  id: generateUUID(),
                  studentId,
                  classId: targetClassId,
                  schoolYearId: data.schoolYearId,
                  status: 'confirmed' as const,
                  enrollmentDate: today,
                  confirmedAt: new Date(),
                })
              }
            }
          }
        }

        // Batch Insert All
        if (studentRecords.length > 0)
          await tx.insert(students).values(studentRecords)
        if (parentRecords.length > 0)
          await tx.insert(parents).values(parentRecords).onConflictDoNothing()
        if (studentParentLinks.length > 0)
          await tx.insert(studentParents).values(studentParentLinks)
        if (enrollmentRecords.length > 0)
          await tx.insert(enrollments).values(enrollmentRecords)

        results.succeeded = data.rows.length
      })
    }
    catch (error) {
      results.failed = data.rows.length
      results.errors.push({ row: 0, error: error instanceof Error ? error.message : 'Import failed' })
    }

    return { success: true as const, data: results }
  })
