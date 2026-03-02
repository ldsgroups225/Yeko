import type { EnrollmentInsert } from '../../drizzle/school-schema'
import crypto from 'node:crypto'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, inArray, ne, sql } from 'drizzle-orm'
import { getDb } from '../../database/setup'
import { classes, enrollments, students } from '../../drizzle/school-schema'
import { DatabaseError, dbError } from '../../errors'
import { getNestedErrorMessage } from '../../i18n'

export async function bulkEnroll(
  schoolId: string,
  classId: string,
  schoolYearId: string,
  studentIds: string[],
  options: { autoConfirm?: boolean } = {},
): R.ResultAsync<{ success: number, failed: number, skipped: number, errors: Array<{ studentId: string, error: string }> }, DatabaseError> {
  const db = getDb()
  const { autoConfirm = false } = options

  return R.pipe(
    R.try({
      try: async () => {
        const results = {
          total: studentIds.length,
          success: 0,
          failed: 0,
          skipped: 0,
          errors: [] as Array<{ studentId: string, error: string }>,
        }

        // 1. Verify class exists and belongs to school
        const [targetClass] = await db
          .select()
          .from(classes)
          .where(and(eq(classes.id, classId), eq(classes.schoolId, schoolId)))
          .limit(1)

        if (!targetClass) {
          throw dbError('NOT_FOUND', 'Target class not found')
        }

        // 2. Verify students belong to school
        const validStudents = await db
          .select({ id: students.id })
          .from(students)
          .where(and(eq(students.schoolId, schoolId), inArray(students.id, studentIds)))

        const validStudentIds = new Set(validStudents.map(s => s.id))

        for (const id of studentIds) {
          if (!validStudentIds.has(id)) {
            results.failed++
            results.errors.push({ studentId: id, error: 'Student not found in this school' })
          }
        }

        if (validStudents.length === 0)
          return results

        // 3. Check for existing enrollments for these students in this year
        const existingEnrollments = await db
          .select({ studentId: enrollments.studentId })
          .from(enrollments)
          .where(
            and(
              inArray(enrollments.studentId, Array.from(validStudentIds)),
              eq(enrollments.schoolYearId, schoolYearId),
              ne(enrollments.status, 'cancelled'),
            ),
          )

        const alreadyEnrolled = new Set(existingEnrollments.map(e => e.studentId))
        const today = new Date().toISOString().split('T')[0]

        // 4. Get current max roll number
        const lastRoll = await db
          .select({ maxRoll: sql<number>`MAX(${enrollments.rollNumber})` })
          .from(enrollments)
          .where(and(eq(enrollments.classId, classId), eq(enrollments.schoolYearId, schoolYearId)))

        let rollCounter = (Number(lastRoll[0]?.maxRoll) || 0)

        // 5. Prepare inserts
        const toInsert: EnrollmentInsert[] = []
        for (const studentId of Array.from(validStudentIds)) {
          if (alreadyEnrolled.has(studentId)) {
            results.skipped++
            continue
          }

          rollCounter++
          toInsert.push({
            id: crypto.randomUUID(),
            studentId,
            classId,
            schoolYearId,
            status: autoConfirm ? 'confirmed' : 'pending',
            enrollmentDate: today,
            confirmedAt: autoConfirm ? new Date() : null,
            rollNumber: rollCounter,
          } as EnrollmentInsert)
        }

        // 6. Execute inserts
        if (toInsert.length > 0) {
          await db.insert(enrollments).values(toInsert)
          results.success = toInsert.length
        }

        return results
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to bulk enroll students'),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, classId, schoolYearId })),
  )
}

export async function bulkReEnroll(
  schoolId: string,
  fromYearId: string,
  toYearId: string,
  options: {
    gradeMapping?: Record<string, string>
    autoConfirm?: boolean
  } = {},
): R.ResultAsync<{ success: number, skipped: number, errors: Array<{ studentId: string, error: string }> }, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        const results = { success: 0, skipped: 0, errors: [] as Array<{ studentId: string, error: string }> }

        // 1. Get all confirmed enrollments from previous year
        const previousEnrollments = await db
          .select({
            enrollment: enrollments,
            student: students,
            class: classes,
          })
          .from(enrollments)
          .innerJoin(students, eq(enrollments.studentId, students.id))
          .innerJoin(classes, eq(enrollments.classId, classes.id))
          .where(
            and(
              eq(students.schoolId, schoolId),
              eq(enrollments.schoolYearId, fromYearId),
              eq(enrollments.status, 'confirmed'),
              eq(students.status, 'active'),
            ),
          )

        if (previousEnrollments.length === 0) {
          return results
        }

        // 2. Pre-fetch existing enrollments in target year to avoid N+1 checks
        const studentIds = previousEnrollments.map(pe => pe.student.id)
        const existingInTarget = await db
          .select({ studentId: enrollments.studentId })
          .from(enrollments)
          .where(
            and(
              inArray(enrollments.studentId, studentIds),
              eq(enrollments.schoolYearId, toYearId),
              ne(enrollments.status, 'cancelled'),
            ),
          )

        const alreadyEnrolledIds = new Set(existingInTarget.map(e => e.studentId))

        // 3. Pre-fetch target classes in target year
        const targetClassesList = await db
          .select()
          .from(classes)
          .where(and(eq(classes.schoolId, schoolId), eq(classes.schoolYearId, toYearId), eq(classes.status, 'active')))

        // Map by gradeId and seriesId for fast lookup
        const classLookup = new Map<string, typeof targetClassesList[0]>()
        for (const c of targetClassesList) {
          const key = `${c.gradeId}-${c.seriesId || 'none'}`
          if (!classLookup.has(key))
            classLookup.set(key, c)
        }

        // 4. Pre-fetch current max roll numbers per class
        const rollResults = await db
          .select({
            classId: enrollments.classId,
            maxRoll: sql<number>`MAX(${enrollments.rollNumber})`,
          })
          .from(enrollments)
          .where(eq(enrollments.schoolYearId, toYearId))
          .groupBy(enrollments.classId)

        const rollMap = new Map<string, number>(rollResults.map(r => [r.classId, Number(r.maxRoll || 0)]))

        // 5. Prepare batch inserts
        const toInsert: EnrollmentInsert[] = []
        const today = new Date().toISOString().split('T')[0]

        for (const { enrollment, student, class: prevClass } of previousEnrollments) {
          if (alreadyEnrolledIds.has(student.id)) {
            results.skipped++
            continue
          }

          const targetGradeId = options.gradeMapping?.[prevClass.gradeId] || prevClass.gradeId
          const classKey = `${targetGradeId}-${prevClass.seriesId || 'none'}`
          const targetClass = classLookup.get(classKey)

          if (!targetClass) {
            results.errors.push({
              studentId: student.id,
              error: `${getNestedErrorMessage('classes', 'notFound')}: ${targetGradeId}`,
            })
            continue
          }

          const currentRoll = rollMap.get(targetClass.id) || 0
          const nextRoll = currentRoll + 1
          rollMap.set(targetClass.id, nextRoll)

          toInsert.push({
            id: crypto.randomUUID(),
            studentId: student.id,
            classId: targetClass.id,
            schoolYearId: toYearId,
            enrollmentDate: today,
            rollNumber: nextRoll,
            status: options.autoConfirm ? 'confirmed' : 'pending',
            confirmedAt: options.autoConfirm ? new Date() : null,
            previousEnrollmentId: enrollment.id,
          } as EnrollmentInsert)
        }

        // 6. Execute Batch Insert
        if (toInsert.length > 0) {
          try {
            await db.insert(enrollments).values(toInsert)
            results.success = toInsert.length
          }
          catch {
            // If batch fails, we fall back to individual inserts to handle specific errors
            for (const item of toInsert) {
              try {
                await db.insert(enrollments).values(item)
                results.success++
              }
              catch (e) {
                results.errors.push({
                  studentId: item.studentId,
                  error: e instanceof Error ? e.message : 'Batch insertion failed',
                })
              }
            }
          }
        }

        return results
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to bulk re-enroll students'),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, fromYearId, toYearId })),
  )
}
