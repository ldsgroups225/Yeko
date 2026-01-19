/**
 * Student Attendance Queries
 * Handles student attendance tracking during class sessions
 */
import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { getDb } from '../database/setup'
import { grades, subjects } from '../drizzle/core-schema'
import {
  classes,
  classSessions,
  enrollments,
  studentAttendance,
  students,
} from '../drizzle/school-schema'

export interface StudentAttendanceRecord {
  id: string
  studentId: string
  studentFirstName: string
  studentLastName: string
  studentMatricule: string | null
  studentPhotoUrl: string | null
  status: 'present' | 'absent' | 'late' | 'excused'
  sessionId: string
  recordedAt: Date
  notes: string | null
}

export interface ClassAttendanceSummary {
  classId: string
  className: string
  totalEnrolled: number
  present: number
  absent: number
  late: number
  excused: number
  attendanceRate: number
}

// Get students enrolled in a class for attendance taking
export async function getClassRosterForAttendance(params: {
  classId: string
  schoolYearId: string
  date: string
}) {
  const db = getDb()

  const results = await db
    .select({
      studentId: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      matricule: students.matricule,
      photoUrl: students.photoUrl,
      enrollmentId: enrollments.id,
      existingAttendanceId: studentAttendance.id,
      existingStatus: studentAttendance.status,
      existingNotes: studentAttendance.notes,
      existingRecordedAt: studentAttendance.recordedAt,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .leftJoin(
      studentAttendance,
      and(
        eq(studentAttendance.enrollmentId, enrollments.id),
        eq(studentAttendance.sessionDate, params.date)
      )
    )
    .where(
      and(
        eq(enrollments.classId, params.classId),
        eq(enrollments.schoolYearId, params.schoolYearId),
        eq(enrollments.status, 'confirmed')
      )
    )
    .orderBy(asc(students.lastName), asc(students.firstName))

  return results.map((r) => ({
    studentId: r.studentId,
    firstName: r.firstName,
    lastName: r.lastName,
    matricule: r.matricule,
    photoUrl: r.photoUrl,
    enrollmentId: r.enrollmentId,
    attendance: r.existingAttendanceId
      ? {
          id: r.existingAttendanceId,
          status: r.existingStatus as 'present' | 'absent' | 'late' | 'excused',
          notes: r.existingNotes,
          recordedAt: r.existingRecordedAt,
        }
      : null,
  }))
}

// Get or create session for attendance
export async function getOrCreateAttendanceSession(params: {
  classId: string
  subjectId: string
  teacherId: string
  date: string
  startTime: string
  endTime: string
}) {
  const db = getDb()

  // Check if session already exists
  const [existingSession] = await db
    .select()
    .from(classSessions)
    .where(
      and(
        eq(classSessions.classId, params.classId),
        eq(classSessions.subjectId, params.subjectId),
        eq(classSessions.date, params.date)
      )
    )
    .limit(1)

  if (existingSession) {
    return { session: existingSession, isNew: false }
  }

  // Create new session
  const [newSession] = await db
    .insert(classSessions)
    .values({
      id: nanoid(),
      classId: params.classId,
      subjectId: params.subjectId,
      teacherId: params.teacherId,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
      status: 'scheduled',
    })
    .returning()

  return { session: newSession, isNew: true }
}

// Save individual student attendance
export async function saveStudentAttendance(params: {
  enrollmentId: string
  sessionId: string
  sessionDate: string
  status: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
  teacherId: string
}) {
  const db = getDb()

  // Check if attendance already exists
  const [existing] = await db
    .select()
    .from(studentAttendance)
    .where(
      and(
        eq(studentAttendance.enrollmentId, params.enrollmentId),
        eq(studentAttendance.sessionDate, params.sessionDate)
      )
    )
    .limit(1)

  if (existing) {
    // Update existing attendance
    const [updated] = await db
      .update(studentAttendance)
      .set({
        status: params.status,
        notes: params.notes,
        recordedAt: new Date(),
        recordedBy: params.teacherId,
      })
      .where(eq(studentAttendance.id, existing.id))
      .returning()

    return { attendance: updated, isNew: false }
  }

  // Create new attendance record
  const [newAttendance] = await db
    .insert(studentAttendance)
    .values({
      id: nanoid(),
      enrollmentId: params.enrollmentId,
      sessionId: params.sessionId,
      sessionDate: params.sessionDate,
      status: params.status,
      notes: params.notes,
      recordedAt: new Date(),
      recordedBy: params.teacherId,
    })
    .returning()

  return { attendance: newAttendance, isNew: true }
}

// Bulk save attendance for multiple students
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

  const results = await Promise.all(
    params.attendanceRecords.map(async (record) => {
      return saveStudentAttendance({
        enrollmentId: record.enrollmentId,
        sessionId: params.sessionId,
        sessionDate: params.sessionDate,
        status: record.status,
        notes: record.notes,
        teacherId: params.teacherId,
      })
    })
  )

  const newCount = results.filter((r) => r.isNew).length
  const updatedCount = results.filter((r) => !r.isNew).length

  return {
    total: results.length,
    new: newCount,
    updated: updatedCount,
    attendances: results.map((r) => r.attendance),
  }
}

// Get attendance history for a student
export async function getStudentAttendanceHistory(params: {
  studentId: string
  classId?: string
  schoolYearId: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}) {
  const db = getDb()

  const conditions = [eq(enrollments.studentId, params.studentId)]

  if (params.classId) {
    conditions.push(eq(enrollments.classId, params.classId))
  }

  conditions.push(eq(enrollments.schoolYearId, params.schoolYearId))

  if (params.startDate) {
    conditions.push(gte(studentAttendance.sessionDate, params.startDate))
  }

  if (params.endDate) {
    conditions.push(lte(studentAttendance.sessionDate, params.endDate))
  }

  const results = await db
    .select({
      id: studentAttendance.id,
      date: studentAttendance.sessionDate,
      status: studentAttendance.status,
      notes: studentAttendance.notes,
      recordedAt: studentAttendance.recordedAt,
      className: classes.name,
      subjectName: subjects.name,
    })
    .from(studentAttendance)
    .innerJoin(enrollments, eq(studentAttendance.enrollmentId, enrollments.id))
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .leftJoin(classSessions, eq(studentAttendance.sessionId, classSessions.id))
    .leftJoin(subjects, eq(classSessions.subjectId, subjects.id))
    .where(and(...conditions))
    .orderBy(desc(studentAttendance.sessionDate))
    .limit(params.limit ?? 50)
    .offset(params.offset ?? 0)

  return results
}

// Get attendance statistics for a class
export async function getClassAttendanceStats(params: {
  classId: string
  schoolYearId: string
  startDate?: string
  endDate?: string
}): Promise<ClassAttendanceSummary> {
  const db = getDb()

  const conditions = [
    eq(enrollments.classId, params.classId),
    eq(enrollments.schoolYearId, params.schoolYearId),
    eq(enrollments.status, 'confirmed'),
  ]

  if (params.startDate) {
    conditions.push(gte(studentAttendance.sessionDate, params.startDate))
  }

  if (params.endDate) {
    conditions.push(lte(studentAttendance.sessionDate, params.endDate))
  }

  const stats = await db
    .select({
      totalEnrolled: sql<number>`count(distinct ${enrollments.studentId})::int`,
      present: sql<number>`count(*) filter (where ${studentAttendance.status} = 'present')::int`,
      absent: sql<number>`count(*) filter (where ${studentAttendance.status} = 'absent')::int`,
      late: sql<number>`count(*) filter (where ${studentAttendance.status} = 'late')::int`,
      excused: sql<number>`count(*) filter (where ${studentAttendance.status} = 'excused')::int`,
    })
    .from(enrollments)
    .leftJoin(
      studentAttendance,
      and(
        eq(studentAttendance.enrollmentId, enrollments.id),
        params.startDate ? gte(studentAttendance.sessionDate, params.startDate) : undefined,
        params.endDate ? lte(studentAttendance.sessionDate, params.endDate) : undefined
      )
    )
    .where(and(...conditions))

  const s = stats[0] || {
    totalEnrolled: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
  }

  const totalRecorded = Number(s.present) + Number(s.absent) + Number(s.late) + Number(s.excused)
  const attendanceRate = totalRecorded > 0 ? (Number(s.present) / totalRecorded) * 100 : 0

  // Get class name
  const [classResult] = await db
    .select({ name: classes.name })
    .from(classes)
    .where(eq(classes.id, params.classId))
    .limit(1)

  return {
    classId: params.classId,
    className: classResult?.name || 'Unknown Class',
    totalEnrolled: Number(s.totalEnrolled),
    present: Number(s.present),
    absent: Number(s.absent),
    late: Number(s.late),
    excused: Number(s.excused),
    attendanceRate: Math.round(attendanceRate * 100) / 100,
  }
}

// Get attendance rate trend for a student
export async function getStudentAttendanceTrend(params: {
  studentId: string
  schoolYearId: string
  months: number
}) {
  const db = getDb()

  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - params.months)

  const results = await db
    .select({
      month: sql<string>`to_char(${studentAttendance.sessionDate}, 'YYYY-MM')`,
      present: sql<number>`count(*) filter (where ${studentAttendance.status} = 'present')::int`,
      total: sql<number>`count(*)::int`,
    })
    .from(studentAttendance)
    .innerJoin(enrollments, eq(studentAttendance.enrollmentId, enrollments.id))
    .where(
      and(
        eq(enrollments.studentId, params.studentId),
        eq(enrollments.schoolYearId, params.schoolYearId),
        gte(studentAttendance.sessionDate, startDate.toISOString())
      )
    )
    .groupBy(sql`to_char(${studentAttendance.sessionDate}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${studentAttendance.sessionDate}, 'YYYY-MM')`)

  return results.map((r) => ({
    month: r.month,
    present: Number(r.present),
    total: Number(r.total),
    rate: Number(r.total) > 0 ? Math.round((Number(r.present) / Number(r.total)) * 10000) / 100 : 0,
  }))
}
