import type { StudentAttendance } from '../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'

/**
 * Student Attendance Queries for School App
 * Core attendance functions for student tracking
 */
import { and, asc, count, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { grades, schools } from '../drizzle/core-schema'
import {
  classes,
  parents,
  studentAttendance,
  studentParents,
  students,
} from '../drizzle/school-schema'
import { DatabaseError } from '../errors'

/**
 * Get class attendance for a specific date
 */
export function getClassAttendance(params: {
  classId: string
  date: string
  classSessionId?: string
}): R.ResultAsync<Array<{
  id: string
  studentId: string
  studentName: string
  studentMatricule: string | null
  photoUrl: string | null
  status: 'present' | 'absent' | 'late' | 'excused'
  reason: string | null
  recordedAt: Date
}>, DatabaseError> {
  const db = getDb()
  const conditions = [
    eq(studentAttendance.classId, params.classId),
    eq(studentAttendance.date, params.date),
  ]
  if (params.classSessionId) {
    conditions.push(
      eq(studentAttendance.classSessionId, params.classSessionId),
    )
  }

  return R.pipe(
    R.try({
      try: async () => {
        return await db
          .select({
            id: studentAttendance.id,
            studentId: studentAttendance.studentId,
            studentName: sql<string>`${students.firstName} || ' ' || ${students.lastName}`,
            studentMatricule: students.matricule,
            photoUrl: students.photoUrl,
            status: studentAttendance.status,
            reason: studentAttendance.reason,
            recordedAt: studentAttendance.createdAt,
          })
          .from(studentAttendance)
          .innerJoin(students, eq(studentAttendance.studentId, students.id))
          .where(and(...conditions))
          .orderBy(asc(students.lastName), asc(students.firstName))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch class attendance'),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Get notification details for an attendance record
 */
export async function getAttendanceNotificationDetails(attendanceId: string, schoolId: string): R.ResultAsync<{
  studentName: string
  date: string
  status: string
  schoolName: string
  parents: Array<{
    name: string
    email: string | null
    phone: string
  }>
}, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const results = await db
          .select({
            studentFirstName: students.firstName,
            studentLastName: students.lastName,
            date: studentAttendance.date,
            status: studentAttendance.status,
            schoolName: schools.name,
            parentFirstName: parents.firstName,
            parentLastName: parents.lastName,
            parentEmail: parents.email,
            parentPhone: parents.phone,
          })
          .from(studentAttendance)
          .innerJoin(students, eq(studentAttendance.studentId, students.id))
          .innerJoin(schools, eq(studentAttendance.schoolId, schools.id))
          .innerJoin(studentParents, eq(students.id, studentParents.studentId))
          .innerJoin(parents, eq(studentParents.parentId, parents.id))
          .where(and(
            eq(studentAttendance.id, attendanceId),
            eq(studentAttendance.schoolId, schoolId),
            eq(studentParents.receiveNotifications, true),
          ))

        if (results.length === 0) {
          // If no parents to notify, we still want student and school info
          const basicInfo = await db
            .select({
              studentFirstName: students.firstName,
              studentLastName: students.lastName,
              date: studentAttendance.date,
              status: studentAttendance.status,
              schoolName: schools.name,
            })
            .from(studentAttendance)
            .innerJoin(students, eq(studentAttendance.studentId, students.id))
            .innerJoin(schools, eq(studentAttendance.schoolId, schools.id))
            .where(and(
              eq(studentAttendance.id, attendanceId),
              eq(studentAttendance.schoolId, schoolId),
            ))
            .limit(1)

          if (basicInfo.length === 0)
            throw new Error('Attendance record not found')

          return {
            studentName: `${basicInfo[0]!.studentFirstName} ${basicInfo[0]!.studentLastName}`,
            date: basicInfo[0]!.date,
            status: basicInfo[0]!.status,
            schoolName: basicInfo[0]!.schoolName,
            parents: [],
          }
        }

        return {
          studentName: `${results[0]!.studentFirstName} ${results[0]!.studentLastName}`,
          date: results[0]!.date,
          status: results[0]!.status,
          schoolName: results[0]!.schoolName,
          parents: results.map(r => ({
            name: `${r.parentFirstName} ${r.parentLastName}`,
            email: r.parentEmail,
            phone: r.parentPhone,
          })),
        }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch attendance notification details'),
    }),
    R.mapError(tapLogErr(databaseLogger, { attendanceId, schoolId })),
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
