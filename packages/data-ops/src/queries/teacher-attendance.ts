import type { TeacherAttendance, TeacherAttendanceInsert, TeacherAttendanceStatus } from '../drizzle/school-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'

import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import {
  teacherAttendance,

  teachers,
  users,
} from '../drizzle/school-schema'
import { DatabaseError } from '../errors'

// Get daily teacher attendance for a school
export function getDailyTeacherAttendance(schoolId: string, date: string): ResultAsync<Array<{
  teacherId: string
  teacherName: string
  teacherEmail: string
  teacherAvatar: string | null
  specialization: string | null
  attendance: {
    id: string
    status: TeacherAttendanceStatus
    arrivalTime: string | null
    departureTime: string | null
    lateMinutes: number | null
    reason: string | null
    notes: string | null
  } | null
}>, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select({
        teacher: teachers,
        user: users,
        attendance: teacherAttendance,
      })
      .from(teachers)
      .leftJoin(users, eq(teachers.userId, users.id))
      .leftJoin(
        teacherAttendance,
        and(
          eq(teacherAttendance.teacherId, teachers.id),
          eq(teacherAttendance.date, date),
        ),
      )
      .where(
        and(
          eq(teachers.schoolId, schoolId),
          eq(teachers.status, 'active'),
        ),
      )
      .orderBy(users.name)
      .then(results => results.map(r => ({
        teacherId: r.teacher.id,
        teacherName: r.user?.name ?? 'Unknown',
        teacherEmail: r.user?.email ?? '',
        teacherAvatar: r.user?.avatarUrl ?? null,
        specialization: r.teacher.specialization,
        attendance: r.attendance
          ? {
              id: r.attendance.id,
              status: r.attendance.status as TeacherAttendanceStatus,
              arrivalTime: r.attendance.arrivalTime,
              departureTime: r.attendance.departureTime,
              lateMinutes: r.attendance.lateMinutes,
              reason: r.attendance.reason,
              notes: r.attendance.notes,
            }
          : null,
      }))),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch daily teacher attendance'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, date }))
}

// Get teacher attendance for a date range
export function getTeacherAttendanceRange(params: {
  schoolId: string
  startDate: string
  endDate: string
  teacherId?: string
  status?: TeacherAttendanceStatus
}): ResultAsync<Array<{
  attendance: TeacherAttendance
  teacherName: string | null
}>, DatabaseError> {
  const db = getDb()
  const conditions = [
    eq(teacherAttendance.schoolId, params.schoolId),
    gte(teacherAttendance.date, params.startDate),
    lte(teacherAttendance.date, params.endDate),
  ]

  if (params.teacherId) {
    conditions.push(eq(teacherAttendance.teacherId, params.teacherId))
  }
  if (params.status) {
    conditions.push(eq(teacherAttendance.status, params.status))
  }

  return ResultAsync.fromPromise(
    db
      .select({
        attendance: teacherAttendance,
        teacherName: users.name,
      })
      .from(teacherAttendance)
      .leftJoin(teachers, eq(teacherAttendance.teacherId, teachers.id))
      .leftJoin(users, eq(teachers.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(teacherAttendance.date)),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch teacher attendance range'),
  ).mapErr(tapLogErr(databaseLogger, params))
}

// Create or update teacher attendance (upsert)
export function upsertTeacherAttendance(data: {
  teacherId: string
  schoolId: string
  date: string
  status: TeacherAttendanceStatus
  arrivalTime?: string | null
  departureTime?: string | null
  reason?: string | null
  notes?: string | null
  recordedBy?: string | null
  expectedArrival?: string
}): ResultAsync<TeacherAttendance, DatabaseError> {
  const db = getDb()
  // Calculate late minutes if status is 'late' and arrival time is provided
  let lateMinutes: number | null = null
  if (data.status === 'late' && data.arrivalTime && data.expectedArrival) {
    const [expHour, expMin] = data.expectedArrival.split(':').map(Number)
    const [arrHour, arrMin] = data.arrivalTime.split(':').map(Number)
    const expectedMinutes = (expHour ?? 0) * 60 + (expMin ?? 0)
    const arrivalMinutes = (arrHour ?? 0) * 60 + (arrMin ?? 0)
    lateMinutes = Math.max(0, arrivalMinutes - expectedMinutes)
  }

  const insertData: TeacherAttendanceInsert = {
    id: crypto.randomUUID(),
    teacherId: data.teacherId,
    schoolId: data.schoolId,
    date: data.date,
    status: data.status,
    arrivalTime: data.arrivalTime,
    departureTime: data.departureTime,
    lateMinutes,
    reason: data.reason,
    notes: data.notes,
    recordedBy: data.recordedBy,
  }

  return ResultAsync.fromPromise(
    db
      .insert(teacherAttendance)
      .values(insertData)
      .onConflictDoUpdate({
        target: [teacherAttendance.teacherId, teacherAttendance.date],
        set: {
          status: data.status,
          arrivalTime: data.arrivalTime,
          departureTime: data.departureTime,
          lateMinutes,
          reason: data.reason,
          notes: data.notes,
          recordedBy: data.recordedBy,
          updatedAt: new Date(),
        },
      })
      .returning()
      .then(rows => rows[0]!),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to upsert teacher attendance'),
  ).mapErr(tapLogErr(databaseLogger, data))
}

// Bulk upsert teacher attendance
export function bulkUpsertTeacherAttendance(params: {
  schoolId: string
  date: string
  entries: Array<{
    teacherId: string
    status: TeacherAttendanceStatus
    arrivalTime?: string | null
    reason?: string | null
  }>
  recordedBy?: string
  expectedArrival?: string
}): ResultAsync<TeacherAttendance[], DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      const results: TeacherAttendance[] = []

      for (const entry of params.entries) {
        let lateMinutes: number | null = null
        if (entry.status === 'late' && entry.arrivalTime && params.expectedArrival) {
          const [expHour, expMin] = params.expectedArrival.split(':').map(Number)
          const [arrHour, arrMin] = entry.arrivalTime.split(':').map(Number)
          const expectedMinutes = (expHour ?? 0) * 60 + (expMin ?? 0)
          const arrivalMinutes = (arrHour ?? 0) * 60 + (arrMin ?? 0)
          lateMinutes = Math.max(0, arrivalMinutes - expectedMinutes)
        }

        const [result] = await tx
          .insert(teacherAttendance)
          .values({
            id: crypto.randomUUID(),
            teacherId: entry.teacherId,
            schoolId: params.schoolId,
            date: params.date,
            status: entry.status,
            arrivalTime: entry.arrivalTime,
            lateMinutes,
            reason: entry.reason,
            recordedBy: params.recordedBy,
          })
          .onConflictDoUpdate({
            target: [teacherAttendance.teacherId, teacherAttendance.date],
            set: {
              status: entry.status,
              arrivalTime: entry.arrivalTime,
              lateMinutes,
              reason: entry.reason,
              recordedBy: params.recordedBy,
              updatedAt: new Date(),
            },
          })
          .returning()

        if (result)
          results.push(result)
      }

      return results
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to bulk upsert teacher attendance'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId: params.schoolId, date: params.date }))
}

