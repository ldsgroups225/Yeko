/**
 * Student Notes Queries
 * Handles behavior and academic notes for students
 */
import { and, asc, desc, eq, gte, lte, sql, inArray } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { getDb } from '../database/setup'
import { grades, subjects } from '../drizzle/core-schema'
import {
  classes,
  classSubjects,
  enrollments,
  notes,
  students,
  teachers,
  users,
} from '../drizzle/school-schema'

export interface StudentNote {
  id: string
  studentId: string
  classId: string
  teacherId: string
  title: string
  content: string
  type: 'behavior' | 'academic' | 'attendance' | 'general'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date | null
  studentName: string | null
  className: string | null
  teacherName: string | null
}

export interface BehaviorSummary {
  totalNotes: number
  behaviorCount: number
  academicCount: number
  attendanceNoteCount: number
  generalCount: number
  highPriorityCount: number
  urgentCount: number
}

// Create a student note
export async function createStudentNote(params: {
  studentId: string
  classId: string
  teacherId: string
  title: string
  content: string
  type: 'behavior' | 'academic' | 'attendance' | 'general'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isPrivate: boolean
}) {
  const db = getDb()

  const [note] = await db
    .insert(notes)
    .values({
      id: nanoid(),
      studentId: params.studentId,
      classId: params.classId,
      teacherId: params.teacherId,
      title: params.title,
      content: params.content,
      type: params.type,
      priority: params.priority,
      isPrivate: params.isPrivate,
      createdAt: new Date(),
    })
    .returning()

  return note
}

// Get notes for a student
export async function getStudentNotes(params: {
  studentId: string
  classId?: string
  type?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}) {
  const db = getDb()

  const conditions = [eq(notes.studentId, params.studentId)]

  if (params.classId) {
    conditions.push(eq(notes.classId, params.classId))
  }

  if (params.type) {
    conditions.push(eq(notes.type, params.type as any))
  }

  if (params.startDate) {
    conditions.push(gte(notes.createdAt, new Date(params.startDate)))
  }

  if (params.endDate) {
    conditions.push(lte(notes.createdAt, new Date(params.endDate)))
  }

  const results = await db
    .select({
      id: notes.id,
      studentId: notes.studentId,
      classId: notes.classId,
      teacherId: notes.teacherId,
      title: notes.title,
      content: notes.content,
      type: notes.type,
      priority: notes.priority,
      isPrivate: notes.isPrivate,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      studentName: sql<string>`concat(${students.firstName}, ' ', ${students.lastName})`,
      className: classes.name,
      teacherName: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`,
    })
    .from(notes)
    .leftJoin(students, eq(notes.studentId, students.id))
    .leftJoin(classes, eq(notes.classId, classes.id))
    .leftJoin(teachers, eq(notes.teacherId, teachers.id))
    .leftJoin(users, eq(teachers.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(notes.createdAt))
    .limit(params.limit ?? 50)
    .offset(params.offset ?? 0)

  return results
}

// Get behavior summary for a student
export async function getBehaviorSummary(params: {
  studentId: string
  schoolYearId: string
}) {
  const db = getDb()

  const [summary] = await db
    .select({
      totalNotes: sql<number>`count(*)::int`,
      behaviorCount: sql<number>`count(case when ${notes.type} = 'behavior' then 1 end)::int`,
      academicCount: sql<number>`count(case when ${notes.type} = 'academic' then 1 end)::int`,
      attendanceNoteCount: sql<number>`count(case when ${notes.type} = 'attendance' then 1 end)::int`,
      generalCount: sql<number>`count(case when ${notes.type} = 'general' then 1 end)::int`,
      highPriorityCount: sql<number>`count(case when ${notes.priority} in ('high', 'urgent') then 1 end)::int`,
    })
    .from(notes)
    .innerJoin(enrollments, eq(notes.studentId, enrollments.studentId))
    .where(
      and(
        eq(notes.studentId, params.studentId),
        eq(enrollments.schoolYearId, params.schoolYearId)
      )
    )

  return {
    totalNotes: Number(summary.totalNotes) ?? 0,
    behaviorCount: Number(summary.behaviorCount) ?? 0,
    academicCount: Number(summary.academicCount) ?? 0,
    attendanceNoteCount: Number(summary.attendanceNoteCount) ?? 0,
    generalCount: Number(summary.generalCount) ?? 0,
    highPriorityCount: Number(summary.highPriorityCount) ?? 0,
  }
}

// Update a student note
export async function updateStudentNote(params: {
  noteId: string
  teacherId: string
  title?: string
  content?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}) {
  const db = getDb()

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  }

  if (params.title) updateData.title = params.title
  if (params.content) updateData.content = params.content
  if (params.priority) updateData.priority = params.priority

  const [note] = await db
    .update(notes)
    .set(updateData)
    .where(and(eq(notes.id, params.noteId), eq(notes.teacherId, params.teacherId)))
    .returning()

  return note
}

// Delete a student note (soft delete)
export async function deleteStudentNote(params: {
  noteId: string
  teacherId: string
}) {
  const db = getDb()

  await db
    .delete(notes)
    .where(and(eq(notes.id, params.noteId), eq(notes.teacherId, params.teacherId)))

  return { success: true }
}

// Get monthly trend of notes for a student
export async function getNotesTrend(params: {
  studentId: string
  months: number
}) {
  const db = getDb()

  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - params.months)

  const results = await db
    .select({
      month: sql<string>`to_char(${notes.createdAt}, 'YYYY-MM')`,
      count: sql<number>`count(*)::int`,
    })
    .from(notes)
    .where(
      and(
        eq(notes.studentId, params.studentId),
        gte(notes.createdAt, startDate)
      )
    )
    .groupBy(sql`to_char(${notes.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${notes.createdAt}, 'YYYY-MM')`)

  return results.map((r) => ({
    month: r.month,
    count: Number(r.count),
  }))
}
