/**
 * Student Attendance Queries for Teacher App
 * Queries for student attendance tracking
 */
import { and, asc, count, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { getDb } from '../database/setup'
import { grades } from '../drizzle/core-schema'
import {
  classes,
  classSessions,
  enrollments,
  studentAttendance,
  students,
} from '../drizzle/school-schema'

export async function getClassRosterForAttendance(params: {
  classId: string
  schoolYearId: string
  date: string
  classSessionId?: string
}) {
  const db = getDb()

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
        eq(enrollments.classId, params.classId),
        eq(enrollments.schoolYearId, params.schoolYearId),
        eq(enrollments.status, 'confirmed'),
      ),
    )
    .orderBy(asc(students.lastName), asc(students.firstName))

  // Get existing attendance records for these students on this date/session
  const attendanceConditions = [
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

  const attendanceMap = new Map(
    existingAttendance.map(a => [a.studentId, a]),
  )

  return classRoster.map(student => ({
    ...student,
    attendance: attendanceMap.get(student.studentId) ?? null,
  }))
}

/**
 * Get or create an attendance session
 */
export async function getOrCreateAttendanceSession(params: {
  classId: string
  subjectId: string
  teacherId: string
  date: string
  startTime: string
  endTime: string
  timetableSessionId?: string
}) {
  const db = getDb()

  // Try to find existing session
  const existing = await db
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

  if (existing[0]) {
    return { session: existing[0], isNew: false }
  }

  // Create new session
  const [session] = await db
    .insert(classSessions)
    .values({
      id: nanoid(),
      classId: params.classId,
      subjectId: params.subjectId,
      teacherId: params.teacherId,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
      timetableSessionId: params.timetableSessionId ?? null,
      status: 'scheduled',
    })
    .returning()

  if (!session)
    throw new Error('Failed to create session')

  return { session, isNew: true }
}

/**
 * Save individual student attendance
 */
export async function saveStudentAttendance(params: {
  enrollmentId: string
  sessionId: string
  sessionDate: string
  status: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
  teacherId: string
}) {
  const db = getDb()

  // Find enrollment to get student and class info
  const [enrollment] = await db
    .select({
      studentId: enrollments.studentId,
      classId: enrollments.classId,
      schoolId: students.schoolId,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .where(eq(enrollments.id, params.enrollmentId))
    .limit(1)

  if (!enrollment)
    throw new Error('Enrollment not found')

  const [attendance] = await db
    .insert(studentAttendance)
    .values({
      id: nanoid(),
      schoolId: enrollment.schoolId,
      studentId: enrollment.studentId,
      classId: enrollment.classId,
      classSessionId: params.sessionId,
      date: params.sessionDate,
      status: params.status,
      reason: params.notes ?? null,
      recordedBy: params.teacherId,
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

  // Update session counters
  const sessionStats = await getClassAttendanceStats({
    classId: enrollment.classId,
    startDate: params.sessionDate,
    endDate: params.sessionDate,
  })

  await db
    .update(classSessions)
    .set({
      studentsPresent: sessionStats.present,
      studentsAbsent: sessionStats.absent,
    })
    .where(eq(classSessions.id, params.sessionId))

  return { attendance, isNew: !!attendance }
}

/**
 * Bulk save attendance for multiple students
 */
export async function bulkSaveAttendance(params: {
  classId: string
  sessionId: string
  sessionDate: string
  teacherId: string
  attendanceRecords: Array<{
    enrollmentId: string
    status: 'present' | 'absent' | 'late' | 'excused'
    notes?: string
  }>
}) {
  const db = getDb()

  return db.transaction(async (tx) => {
    // Get all enrollments at once for student IDs
    const enrollmentIds = params.attendanceRecords.map(r => r.enrollmentId)
    const enrollmentData = await tx
      .select({
        id: enrollments.id,
        studentId: enrollments.studentId,
        schoolId: students.schoolId,
      })
      .from(enrollments)
      .innerJoin(students, eq(enrollments.studentId, students.id))
      .where(inArray(enrollments.id, enrollmentIds))

    const enrollmentMap = new Map(enrollmentData.map(e => [e.id, e]))

    for (const record of params.attendanceRecords) {
      const e = enrollmentMap.get(record.enrollmentId)
      if (!e)
        continue

      await tx
        .insert(studentAttendance)
        .values({
          id: nanoid(),
          schoolId: e.schoolId,
          studentId: e.studentId,
          classId: params.classId,
          classSessionId: params.sessionId,
          date: params.sessionDate,
          status: record.status,
          reason: record.notes ?? null,
          recordedBy: params.teacherId,
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
      })
      .where(eq(classSessions.id, params.sessionId))

    return { success: true, count: params.attendanceRecords.length }
  })
}

/**
 * Get attendance rates for students in a class
 */
export async function getClassAttendanceRates(params: {
  classId: string
  startDate?: string
  endDate?: string
}) {
  const db = getDb()

  const conditions = [eq(studentAttendance.classId, params.classId)]
  if (params.startDate)
    conditions.push(gte(studentAttendance.date, params.startDate))
  if (params.endDate)
    conditions.push(lte(studentAttendance.date, params.endDate))

  const results = await db
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

  return results.map((r: any) => ({
    ...r,
    attendanceRate:
      r.totalDays > 0
        ? Number.parseFloat(((r.presentDays / r.totalDays) * 100).toFixed(1))
        : 0,
  }))
}

/**
 * Get attendance statistics for a class
 */
export async function getClassAttendanceStats(params: {
  classId: string
  schoolYearId?: string
  startDate?: string
  endDate?: string
}) {
  const db = getDb()

  const conditions = [eq(studentAttendance.classId, params.classId)]
  if (params.startDate)
    conditions.push(gte(studentAttendance.date, params.startDate))
  if (params.endDate)
    conditions.push(lte(studentAttendance.date, params.endDate))

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
    statusMap[row.status!] = Number(row.count)
  }

  return {
    ...totalStats,
    ...(statusMap as {
      present: number
      absent: number
      late: number
      excused: number
    }),
  }
}

/**
 * Get student attendance history (paginated)
 */
export async function getStudentAttendanceHistory(params: {
  studentId: string
  classId?: string
  schoolYearId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
  limit?: number
  offset?: number
}) {
  const db = getDb()
  const limit = params.limit ?? params.pageSize ?? 20
  const offset = params.offset ?? ((params.page ?? 1) - 1) * limit

  const conditions = [eq(studentAttendance.studentId, params.studentId)]
  if (params.classId)
    conditions.push(eq(studentAttendance.classId, params.classId))
  if (params.startDate)
    conditions.push(gte(studentAttendance.date, params.startDate))
  if (params.endDate)
    conditions.push(lte(studentAttendance.date, params.endDate))

  const [records, countResult] = await Promise.all([
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
  ])

  return {
    records,
    total: countResult[0]?.count ?? 0,
    page: params.page ?? Math.floor(offset / limit) + 1,
    pageSize: limit,
  }
}

/**
 * Get student attendance trend
 */
export async function getStudentAttendanceTrend(params: {
  studentId: string
  schoolYearId: string
  months?: number
}) {
  const db = getDb()
  const months = params.months ?? 6

  // Simple implementation: count by status
  const trend = await db
    .select({
      status: studentAttendance.status,
      count: count(),
    })
    .from(studentAttendance)
    .where(
      and(
        eq(studentAttendance.studentId, params.studentId),
        // Simplified date range for trend
        sql`${studentAttendance.date} >= date('now', '-${sql.raw(months.toString())} month')`,
      ),
    )
    .groupBy(studentAttendance.status)

  return trend
}
