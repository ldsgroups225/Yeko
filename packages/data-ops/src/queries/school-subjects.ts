import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, count, desc, eq, notInArray, sql } from 'drizzle-orm'

import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { subjects } from '../drizzle/core-schema'
import { classes, classSubjects, schoolSubjects, schoolYears } from '../drizzle/school-schema'
import { DatabaseError } from '../errors'

// ===== SCHOOL SUBJECTS =====

/**
 * Get all subjects activated for a school in a given school year
 */
export type SchoolSubjectWithDetails = typeof schoolSubjects.$inferSelect & {
  subject: Pick<typeof subjects.$inferSelect, 'id' | 'name' | 'shortName' | 'category'>
}

export function getSchoolSubjects(options: {
  schoolId: string
  schoolYearId?: string
  status?: 'active' | 'inactive'
  category?: 'Scientifique' | 'Littéraire' | 'Sportif' | 'Autre'
  search?: string
  page?: number
  limit?: number
}): ResultAsync<{
  subjects: SchoolSubjectWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}, DatabaseError> {
  const db = getDb()
  const { schoolId, schoolYearId, status, category, search, page = 1, limit = 100 } = options
  const offset = (page - 1) * limit

  return ResultAsync.fromPromise(
    (async () => {
      // If no schoolYearId provided, get active school year
      let activeSchoolYearId = schoolYearId
      if (!activeSchoolYearId) {
        const [activeYear] = await db
          .select({ id: schoolYears.id })
          .from(schoolYears)
          .where(and(
            eq(schoolYears.schoolId, schoolId),
            eq(schoolYears.isActive, true),
          ))
          .limit(1)
        activeSchoolYearId = activeYear?.id
      }

      if (!activeSchoolYearId) {
        return {
          subjects: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        }
      }

      const conditions = [
        eq(schoolSubjects.schoolId, schoolId),
        eq(schoolSubjects.schoolYearId, activeSchoolYearId),
      ]

      if (status) {
        conditions.push(eq(schoolSubjects.status, status))
      }

      if (category) {
        conditions.push(eq(subjects.category, category))
      }

      if (search) {
        conditions.push(
          sql`(${subjects.name} ILIKE ${`%${search}%`} OR ${subjects.shortName} ILIKE ${`%${search}%`})`,
        )
      }

      const whereClause = and(...conditions)

      // Get total count
      const [countResult] = await db
        .select({ count: count() })
        .from(schoolSubjects)
        .innerJoin(subjects, eq(schoolSubjects.subjectId, subjects.id))
        .where(whereClause)

      const total = countResult?.count || 0

      // Get subjects with their details
      const result = await db
        .select({
          id: schoolSubjects.id,
          schoolId: schoolSubjects.schoolId,
          subjectId: schoolSubjects.subjectId,
          schoolYearId: schoolSubjects.schoolYearId,
          status: schoolSubjects.status,
          createdAt: schoolSubjects.createdAt,
          updatedAt: schoolSubjects.updatedAt,
          subject: {
            id: subjects.id,
            name: subjects.name,
            shortName: subjects.shortName,
            category: subjects.category,
          },
        })
        .from(schoolSubjects)
        .innerJoin(subjects, eq(schoolSubjects.subjectId, subjects.id))
        .where(whereClause)
        .orderBy(subjects.category, subjects.name)
        .limit(limit)
        .offset(offset)

      return {
        subjects: result,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch school subjects'),
  ).mapErr(tapLogErr(databaseLogger, options))
}

/**
 * Get Core subjects that are not yet added to the school for the given year
 */
export function getAvailableCoreSubjects(options: {
  schoolId: string
  schoolYearId?: string
  category?: 'Scientifique' | 'Littéraire' | 'Sportif' | 'Autre'
  search?: string
}): ResultAsync<Pick<typeof subjects.$inferSelect, 'id' | 'name' | 'shortName' | 'category'>[], DatabaseError> {
  const db = getDb()
  const { schoolId, schoolYearId, category, search } = options

  return ResultAsync.fromPromise(
    (async () => {
      // Get active school year if not provided
      let activeSchoolYearId = schoolYearId
      if (!activeSchoolYearId) {
        const [activeYear] = await db
          .select({ id: schoolYears.id })
          .from(schoolYears)
          .where(and(
            eq(schoolYears.schoolId, schoolId),
            eq(schoolYears.isActive, true),
          ))
          .limit(1)
        activeSchoolYearId = activeYear?.id
      }

      if (!activeSchoolYearId) {
        return []
      }

      // Get already added subject IDs
      const addedSubjects = await db
        .select({ subjectId: schoolSubjects.subjectId })
        .from(schoolSubjects)
        .where(and(
          eq(schoolSubjects.schoolId, schoolId),
          eq(schoolSubjects.schoolYearId, activeSchoolYearId),
        ))

      const addedSubjectIds = addedSubjects.map(s => s.subjectId)

      const conditions = []
      if (category) {
        conditions.push(eq(subjects.category, category))
      }

      if (search) {
        conditions.push(
          sql`(${subjects.name} ILIKE ${`%${search}%`} OR ${subjects.shortName} ILIKE ${`%${search}%`})`,
        )
      }

      if (addedSubjectIds.length > 0) {
        conditions.push(notInArray(subjects.id, addedSubjectIds))
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      return await db
        .select({
          id: subjects.id,
          name: subjects.name,
          shortName: subjects.shortName,
          category: subjects.category,
        })
        .from(subjects)
        .where(whereClause)
        .orderBy(subjects.category, subjects.name)
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch available core subjects'),
  ).mapErr(tapLogErr(databaseLogger, options))
}

/**
 * Add subjects to a school for a specific school year
 */
export function addSubjectsToSchool(options: {
  schoolId: string
  subjectIds: string[]
  schoolYearId?: string
}): ResultAsync<typeof schoolSubjects.$inferSelect[], DatabaseError> {
  const db = getDb()
  const { schoolId, subjectIds, schoolYearId } = options

  if (subjectIds.length === 0) {
    return ResultAsync.fromPromise(Promise.resolve([]), err => DatabaseError.from(err))
  }

  return ResultAsync.fromPromise(
    (async () => {
      // Get active school year if not provided
      let activeSchoolYearId = schoolYearId
      if (!activeSchoolYearId) {
        const [activeYear] = await db
          .select({ id: schoolYears.id })
          .from(schoolYears)
          .where(and(
            eq(schoolYears.schoolId, schoolId),
            eq(schoolYears.isActive, true),
          ))
          .limit(1)
        activeSchoolYearId = activeYear?.id
      }

      if (!activeSchoolYearId) {
        throw new Error('No active school year found')
      }

      const values = subjectIds.map(subjectId => ({
        id: crypto.randomUUID(),
        schoolId,
        subjectId,
        schoolYearId: activeSchoolYearId!,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      const inserted = await db
        .insert(schoolSubjects)
        .values(values)
        .onConflictDoNothing()
        .returning()

      return inserted
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to add subjects to school'),
  ).mapErr(tapLogErr(databaseLogger, options))
}

/**
 * Toggle school subject status (activate/deactivate)
 */
export function toggleSchoolSubjectStatus(
  id: string,
  status: 'active' | 'inactive',
  schoolId: string,
): ResultAsync<typeof schoolSubjects.$inferSelect, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db
      .update(schoolSubjects)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(and(
        eq(schoolSubjects.id, id),
        eq(schoolSubjects.schoolId, schoolId),
      ))
      .returning()
      .then((rows) => {
        if (rows.length === 0) {
          throw new Error('Failed to toggle subject status')
        }
        return rows[0]!
      }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to toggle subject status'),
  ).mapErr(tapLogErr(databaseLogger, { id, status, schoolId }))
}

/**
 * Delete a school subject (hard delete)
 */
export function deleteSchoolSubject(id: string, schoolId: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.delete(schoolSubjects).where(and(
      eq(schoolSubjects.id, id),
      eq(schoolSubjects.schoolId, schoolId),
    )).then(() => {}),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete school subject'),
  ).mapErr(tapLogErr(databaseLogger, { id, schoolId }))
}

/**
 * Get subject usage statistics - how many classes use this subject
 */
export interface SubjectUsageStats {
  schoolSubjectId: string
  subjectId: string
  subjectName: string
  status: string | null
  usageCount: number
}

export function getSubjectUsageStats(options: {
  schoolId: string
  schoolYearId?: string
  subjectId?: string
}): ResultAsync<SubjectUsageStats[], DatabaseError> {
  const db = getDb()
  const { schoolId, schoolYearId, subjectId } = options

  return ResultAsync.fromPromise(
    (async () => {
      // Get active school year if not provided
      let activeSchoolYearId = schoolYearId
      if (!activeSchoolYearId) {
        const [activeYear] = await db
          .select({ id: schoolYears.id })
          .from(schoolYears)
          .where(and(
            eq(schoolYears.schoolId, schoolId),
            eq(schoolYears.isActive, true),
          ))
          .limit(1)
        activeSchoolYearId = activeYear?.id
      }

      const conditions = [
        eq(schoolSubjects.schoolId, schoolId),
      ]

      if (activeSchoolYearId) {
        conditions.push(eq(schoolSubjects.schoolYearId, activeSchoolYearId))
      }

      if (subjectId) {
        conditions.push(eq(schoolSubjects.subjectId, subjectId))
      }

      // Count class_subjects for each school subject
      const result = await db
        .select({
          schoolSubjectId: schoolSubjects.id,
          subjectId: schoolSubjects.subjectId,
          subjectName: subjects.name,
          status: schoolSubjects.status,
          usageCount: sql<number>`COUNT(DISTINCT ${classSubjects.classId})`.as('usage_count'),
        })
        .from(schoolSubjects)
        .innerJoin(subjects, eq(schoolSubjects.subjectId, subjects.id))
        .leftJoin(classSubjects, eq(schoolSubjects.subjectId, classSubjects.subjectId))
        .where(and(...conditions))
        .groupBy(schoolSubjects.id, schoolSubjects.subjectId, subjects.name, schoolSubjects.status)
        .orderBy(desc(sql`usage_count`))

      return result
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch subject usage stats'),
  ).mapErr(tapLogErr(databaseLogger, options))
}

/**
 * Get school subject by ID with full details
 */
export function getSchoolSubjectById(id: string, schoolId: string): ResultAsync<SchoolSubjectWithDetails | null, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db
      .select({
        id: schoolSubjects.id,
        schoolId: schoolSubjects.schoolId,
        subjectId: schoolSubjects.subjectId,
        schoolYearId: schoolSubjects.schoolYearId,
        status: schoolSubjects.status,
        createdAt: schoolSubjects.createdAt,
        updatedAt: schoolSubjects.updatedAt,
        subject: {
          id: subjects.id,
          name: subjects.name,
          shortName: subjects.shortName,
          category: subjects.category,
        },
      })
      .from(schoolSubjects)
      .innerJoin(subjects, eq(schoolSubjects.subjectId, subjects.id))
      .where(and(
        eq(schoolSubjects.id, id),
        eq(schoolSubjects.schoolId, schoolId),
      ))
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch school subject by ID'),
  ).mapErr(tapLogErr(databaseLogger, { id, schoolId }))
}

/**
 * Check if a subject is used by any class before deactivating
 */
export function checkSubjectInUse(options: {
  schoolId: string
  subjectId: string
  schoolYearId?: string
}): ResultAsync<{
  inUse: boolean
  classCount: number
}, DatabaseError> {
  const db = getDb()
  const { schoolId, subjectId, schoolYearId } = options

  return ResultAsync.fromPromise(
    db
      .select({
        classId: classSubjects.classId,
      })
      .from(classSubjects)
      .innerJoin(
        classes,
        eq(classSubjects.classId, classes.id),
      )
      .where(and(
        eq(classSubjects.subjectId, subjectId),
        eq(classSubjects.status, 'active'),
        schoolYearId ? eq(classes.schoolYearId, schoolYearId) : sql`1=1`,
        eq(classes.schoolId, schoolId),
      ))
      .then(rows => ({
        inUse: rows.length > 0,
        classCount: rows.length,
      })),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to check subject in use'),
  ).mapErr(tapLogErr(databaseLogger, options))
}
