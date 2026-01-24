import { and, desc, eq, gte, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb } from '../database/setup'
import { classes, conductRecords } from '../drizzle/school-schema'

/**
 * Create a student note (incident/note)
 */
export async function createStudentNote(params: {
  studentId: string
  classId: string
  teacherId: string
  title: string
  content: string
  type: 'behavior' | 'academic' | 'attendance' | 'general'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isPrivate?: boolean
}) {
  const db = getDb()

  // Get school info from class
  const classData = await db
    .select({
      schoolId: classes.schoolId,
      schoolYearId: classes.schoolYearId,
    })
    .from(classes)
    .where(eq(classes.id, params.classId))
    .limit(1)

  if (!classData[0])
    throw new Error('Class not found')

  // Map type to conduct type/category
  const conductType = params.type === 'behavior' ? 'incident' : 'note'

  const [result] = await db
    .insert(conductRecords)
    .values({
      id: nanoid(),
      schoolId: classData[0].schoolId,
      schoolYearId: classData[0].schoolYearId,
      studentId: params.studentId,
      classId: params.classId,
      recordedBy: params.teacherId,
      title: params.title,
      description: params.content,
      type: conductType as any,
      category: params.type as any,
      severity: params.priority as any,
      incidentDate: new Date().toISOString().split('T')[0]!,
      status: 'open',
    })
    .returning()

  if (!result)
    throw new Error('Failed to create note')

  return {
    id: result.id,
    title: result.title,
    content: result.description,
    type: result.category,
    priority: result.severity,
    createdAt: result.createdAt,
  }
}

/**
 * Get notes for a student
 */
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

  const conditions = [eq(conductRecords.studentId, params.studentId)]
  if (params.classId)
    conditions.push(eq(conductRecords.classId, params.classId))
  if (params.type)
    conditions.push(eq(conductRecords.category, params.type as any))

  const results = await db
    .select({
      id: conductRecords.id,
      title: conductRecords.title,
      content: conductRecords.description,
      type: conductRecords.category,
      priority: conductRecords.severity,
      createdAt: conductRecords.createdAt,
    })
    .from(conductRecords)
    .where(and(...conditions))
    .orderBy(desc(conductRecords.createdAt))
    .limit(params.limit ?? 20)
    .offset(params.offset ?? 0)

  return results.map(r => ({
    ...r,
    priority: r.priority ?? 'medium',
  }))
}

/**
 * Get behavior summary for a student
 */
export async function getBehaviorSummary(params: {
  studentId: string
  schoolYearId: string
}) {
  const { getStudentConductSummary } = await import('./conduct-records')
  return getStudentConductSummary(params.studentId, params.schoolYearId)
}

/**
 * Update a student note
 */
export async function updateStudentNote(params: {
  noteId: string
  teacherId: string
  title?: string
  content?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}) {
  const db = getDb()
  const [result] = await db
    .update(conductRecords)
    .set({
      title: params.title,
      description: params.content,
      severity: params.priority as any,
      updatedAt: new Date(),
    })
    .where(eq(conductRecords.id, params.noteId))
    .returning()

  if (!result)
    throw new Error('Failed to update note')

  return {
    id: result.id,
    title: result.title,
    content: result.description,
    type: result.category,
    priority: result.severity,
    createdAt: result.createdAt,
  }
}

/**
 * Delete a student note
 */
export async function deleteStudentNote(params: {
  noteId: string
  teacherId: string
}) {
  const db = getDb()
  return db.delete(conductRecords).where(eq(conductRecords.id, params.noteId))
}

/**
 * Get notes trend for a student
 */
export async function getNotesTrend(params: {
  studentId: string
  months?: number
}) {
  const db = getDb()
  const months = params.months ?? 6

  return db
    .select({
      type: conductRecords.category,
      count: sql<number>`count(*)::int`,
    })
    .from(conductRecords)
    .where(
      and(
        eq(conductRecords.studentId, params.studentId),
        // Simplified for SQLite/Postgres compatibility in this context
        gte(
          conductRecords.createdAt,
          sql`CURRENT_TIMESTAMP - (${sql.raw(months.toString())} || ' month')::interval`,
        ),
      ),
    )
    .groupBy(conductRecords.category)
}
