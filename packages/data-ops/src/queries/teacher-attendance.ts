import type { TeacherAttendance, TeacherAttendanceInsert, TeacherAttendanceStatus } from '../drizzle/school-schema'
import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm'

import { getDb } from '../database/setup'
import {
  teacherAttendance,
  teachers,
  users,
} from '../drizzle/school-schema'

// Get daily teacher attendance for a school
export async function getDailyTeacherAttendance(schoolId: string, date: string) {
  const db = getDb()
  const results = await db
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

  return results.map((r: { teacher: typeof teachers.$inferSelect, user: typeof users.$inferSelect | null, attendance: typeof teacherAttendance.$inferSelect | null }) => ({
    teacherId: r.teacher.id,
    teacherName: r.user?.name ?? 'Unknown',
    teacherEmail: r.user?.email ?? '',
    teacherAvatar: r.user?.avatarUrl,
    specialization: r.teacher.specialization,
    attendance: r.attendance
      ? {
          id: r.attendance.id,
          status: r.attendance.status,
          arrivalTime: r.attendance.arrivalTime,
          departureTime: r.attendance.departureTime,
          lateMinutes: r.attendance.lateMinutes,
          reason: r.attendance.reason,
          notes: r.attendance.notes,
        }
      : null,
  }))
}

// Get teacher attendance for a date range
export async function getTeacherAttendanceRange(params: {
  schoolId: string
  startDate: string
  endDate: string
  teacherId?: string
  status?: TeacherAttendanceStatus
}) {
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

  return db
    .select({
      attendance: teacherAttendance,
      teacherName: users.name,
    })
    .from(teacherAttendance)
    .leftJoin(teachers, eq(teacherAttendance.teacherId, teachers.id))
    .leftJoin(users, eq(teachers.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(teacherAttendance.date))
}

// Create or update teacher attendance (upsert)
export async function upsertTeacherAttendance(data: {
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
}) {
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

  const [result] = await db
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

  return result
}

// Bulk upsert teacher attendance
export async function bulkUpsertTeacherAttendance(params: {
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
}) {
  const db = getDb()
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

    const [result] = await db
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
}

// Count teacher late occurrences in a month
export async function countTeacherLatenessInMonth(teacherId: string, year: number, month: number) {
  const db = getDb()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const [result] = await db
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

  return result?.count ?? 0
}

// Get teacher punctuality report
export async function getTeacherPunctualityReport(params: {
  schoolId: string
  startDate: string
  endDate: string
  teacherId?: string
}) {
  const db = getDb()
  const conditions = [
    eq(teacherAttendance.schoolId, params.schoolId),
    gte(teacherAttendance.date, params.startDate),
    lte(teacherAttendance.date, params.endDate),
  ]

  if (params.teacherId) {
    conditions.push(eq(teacherAttendance.teacherId, params.teacherId))
  }

  const stats = await db
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

  return stats.map((s: typeof stats[number]) => ({
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
  }))
}

// Delete teacher attendance record
export async function deleteTeacherAttendance(id: string) {
  const db = getDb()
  return db.delete(teacherAttendance).where(eq(teacherAttendance.id, id))
}
