/* eslint-disable max-lines */
import type { StudentAttendance } from '../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'

/**
 * Student Attendance Queries for School App
 * Core attendance functions for student tracking
 */
import { and, asc, count, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { grades } from '../drizzle/core-schema'
import { classes, enrollments, studentAttendance, students } from '../drizzle/school-schema'
import { DatabaseError } from '../errors'

/**
 * Get class attendance for a specific date
 */
export function getClassAttendance(params: {
  schoolId: string
  schoolYearId: string
  classId: string
  date: string
  classSessionId?: string
}): R.ResultAsync<Array<{
  studentId: string
  studentName: string
  studentMatricule: string | null
  photoUrl: string | null
  attendance: {
    id: string
    status: 'present' | 'absent' | 'late' | 'excused'
    reason: string | null
    recordedAt: Date
  } | null
}>, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        const roster = await db
          .select({
            studentId: students.id,
            studentName: sql<string>`${students.firstName} || ' ' || ${students.lastName}`,
            studentMatricule: students.matricule,
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

        const attendanceConditions = [
          eq(studentAttendance.schoolId, params.schoolId),
          eq(studentAttendance.classId, params.classId),
          eq(studentAttendance.date, params.date),
        ]
        if (params.classSessionId) {
          attendanceConditions.push(eq(studentAttendance.classSessionId, params.classSessionId))
        }

        const existingAttendance = await db
          .select({
            id: studentAttendance.id,
            studentId: studentAttendance.studentId,
            status: studentAttendance.status,
            reason: studentAttendance.reason,
            recordedAt: studentAttendance.createdAt,
          })
          .from(studentAttendance)
          .where(and(...attendanceConditions))

        const attendanceMap = new Map<string, typeof existingAttendance[number]>(
          existingAttendance.map(a => [a.studentId, a]),
        )

        return roster.map(student => ({
          studentId: student.studentId,
          studentName: student.studentName,
          studentMatricule: student.studentMatricule,
          photoUrl: student.photoUrl,
          attendance: attendanceMap.get(student.studentId) ?? null,
        }))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch class attendance roster'),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Get latest attendance snapshot and cumulative counts for a set of students.
 */
export function getStudentsAttendanceSnapshot(params: {
  schoolId: string
  studentIds: string[]
  classId?: string
}): R.ResultAsync<Array<{
  studentId: string
  latestStatus: 'present' | 'absent' | 'late' | 'excused' | null
  latestDate: string | null
  absentCount: number
  lateCount: number
  excusedCount: number
  presentCount: number
}>, DatabaseError> {
  const db = getDb()

  if (params.studentIds.length === 0) {
    return R.succeed(Promise.resolve([]))
  }

  const conditions = [
    eq(studentAttendance.schoolId, params.schoolId),
    inArray(studentAttendance.studentId, params.studentIds),
  ]

  if (params.classId) {
    conditions.push(eq(studentAttendance.classId, params.classId))
  }

  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .select({
            studentId: studentAttendance.studentId,
            status: studentAttendance.status,
            date: studentAttendance.date,
            createdAt: studentAttendance.createdAt,
          })
          .from(studentAttendance)
          .where(and(...conditions))
          .orderBy(
            asc(studentAttendance.studentId),
            desc(studentAttendance.date),
            desc(studentAttendance.createdAt),
          )

        const snapshots = new Map<string, {
          studentId: string
          latestStatus: 'present' | 'absent' | 'late' | 'excused' | null
          latestDate: string | null
          absentCount: number
          lateCount: number
          excusedCount: number
          presentCount: number
        }>()

        for (const studentId of params.studentIds) {
          snapshots.set(studentId, {
            studentId,
            latestStatus: null,
            latestDate: null,
            absentCount: 0,
            lateCount: 0,
            excusedCount: 0,
            presentCount: 0,
          })
        }

        for (const row of rows) {
          const current = snapshots.get(row.studentId)
          if (!current) {
            continue
          }

          if (!current.latestStatus) {
            current.latestStatus = row.status
            current.latestDate = row.date
          }

          if (row.status === 'absent')
            current.absentCount += 1
          else if (row.status === 'late')
            current.lateCount += 1
          else if (row.status === 'excused')
            current.excusedCount += 1
          else if (row.status === 'present')
            current.presentCount += 1
        }

        return params.studentIds
          .map(studentId => snapshots.get(studentId))
          .filter((snapshot): snapshot is NonNullable<typeof snapshot> => Boolean(snapshot))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch students attendance snapshot'),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Upsert (create or update) student attendance record
 */
export function upsertStudentAttendance(params: {
  id?: string
  studentId: string
  classId: string
  schoolId: string
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  reason?: string
  classSessionId?: string
  recordedBy: string
  lateThresholdMinutes?: number
}): R.ResultAsync<StudentAttendance, DatabaseError> {
  const db = getDb()

  const record = {
    id: params.id ?? crypto.randomUUID(),
    schoolId: params.schoolId,
    studentId: params.studentId,
    classId: params.classId,
    classSessionId: params.classSessionId ?? null,
    date: params.date,
    status: params.status,
    reason: params.reason ?? null,
    recordedBy: params.recordedBy,
  }

  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .insert(studentAttendance)
          .values(record)
          .onConflictDoUpdate({
            target: [
              studentAttendance.studentId,
              studentAttendance.date,
              studentAttendance.classId,
              studentAttendance.classSessionId,
            ],
            set: {
              status: sql`excluded.status`,
              reason: sql`excluded.reason`,
              updatedAt: new Date(),
            },
          })
          .returning()
        return rows[0]!
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to upsert student attendance'),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Bulk upsert class attendance records
 */
export function bulkUpsertClassAttendance(params: {
  classId: string
  schoolId: string
  date: string
  classSessionId?: string
  recordedBy: string
  entries: Array<{
    studentId: string
    status: 'present' | 'absent' | 'late' | 'excused'
    reason?: string
  }>
}): R.ResultAsync<number, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        return await db.transaction(async (tx) => {
          const records = params.entries.map(entry => ({
            id: crypto.randomUUID(),
            schoolId: params.schoolId,
            studentId: entry.studentId,
            classId: params.classId,
            classSessionId: params.classSessionId ?? null,
            date: params.date,
            status: entry.status,
            reason: entry.reason ?? null,
            recordedBy: params.recordedBy,
          }))

          for (const record of records) {
            await tx
              .insert(studentAttendance)
              .values(record)
              .onConflictDoUpdate({
                target: [
                  studentAttendance.studentId,
                  studentAttendance.date,
                  studentAttendance.classId,
                  studentAttendance.classSessionId,
                ],
                set: {
                  status: sql`excluded.status`,
                  reason: sql`excluded.reason`,
                  updatedAt: new Date(),
                },
              })
          }
          return params.entries.length
        })
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to bulk upsert student attendance'),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId: params.schoolId, classId: params.classId, date: params.date })),
  )
}

/**
 * Get student attendance history
 */
export function getStudentAttendanceHistory(params: {
  studentId: string
  startDate?: string
  endDate?: string
  classId?: string
}): R.ResultAsync<Array<{
  id: string
  date: string
  className: string
  classId: string
  status: 'present' | 'absent' | 'late' | 'excused'
  reason: string | null
}>, DatabaseError> {
  const db = getDb()
  const conditions = [eq(studentAttendance.studentId, params.studentId)]

  if (params.startDate)
    conditions.push(gte(studentAttendance.date, params.startDate))
  if (params.endDate)
    conditions.push(lte(studentAttendance.date, params.endDate))
  if (params.classId)
    conditions.push(eq(studentAttendance.classId, params.classId))

  return R.pipe(
    R.try({
      try: async () => {
        return await db
          .select({
            id: studentAttendance.id,
            date: studentAttendance.date,
            className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
            classId: studentAttendance.classId,
            status: studentAttendance.status,
            reason: studentAttendance.reason,
          })
          .from(studentAttendance)
          .innerJoin(classes, eq(studentAttendance.classId, classes.id))
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .where(and(...conditions))
          .orderBy(desc(studentAttendance.date))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch student attendance history'),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Count student absences
 */
export function countStudentAbsences(params: {
  studentId: string
  startDate: string
  endDate: string
  excludeExcused?: boolean
}): R.ResultAsync<number, DatabaseError> {
  const db = getDb()
  const conditions = [
    eq(studentAttendance.studentId, params.studentId),
    gte(studentAttendance.date, params.startDate),
    lte(studentAttendance.date, params.endDate),
    eq(studentAttendance.status, 'absent'),
  ]

  if (params.excludeExcused) {
    conditions.push(eq(studentAttendance.status, 'absent'))
  }

  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .select({ count: sql<number>`count(*)` })
          .from(studentAttendance)
          .where(and(...conditions))
        return Number(rows[0]?.count ?? 0)
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to count student absences'),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Excuse a student absence
 */
export function excuseStudentAbsence(params: {
  attendanceId: string
  schoolId: string
  excusedBy: string
  reason?: string
}): R.ResultAsync<StudentAttendance, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .update(studentAttendance)
          .set({
            status: 'excused',
            reason: params.reason ?? null,
            excusedBy: params.excusedBy,
            updatedAt: new Date(),
          })
          .where(and(
            eq(studentAttendance.id, params.attendanceId),
            eq(studentAttendance.schoolId, params.schoolId),
          ))
          .returning()

        if (rows.length === 0)
          throw new Error('Attendance record not found')
        return rows[0]!
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to excuse student absence'),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Delete student attendance record
 */
export function deleteStudentAttendance(attendanceId: string, schoolId: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        await db
          .delete(studentAttendance)
          .where(and(
            eq(studentAttendance.id, attendanceId),
            eq(studentAttendance.schoolId, schoolId),
          ))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete student attendance'),
    }),
    R.mapError(tapLogErr(databaseLogger, { attendanceId, schoolId })),
  )
}

/**
 * Get attendance statistics for a class or school
 */
export async function getAttendanceStatistics(params: {
  schoolId: string
  startDate: string
  endDate: string
  classId?: string
}): R.ResultAsync<{
  totalRecords: number
  present: number
  absent: number
  late: number
  excused: number
  uniqueStudents: number
  uniqueDates: number
  attendanceRate: number
}, DatabaseError> {
  const db = getDb()
  const conditions = [
    eq(studentAttendance.schoolId, params.schoolId),
    gte(studentAttendance.date, params.startDate),
    lte(studentAttendance.date, params.endDate),
  ]

  if (params.classId) {
    conditions.push(eq(studentAttendance.classId, params.classId))
  }

  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .select({
            totalRecords: count(),
            present: sql<number>`count(*) filter (where ${studentAttendance.status} = 'present')`,
            absent: sql<number>`count(*) filter (where ${studentAttendance.status} = 'absent')`,
            late: sql<number>`count(*) filter (where ${studentAttendance.status} = 'late')`,
            excused: sql<number>`count(*) filter (where ${studentAttendance.status} = 'excused')`,
            uniqueStudents: sql<number>`count(distinct ${studentAttendance.studentId})`,
            uniqueDates: sql<number>`count(distinct ${studentAttendance.date})`,
          })
          .from(studentAttendance)
          .where(and(...conditions))

        const s = rows[0] ?? {
          totalRecords: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          uniqueStudents: 0,
          uniqueDates: 0,
        }

        const totalRecords = Number(s.totalRecords ?? 0)
        const present = Number(s.present ?? 0)

        return {
          totalRecords,
          present,
          absent: Number(s.absent ?? 0),
          late: Number(s.late ?? 0),
          excused: Number(s.excused ?? 0),
          uniqueStudents: Number(s.uniqueStudents ?? 0),
          uniqueDates: Number(s.uniqueDates ?? 0),
          attendanceRate: totalRecords ? Number(((present / totalRecords) * 100).toFixed(1)) : 0,
        }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch attendance statistics'),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Mark parent as notified for an attendance record
 */
export function markParentNotified(params: {
  attendanceId: string
  schoolId: string
  method: 'email' | 'sms' | 'in_app'
}): R.ResultAsync<StudentAttendance, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .update(studentAttendance)
          .set({
            parentNotified: true,
            notifiedAt: new Date(),
            notificationMethod: params.method,
            updatedAt: new Date(),
          })
          .where(and(
            eq(studentAttendance.id, params.attendanceId),
            eq(studentAttendance.schoolId, params.schoolId),
          ))
          .returning()

        if (rows.length === 0)
          throw new Error('Attendance record not found')
        return rows[0]!
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to mark parent as notified'),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}
