import type { AlertSeverity, AlertStatus, AlertType, AttendanceAlertInsert } from '../drizzle/school-schema'
import { and, count, desc, eq, gte, lte } from 'drizzle-orm'

import { getDb } from '../database/setup'
import {
  attendanceAlerts,
  students,
  teachers,
  users,
} from '../drizzle/school-schema'

// Get active alerts for a school
export async function getActiveAlerts(schoolId: string) {
  const db = getDb()
  return db
    .select({
      alert: attendanceAlerts,
      teacherName: users.name,
      studentName: students.firstName,
    })
    .from(attendanceAlerts)
    .leftJoin(teachers, eq(attendanceAlerts.teacherId, teachers.id))
    .leftJoin(users, eq(teachers.userId, users.id))
    .leftJoin(students, eq(attendanceAlerts.studentId, students.id))
    .where(
      and(
        eq(attendanceAlerts.schoolId, schoolId),
        eq(attendanceAlerts.status, 'active'),
      ),
    )
    .orderBy(desc(attendanceAlerts.createdAt))
}

// Get alerts with filters
export async function getAlerts(params: {
  schoolId: string
  status?: AlertStatus
  alertType?: AlertType
  severity?: AlertSeverity
  teacherId?: string
  studentId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}) {
  const db = getDb()
  const { page = 1, pageSize = 20 } = params
  const offset = (page - 1) * pageSize

  const conditions = [eq(attendanceAlerts.schoolId, params.schoolId)]

  if (params.status)
    conditions.push(eq(attendanceAlerts.status, params.status))
  if (params.alertType)
    conditions.push(eq(attendanceAlerts.alertType, params.alertType))
  if (params.severity)
    conditions.push(eq(attendanceAlerts.severity, params.severity))
  if (params.teacherId)
    conditions.push(eq(attendanceAlerts.teacherId, params.teacherId))
  if (params.studentId)
    conditions.push(eq(attendanceAlerts.studentId, params.studentId))
  if (params.startDate)
    conditions.push(gte(attendanceAlerts.createdAt, new Date(params.startDate)))
  if (params.endDate)
    conditions.push(lte(attendanceAlerts.createdAt, new Date(params.endDate)))

  const [alerts, countResult] = await Promise.all([
    db
      .select()
      .from(attendanceAlerts)
      .where(and(...conditions))
      .orderBy(desc(attendanceAlerts.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: count() })
      .from(attendanceAlerts)
      .where(and(...conditions)),
  ])

  return {
    data: alerts,
    total: countResult[0]?.count ?? 0,
    page,
    pageSize,
  }
}

// Create alert
export async function createAlert(data: Omit<AttendanceAlertInsert, 'id' | 'createdAt'>) {
  const db = getDb()
  const [result] = await db
    .insert(attendanceAlerts)
    .values({
      id: crypto.randomUUID(),
      ...data,
    })
    .returning()

  return result
}

// Check if similar alert exists (to avoid duplicates)
export async function checkExistingAlert(params: {
  schoolId: string
  alertType: AlertType
  teacherId?: string
  studentId?: string
  month?: number
  year?: number
}) {
  const db = getDb()
  const conditions = [
    eq(attendanceAlerts.schoolId, params.schoolId),
    eq(attendanceAlerts.alertType, params.alertType),
    eq(attendanceAlerts.status, 'active'),
  ]

  if (params.teacherId)
    conditions.push(eq(attendanceAlerts.teacherId, params.teacherId))
  if (params.studentId)
    conditions.push(eq(attendanceAlerts.studentId, params.studentId))

  // Check for alerts created this month
  if (params.month && params.year) {
    const startOfMonth = new Date(params.year, params.month - 1, 1)
    const endOfMonth = new Date(params.year, params.month, 0)
    conditions.push(gte(attendanceAlerts.createdAt, startOfMonth))
    conditions.push(lte(attendanceAlerts.createdAt, endOfMonth))
  }

  const [existing] = await db
    .select()
    .from(attendanceAlerts)
    .where(and(...conditions))
    .limit(1)

  return existing ?? null
}

// Acknowledge alert
export async function acknowledgeAlert(id: string, userId: string) {
  const db = getDb()
  const [result] = await db
    .update(attendanceAlerts)
    .set({
      status: 'acknowledged',
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    })
    .where(eq(attendanceAlerts.id, id))
    .returning()

  return result
}

// Resolve alert
export async function resolveAlert(id: string) {
  const db = getDb()
  const [result] = await db
    .update(attendanceAlerts)
    .set({
      status: 'resolved',
      resolvedAt: new Date(),
    })
    .where(eq(attendanceAlerts.id, id))
    .returning()

  return result
}

// Dismiss alert
export async function dismissAlert(id: string, userId: string) {
  const db = getDb()
  const [result] = await db
    .update(attendanceAlerts)
    .set({
      status: 'dismissed',
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    })
    .where(eq(attendanceAlerts.id, id))
    .returning()

  return result
}

// Delete alert
export async function deleteAlert(id: string) {
  const db = getDb()
  return db.delete(attendanceAlerts).where(eq(attendanceAlerts.id, id))
}

// Get alert counts by status
export async function getAlertCounts(schoolId: string) {
  const db = getDb()
  const results = await db
    .select({
      status: attendanceAlerts.status,
      count: count(),
    })
    .from(attendanceAlerts)
    .where(eq(attendanceAlerts.schoolId, schoolId))
    .groupBy(attendanceAlerts.status)

  return {
    active: results.find((r: { status: string, count: number }) => r.status === 'active')?.count ?? 0,
    acknowledged: results.find((r: { status: string, count: number }) => r.status === 'acknowledged')?.count ?? 0,
    resolved: results.find((r: { status: string, count: number }) => r.status === 'resolved')?.count ?? 0,
    dismissed: results.find((r: { status: string, count: number }) => r.status === 'dismissed')?.count ?? 0,
  }
}
