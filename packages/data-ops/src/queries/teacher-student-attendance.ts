/**
 * Student Attendance Queries for Teacher App
 * Queries for student attendance tracking
 */
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, asc, count, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm'

import { err, ok, ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { grades } from '../drizzle/core-schema'
import {
  classes,
  classSessions,
  enrollments,
  studentAttendance,
  students,
} from '../drizzle/school-schema'
import { DatabaseError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

export function getClassRosterForAttendance(params: {
  schoolId: string
  classId: string
  schoolYearId: string
  date: string
  classSessionId?: string
}): ResultAsync<Array<{
  studentId: string
  firstName: string
  lastName: string
  matricule: string | null
  photoUrl: string | null
  enrollmentId: string
  attendance: {
    id: string
    studentId: string
    status: 'present' | 'absent' | 'late' | 'excused'
    notes: string | null
    recordedAt: Date
  } | null
}>, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    (async () => {
      // Get all students confirmed in the class
      const classRoster = await db
        .select({
          studentId: students.id,
          firstName: students.firstName,
          lastName: students.lastName,
          matricule: students.matricule,
          photoUrl: students.photoUrl,
          enrollmentId: enrollments.id,
        })
        .from(students)
        .innerJoin(enrollments, eq(enrollments.studentId, students.id))
        .where(
          and(
            eq(students.schoolId, params.schoolId),
            eq(enrollments.classId, params.classId),
            eq(enrollments.schoolYearId, params.schoolYearId),
            eq(enrollments.status, 'confirmed'),
          ),
        )
        .orderBy(asc(students.lastName), asc(students.firstName))

      // Get existing attendance records for these students on this date/session
      const attendanceConditions = [
        eq(studentAttendance.schoolId, params.schoolId),
        eq(studentAttendance.classId, params.classId),
        eq(studentAttendance.date, params.date),
      ]
      if (params.classSessionId) {
        attendanceConditions.push(
          eq(studentAttendance.classSessionId, params.classSessionId),
        )
      }

      const existingAttendance = await db
        .select({
          id: studentAttendance.id,
          studentId: studentAttendance.studentId,
          status: studentAttendance.status,
          notes: studentAttendance.reason,
          recordedAt: studentAttendance.createdAt,
        })
        .from(studentAttendance)
        .where(and(...attendanceConditions))

      type AttendanceRecord = typeof existingAttendance[number]
      const attendanceMap = new Map<string, AttendanceRecord>(
        existingAttendance.map(a => [a.studentId, a]),
      )

      return classRoster.map(student => ({
        ...student,
        attendance: attendanceMap.get(student.studentId) ?? null,
      }))
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch class roster for attendance'),
  ).mapErr(tapLogErr(databaseLogger, params))
}

/**
 * Get or create an attendance session
 */
export function getOrCreateAttendanceSession(params: {
  schoolId: string
  classId: string
  subjectId: string
  teacherId: string
  date: string
  startTime: string
  endTime: string
  timetableSessionId?: string
}): ResultAsync<{ session: typeof classSessions.$inferSelect, isNew: boolean }, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      // Try to find existing session
      const [existing] = await tx
        .select()
        .from(classSessions)
        .where(
          and(
            eq(classSessions.classId, params.classId),
            eq(classSessions.subjectId, params.subjectId),
            eq(classSessions.date, params.date),
            eq(classSessions.startTime, params.startTime),
          ),
        )
        .limit(1)

      if (existing) {
        return { session: existing, isNew: false }
      }

      // Create new session
      const [session] = await tx
        .insert(classSessions)
        .values({
          id: crypto.randomUUID(),
          classId: params.classId,
          subjectId: params.subjectId,
          teacherId: params.teacherId,
          date: params.date,
          startTime: params.startTime,
          endTime: params.endTime,
          timetableSessionId: params.timetableSessionId ?? null,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      if (!session)
        return null // Will be handled by check

      return { session, isNew: true }
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to get or create attendance session'),
  )
    .andThen((result) => {
      if (!result)
        return err(new DatabaseError('INTERNAL_ERROR', getNestedErrorMessage('attendance', 'createFailed')))
      return ok(result)
    })
    .mapErr(tapLogErr(databaseLogger, params))
}

/**
 * Save individual student attendance
 */
export function saveStudentAttendance(params: {
  schoolId: string
  enrollmentId: string
  sessionId: string
  sessionDate: string
  status: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
  teacherId: string
}): ResultAsync<{ attendance: typeof studentAttendance.$inferSelect, isNew: boolean }, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      // Find enrollment to get student and class info
      const [enrollment] = await tx
        .select({
          studentId: enrollments.studentId,
          classId: enrollments.classId,
        })
        .from(enrollments)
        .innerJoin(students, eq(enrollments.studentId, students.id))
        .where(and(
          eq(enrollments.id, params.enrollmentId),
          eq(students.schoolId, params.schoolId),
        ))
        .limit(1)

      if (!enrollment)
        return null

      const [attendance] = await tx
        .insert(studentAttendance)
        .values({
          id: crypto.randomUUID(),
          schoolId: params.schoolId,
          studentId: enrollment.studentId,
          classId: enrollment.classId,
          classSessionId: params.sessionId,
          date: params.sessionDate,
          status: params.status,
          reason: params.notes ?? null,
          recordedBy: params.teacherId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [
            studentAttendance.studentId,
            studentAttendance.date,
            studentAttendance.classId,
            studentAttendance.classSessionId,
          ],
          set: {
            status: params.status,
            reason: params.notes ?? null,
            updatedAt: new Date(),
          },
        })
        .returning()

      if (!attendance)
        return 'FAILED_INSERT' as const

      // Update session counters
      const sessionConditions = [
        eq(studentAttendance.schoolId, params.schoolId),
        eq(studentAttendance.classId, enrollment.classId),
        eq(studentAttendance.date, params.sessionDate),
        eq(studentAttendance.classSessionId, params.sessionId),
      ]

      const statusCounts = await tx
        .select({
          status: studentAttendance.status,
          count: count(),
        })
        .from(studentAttendance)
        .where(and(...sessionConditions))
        .groupBy(studentAttendance.status)

      const presentCount = statusCounts.find(c => c.status === 'present')?.count || 0
      const absentCount = statusCounts.find(c => c.status === 'absent')?.count || 0

      await tx
        .update(classSessions)
        .set({
          studentsPresent: Number(presentCount),
          studentsAbsent: Number(absentCount),
          updatedAt: new Date(),
        })
        .where(eq(classSessions.id, params.sessionId))

      return { attendance, isNew: true }
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to save student attendance'),
  )
    .andThen((result) => {
      if (!result)
        return err(new DatabaseError('NOT_FOUND', getNestedErrorMessage('enrollments', 'notFound')))
      if (result === 'FAILED_INSERT')
        return err(new DatabaseError('INTERNAL_ERROR', getNestedErrorMessage('attendance', 'createFailed')))
      return ok(result)
    })
    .mapErr(tapLogErr(databaseLogger, params))
}

