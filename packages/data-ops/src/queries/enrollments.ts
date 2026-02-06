import type { Enrollment, EnrollmentInsert, EnrollmentStatus, Gender } from '../drizzle/school-schema'
import crypto from 'node:crypto'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, desc, eq, inArray, ne, or, sql } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { grades, series } from '../drizzle/core-schema'
import { classes, enrollments, schoolYears, students, users } from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

// ==================== Types ====================
export interface EnrollmentFilters {
  schoolId: string
  schoolYearId?: string
  classId?: string
  status?: EnrollmentStatus
  search?: string
  page?: number
  limit?: number
}
export interface CreateEnrollmentInput {
  studentId: string
  classId: string
  schoolYearId: string
  enrollmentDate?: string
  rollNumber?: number
}
export interface TransferInput {
  enrollmentId: string
  newClassId: string
  reason?: string
  effectiveDate?: string
}

export interface EnrollmentWithDetails {
  enrollment: Enrollment
  student: {
    id: string
    firstName: string
    lastName: string
    matricule: string | null
    photoUrl: string | null
    gender: Gender | null
  }
  class: {
    id: string
    section: string | null
    gradeName: string | null
    seriesName: string | null
  }
  confirmedByUser: {
    id: string
    name: string | null
  } | null
}

export interface EnrollmentStatistics {
  byStatus: Array<{ status: EnrollmentStatus, count: number }>
  byGrade: Array<{
    gradeId: string
    gradeName: string
    gradeOrder: number
    count: number
    boys: number
    girls: number
  }>
  byClass: Array<{
    classId: string
    className: string
    maxStudents: number
    count: number
    boys: number
    girls: number
  }>
  trends: Array<{
    date: string
    count: number
  }>
  total: number
  confirmed: number
  pending: number
}

