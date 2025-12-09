import type { ConductCategory, ConductFollowUpInsert, ConductRecord, ConductRecordInsert, ConductStatus, ConductType, SeverityLevel } from '../drizzle/school-schema'
import { and, count, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { getDb } from '../database/setup'
import {
  conductFollowUps,
  conductRecords,
  students,
  users,
} from '../drizzle/school-schema'

// Get conduct records with filters
export async function getConductRecords(params: {
  schoolId: string
  schoolYearId: string
  studentId?: string
  classId?: string
  type?: ConductType
  category?: ConductCategory
  status?: ConductStatus
  severity?: SeverityLevel
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  pageSize?: number
}) {
  const db = getDb()
  const { page = 1, pageSize = 20 } = params
  const offset = (page - 1) * pageSize

  const conditions = [
    eq(conductRecords.schoolId, params.schoolId),
    eq(conductRecords.schoolYearId, params.schoolYearId),
  ]

  if (params.studentId)
    conditions.push(eq(conductRecords.studentId, params.studentId))
  if (params.classId)
    conditions.push(eq(conductRecords.classId, params.classId))
  if (params.type)
    conditions.push(eq(conductRecords.type, params.type))
  if (params.category)
    conditions.push(eq(conductRecords.category, params.category))
  if (params.status)
    conditions.push(eq(conductRecords.status, params.status))
  if (params.severity)
    conditions.push(eq(conductRecords.severity, params.severity))
  if (params.startDate)
    conditions.push(gte(conductRecords.incidentDate, params.startDate))
  if (params.endDate)
    conditions.push(lte(conductRecords.incidentDate, params.endDate))
  if (params.search) {
    conditions.push(
      or(
        ilike(conductRecords.title, `%${params.search}%`),
        ilike(conductRecords.description, `%${params.search}%`),
      )!,
    )
  }

  const [records, countResult] = await Promise.all([
    db
      .select({
        record: conductRecords,
        studentName: sql<string>`${students.lastName} || ' ' || ${students.firstName}`,
        studentMatricule: students.matricule,
        recordedByName: users.name,
      })
      .from(conductRecords)
      .leftJoin(students, eq(conductRecords.studentId, students.id))
      .leftJoin(users, eq(conductRecords.recordedBy, users.id))
      .where(and(...conditions))
      .orderBy(desc(conductRecords.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: count() })
      .from(conductRecords)
      .where(and(...conditions)),
  ])

  return {
    data: records.map((r: { record: typeof conductRecords.$inferSelect, studentName: string, studentMatricule: string | null, recordedByName: string | null }) => ({
      ...r.record,
      studentName: r.studentName,
      studentMatricule: r.studentMatricule,
      recordedByName: r.recordedByName,
    })),
    total: countResult[0]?.count ?? 0,
    page,
    pageSize,
  }
}

// Get single conduct record with details
export async function getConductRecord(id: string) {
  const db = getDb()
  const [record] = await db
    .select({
      record: conductRecords,
      studentName: sql<string>`${students.lastName} || ' ' || ${students.firstName}`,
      studentMatricule: students.matricule,
      studentPhoto: students.photoUrl,
      recordedByName: users.name,
    })
    .from(conductRecords)
    .leftJoin(students, eq(conductRecords.studentId, students.id))
    .leftJoin(users, eq(conductRecords.recordedBy, users.id))
    .where(eq(conductRecords.id, id))

  if (!record)
    return null

  // Get follow-ups
  const followUps = await db
    .select({
      followUp: conductFollowUps,
      createdByName: users.name,
    })
    .from(conductFollowUps)
    .leftJoin(users, eq(conductFollowUps.createdBy, users.id))
    .where(eq(conductFollowUps.conductRecordId, id))
    .orderBy(desc(conductFollowUps.createdAt))

  return {
    ...record.record,
    studentName: record.studentName,
    studentMatricule: record.studentMatricule,
    studentPhoto: record.studentPhoto,
    recordedByName: record.recordedByName,
    followUps: followUps.map((f: { followUp: typeof conductFollowUps.$inferSelect, createdByName: string | null }) => ({
      ...f.followUp,
      createdByName: f.createdByName,
    })),
  }
}

// Create conduct record
export async function createConductRecord(data: Omit<ConductRecordInsert, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = getDb()
  const [result] = await db
    .insert(conductRecords)
    .values({
      id: nanoid(),
      ...data,
    })
    .returning()

  return result
}

// Update conduct record
export async function updateConductRecord(id: string, data: Partial<ConductRecordInsert>) {
  const db = getDb()
  const [result] = await db
    .update(conductRecords)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(conductRecords.id, id))
    .returning()

  return result
}