/**
 * Bulk save attendance for multiple students
 */
export function bulkSaveAttendance(params: {
  schoolId: string
  classId: string
  sessionId: string
  sessionDate: string
  teacherId: string
  attendanceRecords: Array<{
    enrollmentId: string
    status: 'present' | 'absent' | 'late' | 'excused'
    notes?: string
  }>
}): ResultAsync<{ success: true, count: number }, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      // Get all enrollments at once for student IDs
      const enrollmentIds = params.attendanceRecords.map(r => r.enrollmentId)
      const enrollmentData = await tx
        .select({
          id: enrollments.id,
          studentId: enrollments.studentId,
        })
        .from(enrollments)
        .innerJoin(students, eq(enrollments.studentId, students.id))
        .where(and(
          inArray(enrollments.id, enrollmentIds),
          eq(students.schoolId, params.schoolId),
        ))

      const enrollmentMap = new Map<string, typeof enrollmentData[number]>(
        enrollmentData.map(e => [e.id, e]),
      )

      for (const record of params.attendanceRecords) {
        const e = enrollmentMap.get(record.enrollmentId)
        if (!e)
          continue

        await tx
          .insert(studentAttendance)
          .values({
            id: crypto.randomUUID(),
            schoolId: params.schoolId,
            studentId: e.studentId,
            classId: params.classId,
            classSessionId: params.sessionId,
            date: params.sessionDate,
            status: record.status,
            reason: record.notes ?? null,
            recordedBy: params.teacherId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [
              studentAttendance.studentId,
              studentAttendance.date,
              studentAttendance.classId,
              studentAttendance.classSessionId,
            ],
            set: {
              status: record.status,
              reason: record.notes ?? null,
              updatedAt: new Date(),
            },
          })
      }

      const presentCount = params.attendanceRecords.filter(
        r => r.status === 'present',
      ).length
      const absentCount = params.attendanceRecords.filter(
        r => r.status === 'absent',
      ).length

      await tx
        .update(classSessions)
        .set({
          studentsPresent: presentCount,
          studentsAbsent: absentCount,
          updatedAt: new Date(),
        })
        .where(eq(classSessions.id, params.sessionId))

      return { success: true as const, count: params.attendanceRecords.length }
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to bulk save attendance'),
  ).mapErr(tapLogErr(databaseLogger, params))
}

