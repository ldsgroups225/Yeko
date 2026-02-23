import type { AlertSeverity, AlertStatus, AlertType, AttendanceAlertInsert } from '../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'

import { and, count, desc, eq, gte, lte } from 'drizzle-orm'
import { getDb } from '../database/setup'
import {
  attendanceAlerts,
  students,
  teachers,
  users,
} from '../drizzle/school-schema'
import { DatabaseError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

// Get active alerts for a school
export async function getActiveAlerts(schoolId: string, alertType?: string): R.ResultAsync<Array<{
  alert: typeof attendanceAlerts.$inferSelect
  teacherName: string | null
  studentName: string | null
}>, DatabaseError> {
  const db = getDb()
  const conditions = [
    eq(attendanceAlerts.schoolId, schoolId),
    eq(attendanceAlerts.status, 'active'),
  ]

  if (alertType) {
    conditions.push(eq(attendanceAlerts.alertType, alertType as AlertType))
  }

  return R.pipe(
    R.try({
      try: async () => {
        return await db
          .select({
            alert: attendanceAlerts,
            teacherName: users.name,
            studentName: students.firstName,
          })
          .from(attendanceAlerts)
          .leftJoin(teachers, eq(attendanceAlerts.teacherId, teachers.id))
          .leftJoin(users, eq(teachers.userId, users.id))
          .leftJoin(students, eq(attendanceAlerts.studentId, students.id))
          .where(and(...conditions))
          .orderBy(desc(attendanceAlerts.createdAt))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('attendanceAlerts', 'fetchActiveFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, alertType })),
  )
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
}): R.ResultAsync<{
  data: typeof attendanceAlerts.$inferSelect[]
  total: number
  page: number
  pageSize: number
}, DatabaseError> {
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

  return R.pipe(
    R.try({
      try: async () => {
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
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('attendanceAlerts', 'fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

// Create alert
export async function createAlert(data: Omit<AttendanceAlertInsert, 'id' | 'createdAt'>): R.ResultAsync<typeof attendanceAlerts.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .insert(attendanceAlerts)
          .values({
            id: crypto.randomUUID(),
            ...data,
          })
          .returning()
        return rows[0]!
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('attendanceAlerts', 'createFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, data)),
  )
}

// Check if similar alert exists (to avoid duplicates)
export async function checkExistingAlert(params: {
  schoolId: string
  alertType: AlertType
  teacherId?: string
  studentId?: string
  month?: number
  year?: number
}): R.ResultAsync<typeof attendanceAlerts.$inferSelect | null, DatabaseError> {
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

  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .select()
          .from(attendanceAlerts)
          .where(and(...conditions))
          .limit(1)
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('attendanceAlerts', 'checkExistingFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

// Acknowledge alert
export async function acknowledgeAlert(id: string, userId: string, schoolId: string): R.ResultAsync<typeof attendanceAlerts.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .update(attendanceAlerts)
          .set({
            status: 'acknowledged',
            acknowledgedBy: userId,
            acknowledgedAt: new Date(),
          })
          .where(and(
            eq(attendanceAlerts.id, id),
            eq(attendanceAlerts.schoolId, schoolId),
          ))
          .returning()

        if (rows.length === 0) {
          throw new Error(getNestedErrorMessage('attendanceAlerts', 'notFound'))
        }
        return rows[0]!
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('attendanceAlerts', 'acknowledgeFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id, userId, schoolId })),
  )
}

// Resolve alert
export async function resolveAlert(id: string, schoolId: string): R.ResultAsync<typeof attendanceAlerts.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .update(attendanceAlerts)
          .set({
            status: 'resolved',
            resolvedAt: new Date(),
          })
          .where(and(
            eq(attendanceAlerts.id, id),
            eq(attendanceAlerts.schoolId, schoolId),
          ))
          .returning()

        if (rows.length === 0) {
          throw new Error(getNestedErrorMessage('attendanceAlerts', 'notFound'))
        }
        return rows[0]!
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('attendanceAlerts', 'resolveFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id, schoolId })),
  )
}

// Dismiss alert
export async function dismissAlert(id: string, userId: string, schoolId: string): R.ResultAsync<typeof attendanceAlerts.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .update(attendanceAlerts)
          .set({
            status: 'dismissed',
            acknowledgedBy: userId,
            acknowledgedAt: new Date(),
          })
          .where(and(
            eq(attendanceAlerts.id, id),
            eq(attendanceAlerts.schoolId, schoolId),
          ))
          .returning()

        if (rows.length === 0) {
          throw new Error(getNestedErrorMessage('attendanceAlerts', 'notFound'))
        }
        return rows[0]!
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('attendanceAlerts', 'dismissFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id, userId, schoolId })),
  )
}

// Delete alert
export async function deleteAlert(id: string, schoolId: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        await db.delete(attendanceAlerts).where(and(
          eq(attendanceAlerts.id, id),
          eq(attendanceAlerts.schoolId, schoolId),
        ))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('attendanceAlerts', 'deleteFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id, schoolId })),
  )
}

// Get alert counts by status
export async function getAlertCounts(schoolId: string): R.ResultAsync<{
  active: number
  acknowledged: number
  resolved: number
  dismissed: number
}, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const results = await db
          .select({
            status: attendanceAlerts.status,
            count: count(),
          })
          .from(attendanceAlerts)
          .where(eq(attendanceAlerts.schoolId, schoolId))
          .groupBy(attendanceAlerts.status)

        return {
          active: results.find(r => r.status === 'active')?.count ?? 0,
          acknowledged: results.find(r => r.status === 'acknowledged')?.count ?? 0,
          resolved: results.find(r => r.status === 'resolved')?.count ?? 0,
          dismissed: results.find(r => r.status === 'dismissed')?.count ?? 0,
        }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('attendanceAlerts', 'fetchCountsFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId })),
  )
}
