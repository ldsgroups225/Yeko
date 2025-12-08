import type { AbsenceReasonCategory, StudentAttendance, StudentAttendanceInsert, StudentAttendanceStatus } from '../drizzle/school-schema'
import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { getDb } from '../database/setup'
import {
  enrollments,
  studentAttendance,
  students,
} from '../drizzle/school-schema'

// Get class attendance for a date (with optional session)
export async function getClassAttendance(params: {
  classId: string
  date: string
  classSessionId?: string
}) {
  const db = getDb()

  // Get enrolled students
  const enrolledStudents = await db
    .select({
      student: students,
      enrollment: enrollments,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .where(
      and(
        eq(enrollments.classId, params.classId),
        eq(enrollments.status, 'confirmed'),
      ),
    )
    .orderBy(students.lastName, students.firstName)

  // Get attendance records for the date
  const attendanceConditions = [
    eq(studentAttendance.classId, params.classId),
    eq(studentAttendance.date, params.date),
  ]
  if (params.classSessionId) {
    attendanceConditions.push(eq(studentAttendance.classSessionId, params.classSessionId))
  }

  const attendanceRecords = await db
    .select()
    .from(studentAttendance)
    .where(and(...attendanceConditions))

  // Map attendance to students
  const attendanceMap = new Map(
    attendanceRecords.map((a: typeof studentAttendance.$inferSelect) => [a.studentId, a]),
  )

  return enrolledStudents.map(({ student, enrollment }: { student: typeof students.$inferSelect, enrollment: typeof enrollments.$inferSelect }) => ({
    studentId: student.id,
    studentName: `${student.lastName} ${student.firstName}`,
    matricule: student.matricule,
    photoUrl: student.photoUrl,
    rollNumber: enrollment.rollNumber,
    attendance: attendanceMap.get(student.id) ?? null,
  }))
}

// Get student attendance history
export async function getStudentAttendanceHistory(params: {
  studentId: string
  startDate: string
  endDate: string
  classId?: string
}) {
  const db = getDb()
  const conditions = [
    eq(studentAttendance.studentId, params.studentId),
    gte(studentAttendance.date, params.startDate),
    lte(studentAttendance.date, params.endDate),
  ]

  if (params.classId) {
    conditions.push(eq(studentAttendance.classId, params.classId))
  }

  const records = await db
    .select()
    .from(studentAttendance)
    .where(and(...conditions))
    .orderBy(desc(studentAttendance.date))

  // Calculate statistics
  const stats = {
    totalDays: records.length,
    presentDays: records.filter((r: typeof studentAttendance.$inferSelect) => r.status === 'present').length,
    lateDays: records.filter((r: typeof studentAttendance.$inferSelect) => r.status === 'late').length,
    absentDays: records.filter((r: typeof studentAttendance.$inferSelect) => r.status === 'absent').length,
    excusedDays: records.filter((r: typeof studentAttendance.$inferSelect) => r.status === 'excused').length,
  }

  const attendanceRate = stats.totalDays > 0
    ? ((stats.presentDays + stats.lateDays) / stats.totalDays) * 100
    : 0

  return {
    records,
    stats: {
      ...stats,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    },
  }
}

// Create or update student attendance
export async function upsertStudentAttendance(data: {
  studentId: string
  classId: string
  schoolId: string
  date: string
  status: StudentAttendanceStatus
  classSessionId?: string | null
  arrivalTime?: string | null
  reason?: string | null
  reasonCategory?: AbsenceReasonCategory | null
  notes?: string | null
  recordedBy?: string | null
  lateThresholdMinutes?: number
}) {
  const db = getDb()

  // Calculate late minutes if status is 'late' and arrival time is provided
  let lateMinutes: number | null = null
  if (data.status === 'late' && data.arrivalTime && data.lateThresholdMinutes) {
    lateMinutes = data.lateThresholdMinutes
  }

  const insertData: StudentAttendanceInsert = {
    id: nanoid(),
    studentId: data.studentId,
    classId: data.classId,
    schoolId: data.schoolId,
    classSessionId: data.classSessionId,
    date: data.date,
    status: data.status,
    arrivalTime: data.arrivalTime,
    lateMinutes,
    reason: data.reason,
    reasonCategory: data.reasonCategory,
    notes: data.notes,
    recordedBy: data.recordedBy,
  }

  // Use upsert - if session is provided, use session-based uniqueness
  const [result] = await db
    .insert(studentAttendance)
    .values(insertData)
    .onConflictDoNothing()
    .returning()

  // If no result (conflict), try to update existing
  if (!result) {
    const conditions = [
      eq(studentAttendance.studentId, data.studentId),
      eq(studentAttendance.date, data.date),
      eq(studentAttendance.classId, data.classId),
    ]
    if (data.classSessionId) {
      conditions.push(eq(studentAttendance.classSessionId, data.classSessionId))
    }

    const [updated] = await db
      .update(studentAttendance)
      .set({
        status: data.status,
        arrivalTime: data.arrivalTime,
        lateMinutes,
        reason: data.reason,
        reasonCategory: data.reasonCategory,
        notes: data.notes,
        recordedBy: data.recordedBy,
        updatedAt: new Date(),
      })
      .where(and(...conditions))
      .returning()

    return updated
  }

  return result
}


// Bulk create/update class attendance
export async function bulkUpsertClassAttendance(params: {
  classId: string
  schoolId: string
  date: string
  classSessionId?: string
  entries: Array<{
    studentId: string
    status: StudentAttendanceStatus
    arrivalTime?: string | null
    reason?: string | null
    reasonCategory?: AbsenceReasonCategory | null
  }>
  recordedBy?: string
}) {
  const db = getDb()
  const results: StudentAttendance[] = []

  await db.transaction(async (tx: any) => {
    for (const entry of params.entries) {
      const insertData: StudentAttendanceInsert = {
        id: nanoid(),
        studentId: entry.studentId,
        classId: params.classId,
        schoolId: params.schoolId,
        classSessionId: params.classSessionId,
        date: params.date,
        status: entry.status,
        arrivalTime: entry.arrivalTime,
        reason: entry.reason,
        reasonCategory: entry.reasonCategory,
        recordedBy: params.recordedBy,
      }

      const [result] = await tx
        .insert(studentAttendance)
        .values(insertData)
        .onConflictDoNothing()
        .returning()

      if (result) {
        results.push(result)
      }
      else {
        // Update existing
        const conditions = [
          eq(studentAttendance.studentId, entry.studentId),
          eq(studentAttendance.date, params.date),
          eq(studentAttendance.classId, params.classId),
        ]
        if (params.classSessionId) {
          conditions.push(eq(studentAttendance.classSessionId, params.classSessionId))
        }

        const [updated] = await tx
          .update(studentAttendance)
          .set({
            status: entry.status,
            arrivalTime: entry.arrivalTime,
            reason: entry.reason,
            reasonCategory: entry.reasonCategory,
            recordedBy: params.recordedBy,
            updatedAt: new Date(),
          })
          .where(and(...conditions))
          .returning()

        if (updated) results.push(updated)
      }
    }
  })

  return results
}

// Excuse student absence
export async function excuseStudentAbsence(params: {
  attendanceId: string
  reason: string
  reasonCategory: AbsenceReasonCategory
  excusedBy: string
}) {
  const db = getDb()
  const [result] = await db
    .update(studentAttendance)
    .set({
      status: 'excused',
      reason: params.reason,
      reasonCategory: params.reasonCategory,
      excusedBy: params.excusedBy,
      excusedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(studentAttendance.id, params.attendanceId))
    .returning()

  return result
}

// Mark parent notified
export async function markParentNotified(params: {
  attendanceId: string
  method: 'email' | 'sms' | 'in_app'
}) {
  const db = getDb()
  const [result] = await db
    .update(studentAttendance)
    .set({
      parentNotified: true,
      notifiedAt: new Date(),
      notificationMethod: params.method,
      updatedAt: new Date(),
    })
    .where(eq(studentAttendance.id, params.attendanceId))
    .returning()

  return result
}

// Get attendance statistics for a class or school
export async function getAttendanceStatistics(params: {
  schoolId: string
  startDate: string
  endDate: string
  classId?: string
}) {
  const db = getDb()
  const conditions = [
    eq(studentAttendance.schoolId, params.schoolId),
    gte(studentAttendance.date, params.startDate),
    lte(studentAttendance.date, params.endDate),
  ]

  if (params.classId) {
    conditions.push(eq(studentAttendance.classId, params.classId))
  }

  const [stats] = await db
    .select({
      totalRecords: count(),
      presentCount: sql<number>`COUNT(*) FILTER (WHERE ${studentAttendance.status} = 'present')`,
      lateCount: sql<number>`COUNT(*) FILTER (WHERE ${studentAttendance.status} = 'late')`,
      absentCount: sql<number>`COUNT(*) FILTER (WHERE ${studentAttendance.status} = 'absent')`,
      excusedCount: sql<number>`COUNT(*) FILTER (WHERE ${studentAttendance.status} = 'excused')`,
    })
    .from(studentAttendance)
    .where(and(...conditions))

  const total = stats?.totalRecords ?? 0
  const present = Number(stats?.presentCount ?? 0)
  const late = Number(stats?.lateCount ?? 0)
  const absent = Number(stats?.absentCount ?? 0)
  const excused = Number(stats?.excusedCount ?? 0)

  return {
    totalRecords: total,
    presentCount: present,
    lateCount: late,
    absentCount: absent,
    excusedCount: excused,
    attendanceRate: total > 0 ? ((present + late) / total) * 100 : 0,
    punctualityRate: (present + late) > 0 ? (present / (present + late)) * 100 : 100,
  }
}

// Count student absences (for chronic absence detection)
export async function countStudentAbsences(params: {
  studentId: string
  startDate: string
  endDate: string
  excludeExcused?: boolean
}) {
  const db = getDb()
  const conditions = [
    eq(studentAttendance.studentId, params.studentId),
    gte(studentAttendance.date, params.startDate),
    lte(studentAttendance.date, params.endDate),
  ]

  if (params.excludeExcused) {
    conditions.push(eq(studentAttendance.status, 'absent'))
  }
  else {
    conditions.push(sql`${studentAttendance.status} IN ('absent', 'excused')`)
  }

  const [result] = await db
    .select({ count: count() })
    .from(studentAttendance)
    .where(and(...conditions))

  return result?.count ?? 0
}

// Delete student attendance record
export async function deleteStudentAttendance(id: string) {
  const db = getDb()
  return db.delete(studentAttendance).where(eq(studentAttendance.id, id))
}
