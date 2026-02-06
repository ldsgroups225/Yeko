import { getDb } from '@repo/data-ops/database/setup'
import { grades, series } from '@repo/data-ops/drizzle/core-schema'
import {
  and,
  eq,
  inArray,
} from '@repo/data-ops/drizzle/operators'
import {
  classes,
  enrollments,
  parents,
  studentParents,
  students,
} from '@repo/data-ops/drizzle/school-schema'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { z } from 'zod'
import {
  bulkEnrollmentSchema,
  bulkFeeAssignmentSchema,
  bulkReEnrollmentSchema,
  bulkTransferSchema,
  studentImportRowSchema,
} from '@/schemas/bulk-operations'
import { generateUUID } from '@/utils/generateUUID'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'
import { executeBulkFeeAssignment } from './fee-calculation'

/**
 * Bulk enroll students into a class
 */
export const bulkEnrollStudents = authServerFn
  .inputValidator(bulkEnrollmentSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('enrollments', 'create')
    const db = getDb()

    const results = {
      total: data.studentIds.length,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      errors: [] as Array<{ studentId: string, error: string }>,
    }

    try {
      // Check class exists and get capacity
      const [targetClass] = await db
        .select()
        .from(classes)
        .where(and(
          eq(classes.id, data.classId),
          eq(classes.schoolId, schoolId),
        ))
        .limit(1)

      if (!targetClass) {
        return { success: false as const, error: 'Classe non trouvée' }
      }

      // Verify student ownership
      const validStudents = await db
        .select({ id: students.id })
        .from(students)
        .where(and(
          eq(students.schoolId, schoolId),
          inArray(students.id, data.studentIds),
        ))

      const validStudentIds = new Set(validStudents.map(s => s.id))
      const invalidIds = data.studentIds.filter(id => !validStudentIds.has(id))

      for (const id of invalidIds) {
        results.failed++
        results.errors.push({ studentId: id, error: 'Étudiant non trouvé dans cette école' })
      }

      if (validStudents.length === 0) {
        return { success: true as const, data: results }
      }

      // Check for existing enrollments
      const existingEnrollments = await db
        .select({ studentId: enrollments.studentId })
        .from(enrollments)
        .where(and(
          inArray(enrollments.studentId, Array.from(validStudentIds)),
          eq(enrollments.schoolYearId, data.schoolYearId),
          inArray(enrollments.status, ['pending', 'confirmed']),
        ))

      const alreadyEnrolled = new Set(existingEnrollments.map((e: { studentId: string }) => e.studentId))
      const today = new Date().toISOString().split('T')[0] ?? new Date().toISOString().slice(0, 10)

      const toInsert = Array.from(validStudentIds)
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
        await db.transaction(async (tx) => {
          await tx.insert(enrollments).values(toInsert)
        })
        results.succeeded = toInsert.length

        await createAuditLog({
          schoolId,
          userId,
          action: 'create',
          tableName: 'enrollments',
          recordId: 'bulk-enroll',
          newValues: { classId: data.classId, count: toInsert.length },
        })
      }

      results.skipped = data.studentIds.length - toInsert.length - results.failed
      return { success: true as const, data: results }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de l\'inscription groupée' }
    }
  })

/**
 * Bulk re-enroll students from previous year
 */
export const bulkReEnrollFromPreviousYear = authServerFn
  .inputValidator(bulkReEnrollmentSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('enrollments', 'create')
    const db = getDb()

    try {
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
          eq(classes.schoolId, schoolId),
          eq(enrollments.schoolYearId, data.fromSchoolYearId),
          eq(enrollments.status, 'confirmed'),
        ))

      // Get target year classes
      const targetClasses = await db
        .select()
        .from(classes)
        .where(and(
          eq(classes.schoolId, schoolId),
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
        .innerJoin(students, eq(enrollments.studentId, students.id))
        .where(and(
          eq(students.schoolId, schoolId),
          eq(enrollments.schoolYearId, data.toSchoolYearId),
          inArray(enrollments.status, ['pending', 'confirmed']),
        ))

      const alreadyEnrolled = new Set(existingEnrollmentsTarget.map((e: { studentId: string }) => e.studentId))
      const today = new Date().toISOString().split('T')[0] ?? new Date().toISOString().slice(0, 10)

      const toInsert: {
        id: string
        studentId: string
        classId: string
        schoolYearId: string
        status: 'confirmed' | 'pending' | 'cancelled' | 'transferred'
        enrollmentDate: string
        confirmedAt: Date | null
      }[] = []

      for (const enrollment of sourceEnrollments) {
        if (alreadyEnrolled.has(enrollment.studentId)) {
          results.skipped++
          continue
        }

        // Find target class
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
            error: 'Aucune classe correspondante trouvée pour l\'année cible',
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
        await db.transaction(async (tx) => {
          await tx.insert(enrollments).values(toInsert)
        })
        results.succeeded = toInsert.length

        await createAuditLog({
          schoolId,
          userId,
          action: 'create',
          tableName: 'enrollments',
          recordId: 'bulk-reenroll',
          newValues: { fromYear: data.fromSchoolYearId, toYear: data.toSchoolYearId, count: toInsert.length },
        })
      }

      return { success: true as const, data: results }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la réinscription groupée' }
    }
  })

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
      // 1. Get all current confirmed enrollments for these students
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

      // Identify students not found
      for (const id of data.studentIds) {
        if (!enrolledStudentIds.has(id)) {
          results.failed++
          results.errors.push({ studentId: id, error: 'Aucune inscription active trouvée' })
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
        schoolYearId: schoolYear.schoolYearId,
        status: 'confirmed' as const,
        enrollmentDate: now.toISOString().split('T')[0] ?? now.toISOString().slice(0, 10),
        confirmedAt: now,
        previousEnrollmentId: e.id,
      }))

      await db.insert(enrollments).values(toInsert)
      results.succeeded = toInsert.length

      await createAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'enrollments',
        recordId: 'bulk-transfer',
        newValues: { newClassId: data.newClassId, count: toInsert.length },
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

    // If no specific students, get all from grade or class
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