/**
 * Get attendance rates for students in a class
 */
export function getClassAttendanceRates(params: {
  schoolId: string
  classId: string
  startDate?: string
  endDate?: string
}): ResultAsync<Array<{
  studentId: string
  studentName: string
  studentMatricule: string | null
  photoUrl: string | null
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  excusedDays: number
  attendanceRate: number
}>, DatabaseError> {
  const db = getDb()

  const conditions = [
    eq(studentAttendance.schoolId, params.schoolId),
    eq(studentAttendance.classId, params.classId),
  ]
  if (params.startDate)
    conditions.push(gte(studentAttendance.date, params.startDate))
  if (params.endDate)
    conditions.push(lte(studentAttendance.date, params.endDate))

  return ResultAsync.fromPromise(
    db
      .select({
        studentId: studentAttendance.studentId,
        studentName: sql<string>`${students.firstName} || ' ' || ${students.lastName}`,
        studentMatricule: students.matricule,
        photoUrl: students.photoUrl,
        totalDays: count(studentAttendance.date),
        presentDays: count(
          sql`CASE WHEN ${studentAttendance.status} = 'present' THEN 1 END`,
        ),
        absentDays: count(
          sql`CASE WHEN ${studentAttendance.status} = 'absent' THEN 1 END`,
        ),
        lateDays: count(
          sql`CASE WHEN ${studentAttendance.status} = 'late' THEN 1 END`,
        ),
        excusedDays: count(
          sql`CASE WHEN ${studentAttendance.status} = 'excused' THEN 1 END`,
        ),
      })
      .from(studentAttendance)
      .innerJoin(students, eq(studentAttendance.studentId, students.id))
      .where(and(...conditions))
      .groupBy(
        studentAttendance.studentId,
        students.firstName,
        students.lastName,
        students.matricule,
        students.photoUrl,
      )
      .orderBy(asc(students.lastName), asc(students.firstName))
      .then(results => results.map(r => ({
        ...r,
        attendanceRate:
          r.totalDays > 0
            ? Number.parseFloat(((Number(r.presentDays) / Number(r.totalDays)) * 100).toFixed(1))
            : 0,
      }))),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch class attendance rates'),
  ).mapErr(tapLogErr(databaseLogger, params))
}

/**
 * Get attendance statistics for a class
 */