// ==================== Queries ====================
export function getEnrollments(filters: EnrollmentFilters): ResultAsync<{
  data: EnrollmentWithDetails[]
  total: number
  page: number
  totalPages: number
}, DatabaseError> {
  const db = getDb()
  const { schoolId, schoolYearId, classId, status, search, page = 1, limit = 20 } = filters

  return ResultAsync.fromPromise(
    (async () => {
      const conditions = []
      if (schoolYearId) {
        conditions.push(eq(enrollments.schoolYearId, schoolYearId))
      }
      if (classId) {
        conditions.push(eq(enrollments.classId, classId))
      }
      if (status) {
        conditions.push(eq(enrollments.status, status))
      }
      if (search) {
        conditions.push(
          or(
            sql`${students.firstName} ILIKE ${`%${search}%`}`,
            sql`${students.lastName} ILIKE ${`%${search}%`}`,
            sql`${students.matricule} ILIKE ${`%${search}%`}`,
          )!,
        )
      }

      const query = db
        .select({
          enrollment: enrollments,
          student: {
            id: students.id,
            firstName: students.firstName,
            lastName: students.lastName,
            matricule: students.matricule,
            photoUrl: students.photoUrl,
            gender: students.gender,
          },
          class: {
            id: classes.id,
            section: classes.section,
            gradeName: grades.name,
            seriesName: series.name,
          },
          confirmedByUser: {
            id: users.id,
            name: users.name,
          },
        })
        .from(enrollments)
        .innerJoin(students, eq(enrollments.studentId, students.id))
        .innerJoin(classes, eq(enrollments.classId, classes.id))
        .innerJoin(grades, eq(classes.gradeId, grades.id))
        .leftJoin(series, eq(classes.seriesId, series.id))
        .leftJoin(users, eq(enrollments.confirmedBy, users.id))
        .where(and(eq(students.schoolId, schoolId), ...conditions))
        .orderBy(desc(enrollments.enrollmentDate))

      const offset = (page - 1) * limit
      const data = await query.limit(limit).offset(offset)

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(enrollments)
        .innerJoin(students, eq(enrollments.studentId, students.id))
        .where(and(eq(students.schoolId, schoolId), ...conditions))

      const total = Number(countResult[0]?.count || 0)
      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      }
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch enrollments'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId: filters.schoolId }))
}
export function getEnrollmentById(id: string): ResultAsync<EnrollmentWithDetails | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [enrollment] = await db
        .select({
          enrollment: enrollments,
          student: students,
          class: {
            id: classes.id,
            section: classes.section,
            gradeName: grades.name,
            seriesName: series.name,
            maxStudents: classes.maxStudents,
          },
          schoolYear: schoolYears,
          confirmedByUser: users,
        })
        .from(enrollments)
        .innerJoin(students, eq(enrollments.studentId, students.id))
        .innerJoin(classes, eq(enrollments.classId, classes.id))
        .innerJoin(grades, eq(classes.gradeId, grades.id))
        .leftJoin(series, eq(classes.seriesId, series.id))
        .innerJoin(schoolYears, eq(enrollments.schoolYearId, schoolYears.id))
        .leftJoin(users, eq(enrollments.confirmedBy, users.id))
        .where(eq(enrollments.id, id))

      if (!enrollment) {
        throw dbError('NOT_FOUND', `Enrollment with ID ${id} not found`)
      }
      return enrollment
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch enrollment'),
  ).mapErr(tapLogErr(databaseLogger, { enrollmentId: id }))
}
// ==================== CRUD Operations ====================
export function createEnrollment(data: CreateEnrollmentInput): ResultAsync<Enrollment, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      // Check if student already enrolled in this year
      const [existing] = await db
        .select()
        .from(enrollments)
        .where(
          and(
            eq(enrollments.studentId, data.studentId),
            eq(enrollments.schoolYearId, data.schoolYearId),
            ne(enrollments.status, 'cancelled'),
          ),
        )
      if (existing) {
        throw dbError('CONFLICT', 'Student is already enrolled for this school year')
      }
      // Check class capacity
      const classCapacity = await db
        .select({
          maxStudents: classes.maxStudents,
          currentCount: sql<number>`COUNT(${enrollments.id})`.as('current_count'),
        })
        .from(classes)
        .leftJoin(enrollments, and(eq(enrollments.classId, classes.id), eq(enrollments.status, 'confirmed')))
        .where(eq(classes.id, data.classId))
        .groupBy(classes.id)
      if (classCapacity[0] && Number(classCapacity[0].currentCount) >= classCapacity[0].maxStudents) {
        throw dbError('VALIDATION_ERROR', 'Class has reached maximum capacity')
      }
      // Generate roll number
      let rollNumber = data.rollNumber
      if (!rollNumber) {
        const lastRoll = await db
          .select({ maxRoll: sql<number>`MAX(${enrollments.rollNumber})` })
          .from(enrollments)
          .where(and(eq(enrollments.classId, data.classId), eq(enrollments.status, 'confirmed')))
        rollNumber = (lastRoll[0]?.maxRoll || 0) + 1
      }
      const [enrollment] = await db
        .insert(enrollments)
        .values({
          id: crypto.randomUUID(),
          ...data,
          enrollmentDate: data.enrollmentDate || new Date().toISOString().split('T')[0],
          rollNumber,
          status: 'pending',
        } as EnrollmentInsert)
        .returning()
      if (!enrollment) {
        throw dbError('INTERNAL_ERROR', 'Failed to create enrollment')
      }
      return enrollment
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create enrollment'),
  ).mapErr(tapLogErr(databaseLogger, { studentId: data.studentId, classId: data.classId }))
}
export function confirmEnrollment(id: string, userId: string): ResultAsync<Enrollment, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [enrollment] = await db
        .update(enrollments)
        .set({
          status: 'confirmed',
          confirmedAt: new Date(),
          confirmedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(enrollments.id, id))
        .returning()
      if (!enrollment) {
        throw dbError('NOT_FOUND', `Enrollment with ID ${id} not found`)
      }
      return enrollment
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to confirm enrollment'),
  ).mapErr(tapLogErr(databaseLogger, { enrollmentId: id, userId }))
}
export function cancelEnrollment(id: string, userId: string, reason?: string): ResultAsync<Enrollment, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [enrollment] = await db
        .update(enrollments)
        .set({
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledBy: userId,
          cancellationReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(enrollments.id, id))
        .returning()
      if (!enrollment) {
        throw dbError('NOT_FOUND', `Enrollment with ID ${id} not found`)
      }
      return enrollment
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to cancel enrollment'),
  ).mapErr(tapLogErr(databaseLogger, { enrollmentId: id, userId }))
}
export function deleteEnrollment(id: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      // Only allow deletion of pending enrollments
      const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, id))
      if (!enrollment) {
        throw dbError('NOT_FOUND', `Enrollment with ID ${id} not found`)
      }
      if (enrollment.status !== 'pending') {
        throw dbError('VALIDATION_ERROR', 'Can only delete pending enrollments. Use cancel for confirmed enrollments.')
      }
      await db.delete(enrollments).where(eq(enrollments.id, id))
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete enrollment'),
  ).mapErr(tapLogErr(databaseLogger, { enrollmentId: id }))
}
// ==================== Transfer ====================
export function transferStudent(data: TransferInput, userId: string): ResultAsync<Enrollment, DatabaseError> {
  const db = getDb()
  const { enrollmentId, newClassId, reason, effectiveDate } = data
  return ResultAsync.fromPromise(
    (async () => {
      // Get current enrollment
      const [currentEnrollment] = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId))
      if (!currentEnrollment) {
        throw dbError('NOT_FOUND', 'Enrollment not found')
      }
      if (currentEnrollment.status !== 'confirmed') {
        throw dbError('VALIDATION_ERROR', 'Can only transfer confirmed enrollments')
      }
      // Check new class capacity
      const classCapacity = await db
        .select({
          maxStudents: classes.maxStudents,
          currentCount: sql<number>`COUNT(${enrollments.id})`.as('current_count'),
        })
        .from(classes)
        .leftJoin(enrollments, and(eq(enrollments.classId, classes.id), eq(enrollments.status, 'confirmed')))
        .where(eq(classes.id, newClassId))
        .groupBy(classes.id)
      if (classCapacity[0] && Number(classCapacity[0].currentCount) >= classCapacity[0].maxStudents) {
        throw dbError('VALIDATION_ERROR', 'Target class has reached maximum capacity')
      }
      // Update current enrollment to transferred
      await db
        .update(enrollments)
        .set({
          status: 'transferred',
          transferredAt: new Date(),
          transferredTo: newClassId,
          transferReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(enrollments.id, enrollmentId))
      // Generate new roll number
      const lastRoll = await db
        .select({ maxRoll: sql<number>`MAX(${enrollments.rollNumber})` })
        .from(enrollments)
        .where(and(eq(enrollments.classId, newClassId), eq(enrollments.status, 'confirmed')))
      // Create new enrollment
      const [newEnrollment] = await db
        .insert(enrollments)
        .values({
          id: crypto.randomUUID(),
          studentId: currentEnrollment.studentId,
          classId: newClassId,
          schoolYearId: currentEnrollment.schoolYearId,
          enrollmentDate: effectiveDate || new Date().toISOString().split('T')[0],
          rollNumber: (lastRoll[0]?.maxRoll || 0) + 1,
          status: 'confirmed',
          confirmedAt: new Date(),
          confirmedBy: userId,
          previousEnrollmentId: enrollmentId,
        } as EnrollmentInsert)
        .returning()
      if (!newEnrollment) {
        throw dbError('INTERNAL_ERROR', 'Failed to create new enrollment for transfer')
      }
      return newEnrollment
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to transfer student'),
  ).mapErr(tapLogErr(databaseLogger, { enrollmentId: data.enrollmentId, newClassId: data.newClassId, userId }))
}

// ==================== Re-enrollment ====================

export function bulkReEnroll(
  schoolId: string,
  fromYearId: string,
  toYearId: string,
  options: {
    gradeMapping?: Record<string, string>
    autoConfirm?: boolean
  } = {},
): ResultAsync<{ success: number, skipped: number, errors: Array<{ studentId: string, error: string }> }, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    (async () => {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to bulk re-enroll students'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, fromYearId, toYearId }))
}

// ==================== Statistics ====================

export function getEnrollmentStatistics(schoolId: string, schoolYearId: string): ResultAsync<EnrollmentStatistics, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    (async () => {
      // Execute all stats queries in parallel
      const [
        byStatus,
        byGrade,
        byClass,
        trends,
      ] = await Promise.all([
        // Enrollments by status
        db
          .select({
            status: enrollments.status,
            count: sql<number>`COUNT(*)`.as('count'),
          })
          .from(enrollments)
          .innerJoin(students, eq(enrollments.studentId, students.id))
          .where(and(eq(students.schoolId, schoolId), eq(enrollments.schoolYearId, schoolYearId)))
          .groupBy(enrollments.status),

        // Enrollments by grade
        db
          .select({
            gradeId: grades.id,
            gradeName: grades.name,
            gradeOrder: grades.order,
            count: sql<number>`COUNT(*)`.as('count'),
            boys: sql<number>`COUNT(CASE WHEN ${students.gender} = 'M' THEN 1 END)`.as('boys'),
            girls: sql<number>`COUNT(CASE WHEN ${students.gender} = 'F' THEN 1 END)`.as('girls'),
          })
          .from(enrollments)
          .innerJoin(students, eq(enrollments.studentId, students.id))
          .innerJoin(classes, eq(enrollments.classId, classes.id))
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .where(
            and(
              eq(students.schoolId, schoolId),
              eq(enrollments.schoolYearId, schoolYearId),
              eq(enrollments.status, 'confirmed'),
            ),
          )
          .groupBy(grades.id, grades.name, grades.order)
          .orderBy(grades.order),

        // Enrollments by class
        db
          .select({
            classId: classes.id,
            className: sql<string>`CONCAT(${grades.name}, ' ', ${classes.section})`.as('class_name'),
            maxStudents: classes.maxStudents,
            count: sql<number>`COUNT(*)`.as('count'),
            boys: sql<number>`COUNT(CASE WHEN ${students.gender} = 'M' THEN 1 END)`.as('boys'),
            girls: sql<number>`COUNT(CASE WHEN ${students.gender} = 'F' THEN 1 END)`.as('girls'),
          })
          .from(enrollments)
          .innerJoin(students, eq(enrollments.studentId, students.id))
          .innerJoin(classes, eq(enrollments.classId, classes.id))
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .where(
            and(
              eq(students.schoolId, schoolId),
              eq(enrollments.schoolYearId, schoolYearId),
              eq(enrollments.status, 'confirmed'),
            ),
          )
          .groupBy(classes.id, grades.name, classes.section, classes.maxStudents, grades.order)
          .orderBy(grades.order, classes.section),

        // Enrollment trends (last 30 days)
        db
          .select({
            date: sql<string>`DATE(${enrollments.enrollmentDate})`.as('date'),
            count: sql<number>`COUNT(*)`.as('count'),
          })
          .from(enrollments)
          .innerJoin(students, eq(enrollments.studentId, students.id))
          .where(
            and(
              eq(students.schoolId, schoolId),
              eq(enrollments.schoolYearId, schoolYearId),
              sql`${enrollments.enrollmentDate} >= CURRENT_DATE - INTERVAL '30 days'`,
            ),
          )
          .groupBy(sql`DATE(${enrollments.enrollmentDate})`)
          .orderBy(sql`DATE(${enrollments.enrollmentDate})`),
      ])

      return {
        byStatus,
        byGrade,
        byClass,
        trends,
        total: byStatus.reduce((sum: number, s: { count: number }) => sum + Number(s.count), 0),
        confirmed: Number(byStatus.find((s: { status: string }) => s.status === 'confirmed')?.count || 0),
        pending: Number(byStatus.find((s: { status: string }) => s.status === 'pending')?.count || 0),
      }
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch enrollment statistics'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, schoolYearId }))
}