// Count teacher late occurrences in a month
export function countTeacherLatenessInMonth(teacherId: string, year: number, month: number): ResultAsync<number, DatabaseError> {
  const db = getDb()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  return ResultAsync.fromPromise(
    db
      .select({ count: count() })
      .from(teacherAttendance)
      .where(
        and(
          eq(teacherAttendance.teacherId, teacherId),
          eq(teacherAttendance.status, 'late'),
          gte(teacherAttendance.date, startDate),
          lte(teacherAttendance.date, endDate!),
        ),
      )
      .then(rows => Number(rows[0]?.count ?? 0)),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to count teacher lateness'),
  ).mapErr(tapLogErr(databaseLogger, { teacherId, year, month }))
}

// Get teacher punctuality report
export function getTeacherPunctualityReport(params: {
  schoolId: string
  startDate: string
  endDate: string
  teacherId?: string
}): ResultAsync<Array<{
  teacherId: string
  teacherName: string
  totalDays: number
  presentDays: number
  lateDays: number
  absentDays: number
  excusedDays: number
  totalLateMinutes: number
  attendanceRate: number
  punctualityRate: number
}>, DatabaseError> {
  const db = getDb()
  const conditions = [
    eq(teacherAttendance.schoolId, params.schoolId),
    gte(teacherAttendance.date, params.startDate),
    lte(teacherAttendance.date, params.endDate),
  ]

  if (params.teacherId) {
    conditions.push(eq(teacherAttendance.teacherId, params.teacherId))
  }

  return ResultAsync.fromPromise(
    db
      .select({
        teacherId: teacherAttendance.teacherId,
        teacherName: users.name,
        totalDays: count(),
        presentDays: sql<number>`COUNT(*) FILTER (WHERE ${teacherAttendance.status} = 'present')`,
        lateDays: sql<number>`COUNT(*) FILTER (WHERE ${teacherAttendance.status} = 'late')`,
        absentDays: sql<number>`COUNT(*) FILTER (WHERE ${teacherAttendance.status} = 'absent')`,
        excusedDays: sql<number>`COUNT(*) FILTER (WHERE ${teacherAttendance.status} IN ('excused', 'on_leave'))`,
        totalLateMinutes: sql<number>`COALESCE(SUM(${teacherAttendance.lateMinutes}), 0)`,
      })
      .from(teacherAttendance)
      .leftJoin(teachers, eq(teacherAttendance.teacherId, teachers.id))
      .leftJoin(users, eq(teachers.userId, users.id))
      .where(and(...conditions))
      .groupBy(teacherAttendance.teacherId, users.name)
      .then(stats => stats.map(s => ({
        teacherId: s.teacherId,
        teacherName: s.teacherName ?? 'Unknown',
        totalDays: s.totalDays,
        presentDays: Number(s.presentDays),
        lateDays: Number(s.lateDays),
        absentDays: Number(s.absentDays),
        excusedDays: Number(s.excusedDays),
        totalLateMinutes: Number(s.totalLateMinutes),
        attendanceRate: s.totalDays > 0
          ? ((Number(s.presentDays) + Number(s.lateDays)) / s.totalDays) * 100
          : 0,
        punctualityRate: (Number(s.presentDays) + Number(s.lateDays)) > 0
          ? (Number(s.presentDays) / (Number(s.presentDays) + Number(s.lateDays))) * 100
          : 100,
      }))),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch teacher punctuality report'),
  ).mapErr(tapLogErr(databaseLogger, params))
}

// Delete teacher attendance record
export function deleteTeacherAttendance(id: string, schoolId: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.delete(teacherAttendance).where(and(
      eq(teacherAttendance.id, id),
      eq(teacherAttendance.schoolId, schoolId),
    )).then(() => {}),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete teacher attendance'),
  ).mapErr(tapLogErr(databaseLogger, { id, schoolId }))
}