/**
 * Validate import data before processing
 */
export const validateImportData = authServerFn
  .inputValidator(z.object({
    rows: z.array(z.record(z.string(), z.unknown())),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('students', 'create')
    const db = getDb()

    const results = {
      isValid: true,
      totalRows: data.rows.length,
      validRows: 0,
      invalidRows: 0,
      errors: [] as Array<{ row: number, field: string, message: string }>,
      preview: [] as z.infer<typeof studentImportRowSchema>[],
    }

    try {
      // Get valid grade codes
      const gradesList = await db.select({ code: grades.code }).from(grades)
      const validGradeCodes = new Set(gradesList.map((g: { code: string }) => g.code))

      // Get valid series codes
      const seriesList = await db.select({ code: series.code }).from(series)
      const validSeriesCodes = new Set(seriesList.map((s: { code: string }) => s.code))

      for (let i = 0; i < data.rows.length; i++) {
        const row = data.rows[i]
        const rowNum = i + 2 // Excel row number

        if (!row) {
          results.invalidRows++
          results.isValid = false
          results.errors.push({
            row: rowNum,
            field: 'row',
            message: 'Ligne vide',
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
    }
    catch {
      return { success: false as const, error: 'La validation des données a échoué' }
    }
  })

/**
 * Import students from validated data
 */
export const importStudents = authServerFn
  .inputValidator(z.object({
    rows: z.array(studentImportRowSchema),
    classId: z.string().optional(),
    schoolYearId: z.string(),
    autoEnroll: z.boolean().default(true),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('students', 'create')
    const db = getDb()

    const results = {
      total: data.rows.length,
      succeeded: 0,
      failed: 0,
      errors: [] as Array<{ row: number, error: string }>,
    }

    try {
      // Get grade/series lookup
      const gradesList = await db.select().from(grades)
      const gradeByCode = new Map(gradesList.map(g => [g.code, g] as const))

      const seriesList = await db.select().from(series)
      const seriesByCode = new Map(seriesList.map(s => [s.code, s] as const))

      // Get classes for enrollment
      const classesList = await db
        .select()
        .from(classes)
        .where(and(
          eq(classes.schoolId, schoolId),
          eq(classes.schoolYearId, data.schoolYearId),
        ))

      const classLookup = new Map<string, string>()
      for (const c of classesList) {
        const key = `${c.gradeId}-${c.seriesId ?? 'null'}-${c.section}`
        classLookup.set(key, c.id)
      }

      const today = new Date().toISOString().split('T')[0] ?? new Date().toISOString().slice(0, 10)

      await db.transaction(async (tx) => {
        const studentRecords: (typeof students.$inferInsert)[] = []
        const parentRecords: (typeof parents.$inferInsert)[] = []
        const studentParentLinks: (typeof studentParents.$inferInsert)[] = []
        const enrollmentRecords: (typeof enrollments.$inferInsert)[] = []
        const parentsByPhone = new Map<string, string>()

        for (const row of data.rows) {
          // Parse date
          const dateParts = row.dob.split('/')
          const dob = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`

          // Generate student
          const studentId = generateUUID()
          const shortId = generateUUID().slice(0, 4).toUpperCase()
          const matricule = `${schoolId.slice(0, 2).toUpperCase()}${dateParts[2]}${shortId}`

          studentRecords.push({
            id: studentId,
            schoolId,
            firstName: row.firstName,
            lastName: row.lastName,
            dob,
            gender: row.gender,
            matricule,
            status: 'active' as const,
            admissionDate: today,
          })

          // Handle Parent
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

          // Handle Enrollment
          if (data.autoEnroll) {
            const grade = gradeByCode.get(row.gradeCode)
            const seriesObj = row.seriesCode ? seriesByCode.get(row.seriesCode) : null

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

      await createAuditLog({
        schoolId,
        userId,
        action: 'create',
        tableName: 'students',
        recordId: 'bulk-import',
        newValues: { count: data.rows.length },
      })

      return { success: true as const, data: results }
    }
    catch {
      return { success: false as const, error: 'L\'importation a échoué' }
    }
  })