export function getClassAttendanceStats(params: {
  schoolId: string
  classId: string
  startDate?: string
  endDate?: string
}): ResultAsync<{
  totalRecords: number
  uniqueDates: number
  present: number
  absent: number
  late: number
  excused: number
}, DatabaseError> {
  const db = getDb()

  const conditions = [
    eq(studentAttendance.schoolId, params.schoolId),
    eq(studentAttendance.classId, params.classId),
  ]
  if (params.startDate)
    conditions.push(gte(studentAttendance.date, params.startDate))
  if (params.endDate)
    conditions.push(lte(studentAttendance.date, params.endDate))

  return ResultAsync.fromPromise((async () => {
    const [totalStats, statusBreakdown] = await Promise.all([
      db
        .select({
          totalRecords: count(),
          uniqueDates: count(sql`DISTINCT ${studentAttendance.date}`),
        })
        .from(studentAttendance)
        .where(and(...conditions))
        .then(res => res[0] ?? { totalRecords: 0, uniqueDates: 0 }),
      db
        .select({
          status: studentAttendance.status,
          count: count(),
        })
        .from(studentAttendance)
        .where(and(...conditions))
        .groupBy(studentAttendance.status),
    ])

    const statusMap: Record<string, number> = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    }

    for (const row of statusBreakdown) {
      if (row.status && row.status in statusMap) {
        statusMap[row.status as keyof typeof statusMap] = Number(row.count)
      }
    }

    const result = {
      totalRecords: Number(totalStats.totalRecords),
      uniqueDates: Number(totalStats.uniqueDates),
      present: statusMap.present,
      absent: statusMap.absent,
      late: statusMap.late,
      excused: statusMap.excused,
    }

    return result as {
      totalRecords: number
      uniqueDates: number
      present: number
      absent: number
      late: number
      excused: number
    }
  })(), err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch class attendance stats')).mapErr(tapLogErr(databaseLogger, params))
}

/**
 * Get student attendance history (paginated)
 */
export function getStudentAttendanceHistory(params: {
  schoolId: string
  studentId: string
  classId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
  limit?: number
  offset?: number
}): ResultAsync<{
  records: Array<{
    id: string
    date: string
    className: string
    status: 'present' | 'absent' | 'late' | 'excused' | null
    notes: string | null
    recordedAt: Date | null
  }>
  total: number
  page: number
  pageSize: number
}, DatabaseError> {
  const db = getDb()
  const limit = params.limit ?? params.pageSize ?? 20
  const offset = params.offset ?? ((params.page ?? 1) - 1) * limit

  const conditions = [
    eq(studentAttendance.schoolId, params.schoolId),
    eq(studentAttendance.studentId, params.studentId),
  ]
  if (params.classId)
    conditions.push(eq(studentAttendance.classId, params.classId))
  if (params.startDate)
    conditions.push(gte(studentAttendance.date, params.startDate))
  if (params.endDate)
    conditions.push(lte(studentAttendance.date, params.endDate))

  return ResultAsync.fromPromise(
    Promise.all([
      db
        .select({
          id: studentAttendance.id,
          date: studentAttendance.date,
          className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
          status: studentAttendance.status,
          notes: studentAttendance.reason,
          recordedAt: studentAttendance.createdAt,
        })
        .from(studentAttendance)
        .innerJoin(classes, eq(studentAttendance.classId, classes.id))
        .innerJoin(grades, eq(classes.gradeId, grades.id))
        .where(and(...conditions))
        .orderBy(desc(studentAttendance.date))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(studentAttendance)
        .where(and(...conditions)),
    ]).then(([records, countResult]) => ({
      records,
      total: countResult[0]?.count ?? 0,
      page: params.page ?? Math.floor(offset / limit) + 1,
      pageSize: limit,
    })),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch student attendance history'),
  ).mapErr(tapLogErr(databaseLogger, params))
}

/**
 * Get student attendance trend
 */
export function getStudentAttendanceTrend(params: {
  schoolId: string
  studentId: string
  months?: number
}): ResultAsync<Array<{
  status: 'present' | 'absent' | 'late' | 'excused' | null
  count: number
}>, DatabaseError> {
  const db = getDb()
  const months = params.months ?? 6

  return ResultAsync.fromPromise(
    db
      .select({
        status: studentAttendance.status,
        count: count(),
      })
      .from(studentAttendance)
      .where(
        and(
          eq(studentAttendance.schoolId, params.schoolId),
          eq(studentAttendance.studentId, params.studentId),
          // Simplified date range for trend
          sql`${studentAttendance.date} >= date('now', '-${sql.raw(months.toString())} month')`,
        ),
      )
      .groupBy(studentAttendance.status)
      .then(rows => rows.map(r => ({
        status: r.status,
        count: Number(r.count),
      }))),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch student attendance trend'),
  ).mapErr(tapLogErr(databaseLogger, params))
}