// Update conduct status
export async function updateConductStatus(params: {
  id: string
  status: ConductStatus
  resolutionNotes?: string
  resolvedBy?: string
}) {
  const db = getDb()
  const updateData: Partial<ConductRecord> = {
    status: params.status,
    updatedAt: new Date(),
  }

  if (params.status === 'resolved' || params.status === 'closed') {
    updateData.resolvedBy = params.resolvedBy
    updateData.resolvedAt = new Date()
    updateData.resolutionNotes = params.resolutionNotes
  }

  const [result] = await db
    .update(conductRecords)
    .set(updateData)
    .where(eq(conductRecords.id, params.id))
    .returning()

  return result
}

// Add follow-up to conduct record
export async function addConductFollowUp(data: Omit<ConductFollowUpInsert, 'id' | 'createdAt'>) {
  const db = getDb()
  const [result] = await db
    .insert(conductFollowUps)
    .values({
      id: nanoid(),
      ...data,
    })
    .returning()

  return result
}

// Complete follow-up
export async function completeFollowUp(id: string, outcome?: string) {
  const db = getDb()
  const [result] = await db
    .update(conductFollowUps)
    .set({
      completedAt: new Date(),
      outcome,
    })
    .where(eq(conductFollowUps.id, id))
    .returning()

  return result
}

// Mark parent notified for conduct record
export async function markConductParentNotified(id: string) {
  const db = getDb()
  const [result] = await db
    .update(conductRecords)
    .set({
      parentNotified: true,
      parentNotifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(conductRecords.id, id))
    .returning()

  return result
}

// Mark parent acknowledged
export async function markConductParentAcknowledged(id: string, response?: string) {
  const db = getDb()
  const [result] = await db
    .update(conductRecords)
    .set({
      parentAcknowledged: true,
      parentAcknowledgedAt: new Date(),
      parentResponse: response,
      updatedAt: new Date(),
    })
    .where(eq(conductRecords.id, id))
    .returning()

  return result
}

// Get student conduct summary
export async function getStudentConductSummary(studentId: string, schoolYearId: string) {
  const db = getDb()
  const conditions = [
    eq(conductRecords.studentId, studentId),
    eq(conductRecords.schoolYearId, schoolYearId),
  ]

  const [summary] = await db
    .select({
      totalRecords: count(),
      incidentCount: sql<number>`COUNT(*) FILTER (WHERE ${conductRecords.type} = 'incident')`,
      sanctionCount: sql<number>`COUNT(*) FILTER (WHERE ${conductRecords.type} = 'sanction')`,
      rewardCount: sql<number>`COUNT(*) FILTER (WHERE ${conductRecords.type} = 'reward')`,
      noteCount: sql<number>`COUNT(*) FILTER (WHERE ${conductRecords.type} = 'note')`,
      openCount: sql<number>`COUNT(*) FILTER (WHERE ${conductRecords.status} = 'open')`,
      resolvedCount: sql<number>`COUNT(*) FILTER (WHERE ${conductRecords.status} IN ('resolved', 'closed'))`,
      lowSeverity: sql<number>`COUNT(*) FILTER (WHERE ${conductRecords.severity} = 'low')`,
      mediumSeverity: sql<number>`COUNT(*) FILTER (WHERE ${conductRecords.severity} = 'medium')`,
      highSeverity: sql<number>`COUNT(*) FILTER (WHERE ${conductRecords.severity} = 'high')`,
      criticalSeverity: sql<number>`COUNT(*) FILTER (WHERE ${conductRecords.severity} = 'critical')`,
      totalPoints: sql<number>`COALESCE(SUM(${conductRecords.pointsAwarded}), 0)`,
    })
    .from(conductRecords)
    .where(and(...conditions))

  // Get category breakdown
  const categoryBreakdown = await db
    .select({
      category: conductRecords.category,
      count: count(),
    })
    .from(conductRecords)
    .where(and(...conditions))
    .groupBy(conductRecords.category)

  return {
    totalRecords: summary?.totalRecords ?? 0,
    incidentCount: Number(summary?.incidentCount ?? 0),
    sanctionCount: Number(summary?.sanctionCount ?? 0),
    rewardCount: Number(summary?.rewardCount ?? 0),
    noteCount: Number(summary?.noteCount ?? 0),
    openCount: Number(summary?.openCount ?? 0),
    resolvedCount: Number(summary?.resolvedCount ?? 0),
    severityBreakdown: {
      low: Number(summary?.lowSeverity ?? 0),
      medium: Number(summary?.mediumSeverity ?? 0),
      high: Number(summary?.highSeverity ?? 0),
      critical: Number(summary?.criticalSeverity ?? 0),
    },
    totalPoints: Number(summary?.totalPoints ?? 0),
    categoryBreakdown: categoryBreakdown.map((c: { category: string, count: number }) => ({
      category: c.category,
      count: c.count,
    })),
  }
}

// Delete conduct record
export async function deleteConductRecord(id: string) {
  const db = getDb()
  return db.delete(conductRecords).where(eq(conductRecords.id, id))
}

// Delete follow-up
export async function deleteFollowUp(id: string) {
  const db = getDb()
  return db.delete(conductFollowUps).where(eq(conductFollowUps.id, id))
}
