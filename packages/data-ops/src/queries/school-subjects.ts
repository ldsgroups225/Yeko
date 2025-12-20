import { and, count, desc, eq, notInArray, sql } from 'drizzle-orm'
import { getDb } from '@/database/setup'
import { subjects } from '@/drizzle/core-schema'
import { classes, classSubjects, schoolSubjects, schoolYears } from '@/drizzle/school-schema'

// ===== SCHOOL SUBJECTS =====

/**
 * Get all subjects activated for a school in a given school year
 */
export async function getSchoolSubjects(options: {
  schoolId: string
  schoolYearId?: string
  status?: 'active' | 'inactive'
  category?: 'Scientifique' | 'Littéraire' | 'Sportif' | 'Autre'
  search?: string
  page?: number
  limit?: number
}) {
  const db = getDb()
  const { schoolId, schoolYearId, status, category, search, page = 1, limit = 100 } = options
  const offset = (page - 1) * limit

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
}

/**
 * Get Core subjects that are not yet added to the school for the given year
 */
export async function getAvailableCoreSubjects(options: {
  schoolId: string
  schoolYearId?: string
  category?: 'Scientifique' | 'Littéraire' | 'Sportif' | 'Autre'
  search?: string
}) {
  const db = getDb()
  const { schoolId, schoolYearId, category, search } = options

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

  const addedSubjectIds = addedSubjects.map((s: { subjectId: string }) => s.subjectId)

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
}

/**
 * Add subjects to a school for a specific school year
 */
export async function addSubjectsToSchool(options: {
  schoolId: string
  subjectIds: string[]
  schoolYearId?: string
}) {
  const db = getDb()
  const { schoolId, subjectIds, schoolYearId } = options

  if (subjectIds.length === 0) {
    return []
  }

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
    schoolYearId: activeSchoolYearId,
    status: 'active' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  const inserted = await db
    .insert(schoolSubjects)
    .values(values)
    .onConflictDoNothing()
    .returning()

  if (!inserted) {
    throw new Error('Failed to add subjects')
  }

  return inserted
}

/**
 * Toggle school subject status (activate/deactivate)
 */
export async function toggleSchoolSubjectStatus(
  id: string,
  status: 'active' | 'inactive',
) {
  const db = getDb()

  const [updated] = await db
    .update(schoolSubjects)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(schoolSubjects.id, id))
    .returning()
  if (!updated) {
    throw new Error('Failed to toggle subject status')
  }
  return updated
}

/**
 * Delete a school subject (hard delete)
 */
export async function deleteSchoolSubject(id: string) {
  const db = getDb()
  await db.delete(schoolSubjects).where(eq(schoolSubjects.id, id))
}

/**
 * Get subject usage statistics - how many classes use this subject
 */
export async function getSubjectUsageStats(options: {
  schoolId: string
  schoolYearId?: string
  subjectId?: string
}) {
  const db = getDb()
  const { schoolId, schoolYearId, subjectId } = options

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
}

/**
 * Get school subject by ID with full details
 */
export async function getSchoolSubjectById(id: string) {
  const db = getDb()

  const [result] = await db
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
    .where(eq(schoolSubjects.id, id))

  return result || null
}

/**
 * Check if a subject is used by any class before deactivating
 */
export async function checkSubjectInUse(options: {
  schoolId: string
  subjectId: string
  schoolYearId?: string
}) {
  const db = getDb()
  const { schoolId, subjectId, schoolYearId } = options

  // Get classes using this subject
  const usage = await db
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

  return {
    inUse: usage.length > 0,
    classCount: usage.length,
  }
}
