import { getDb } from '@repo/data-ops/database/setup'
import {
  and,
  eq,
  inArray,
} from '@repo/data-ops/drizzle/operators'
import {
  classes,
  enrollments,
  students,
} from '@repo/data-ops/drizzle/school-schema'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import {
  bulkEnrollmentSchema,
  bulkReEnrollmentSchema,
} from '@/schemas/bulk-operations'
import { generateUUID } from '@/utils/generateUUID'
import { authServerFn } from '../../lib/server-fn'
import { requirePermission } from '../../middleware/permissions'

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

      const targetClasses = await db
        .select()
        .from(classes)
        .where(and(
          eq(classes.schoolId, schoolId),
          eq(classes.schoolYearId, data.toSchoolYearId),
        ))

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
