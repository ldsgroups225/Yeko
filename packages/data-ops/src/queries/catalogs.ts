import type {
  EducationLevel,
  Grade,
  Serie,
  Subject,
  SubjectCategory,
  Track,
} from '../drizzle/core-schema'
import { and, asc, count, eq, ilike, or } from 'drizzle-orm'
import { getDb } from '../database/setup'
import {
  educationLevels,
  grades,
  series,
  subjects,
  tracks,
} from '../drizzle/core-schema'

// ===== EDUCATION LEVELS =====

export async function getEducationLevels(): Promise<EducationLevel[]> {
  const db = getDb()
  return db.select().from(educationLevels).orderBy(asc(educationLevels.order))
}

// ===== TRACKS =====

export async function getTracks(options?: {
  educationLevelId?: number
}): Promise<Track[]> {
  const db = getDb()
  const query = db.select().from(tracks)

  if (options?.educationLevelId) {
    query.where(eq(tracks.educationLevelId, options.educationLevelId))
  }

  return query.orderBy(asc(tracks.name))
}

export async function getTrackById(id: string): Promise<Track | null> {
  const db = getDb()
  const [track] = await db.select().from(tracks).where(eq(tracks.id, id))
  return track || null
}

export async function createTrack(
  data: Omit<typeof tracks.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Track> {
  const db = getDb()
  const [newTrack] = await db
    .insert(tracks)
    .values({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()
  return newTrack!
}

export async function updateTrack(
  id: string,
  data: Partial<
    Omit<typeof tracks.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
  >,
): Promise<Track> {
  const db = getDb()
  const [updatedTrack] = await db
    .update(tracks)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(tracks.id, id))
    .returning()

  if (!updatedTrack) {
    throw new Error(`Track with id ${id} not found`)
  }

  return updatedTrack
}

export async function deleteTrack(id: string): Promise<void> {
  const db = getDb()
  await db.delete(tracks).where(eq(tracks.id, id))
}

// ===== GRADES =====

export async function getGrades(options?: {
  trackId?: string
}): Promise<Grade[]> {
  const db = getDb()
  const query = db.select().from(grades)

  if (options?.trackId) {
    query.where(eq(grades.trackId, options.trackId))
  }

  return query.orderBy(asc(grades.order))
}

export async function getGradeById(id: string): Promise<Grade | null> {
  const db = getDb()
  const [grade] = await db.select().from(grades).where(eq(grades.id, id))
  return grade || null
}

export async function createGrade(
  data: Omit<typeof grades.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Grade> {
  const db = getDb()
  const [newGrade] = await db
    .insert(grades)
    .values({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()
  return newGrade!
}

export async function updateGrade(
  id: string,
  data: Partial<
    Omit<typeof grades.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
  >,
): Promise<Grade> {
  const db = getDb()
  const [updatedGrade] = await db
    .update(grades)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(grades.id, id))
    .returning()

  if (!updatedGrade) {
    throw new Error(`Grade with id ${id} not found`)
  }

  return updatedGrade
}

export async function deleteGrade(id: string): Promise<void> {
  const db = getDb()
  await db.delete(grades).where(eq(grades.id, id))
}

export async function bulkUpdateGradesOrder(
  items: { id: string, order: number }[],
): Promise<void> {
  const db = getDb()
  if (items.length === 0)
    return

  await Promise.all(
    items.map(item =>
      db
        .update(grades)
        .set({
          order: item.order,
          updatedAt: new Date(),
        })
        .where(eq(grades.id, item.id)),
    ),
  )
}

// ===== SERIES =====

export async function getSeries(options?: {
  trackId?: string
}): Promise<Serie[]> {
  const db = getDb()
  const query = db.select().from(series)

  if (options?.trackId) {
    query.where(eq(series.trackId, options.trackId))
  }

  return query.orderBy(asc(series.name))
}

export async function getSerieById(id: string): Promise<Serie | null> {
  const db = getDb()
  const [serie] = await db.select().from(series).where(eq(series.id, id))
  return serie || null
}

export async function createSerie(
  data: Omit<typeof series.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Serie> {
  const db = getDb()
  const [newSerie] = await db
    .insert(series)
    .values({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()
  return newSerie!
}

export async function updateSerie(
  id: string,
  data: Partial<
    Omit<typeof series.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
  >,
): Promise<Serie> {
  const db = getDb()
  const [updatedSerie] = await db
    .update(series)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(series.id, id))
    .returning()

  if (!updatedSerie) {
    throw new Error(`Serie with id ${id} not found`)
  }

  return updatedSerie
}

export async function deleteSerie(id: string): Promise<void> {
  const db = getDb()
  await db.delete(series).where(eq(series.id, id))
}

export async function bulkCreateSeries(
  data: Omit<typeof series.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>[],
): Promise<Serie[]> {
  const db = getDb()
  if (data.length === 0)
    return []

  const values = data.map(item => ({
    id: crypto.randomUUID(),
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  const newSeries = await db.insert(series).values(values).returning()

  return newSeries
}

// ===== SUBJECTS =====

export async function getSubjects(options?: {
  category?: SubjectCategory
  search?: string
  page?: number
  limit?: number
}): Promise<{
  subjects: Subject[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}> {
  const db = getDb()
  const { category, search, page = 1, limit = 20 } = options || {}
  const offset = (page - 1) * limit

  // Build where conditions
  const conditions = []

  if (category) {
    conditions.push(eq(subjects.category, category))
  }

  if (search) {
    conditions.push(
      or(
        ilike(subjects.name, `%${search}%`),
        ilike(subjects.shortName, `%${search}%`),
      ),
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Get total count
  const [countResult] = await db
    .select({ count: count() })
    .from(subjects)
    .where(whereClause)

  const total = countResult?.count || 0

  // Get subjects with stable ordering
  const subjectsList = await db
    .select()
    .from(subjects)
    .where(whereClause)
    .orderBy(asc(subjects.name), asc(subjects.id)) // Add id as secondary sort for stability
    .limit(limit)
    .offset(offset)

  return {
    subjects: subjectsList,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getSubjectById(id: string): Promise<Subject | null> {
  const db = getDb()
  const [subject] = await db.select().from(subjects).where(eq(subjects.id, id))
  return subject || null
}

export async function createSubject(
  data: Omit<typeof subjects.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Subject> {
  const db = getDb()
  const [newSubject] = await db
    .insert(subjects)
    .values({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()
  return newSubject!
}

export async function updateSubject(
  id: string,
  data: Partial<
    Omit<typeof subjects.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
  >,
): Promise<Subject> {
  const db = getDb()
  const [updatedSubject] = await db
    .update(subjects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(subjects.id, id))
    .returning()

  if (!updatedSubject) {
    throw new Error(`Subject with id ${id} not found`)
  }

  return updatedSubject
}

export async function deleteSubject(id: string): Promise<void> {
  const db = getDb()
  await db.delete(subjects).where(eq(subjects.id, id))
}

export async function bulkCreateSubjects(
  data: Omit<typeof subjects.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>[],
): Promise<Subject[]> {
  const db = getDb()
  if (data.length === 0)
    return []

  const values = data.map(item => ({
    id: crypto.randomUUID(),
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  const newSubjects = await db.insert(subjects).values(values).returning()

  return newSubjects
}

// ===== CATALOG STATS =====

export async function getCatalogStats() {
  const db = getDb()

  const [educationLevelsCount] = await db
    .select({ count: count() })
    .from(educationLevels)
  const [tracksCount] = await db.select({ count: count() }).from(tracks)
  const [gradesCount] = await db.select({ count: count() }).from(grades)
  const [seriesCount] = await db.select({ count: count() }).from(series)
  const [subjectsCount] = await db.select({ count: count() }).from(subjects)

  return {
    educationLevels: educationLevelsCount?.count || 0,
    tracks: tracksCount?.count || 0,
    grades: gradesCount?.count || 0,
    series: seriesCount?.count || 0,
    subjects: subjectsCount?.count || 0,
  }
}

export async function getSmartCatalogData(): Promise<{
  educationLevels: EducationLevel[]
  tracks: Track[]
  series: Serie[]
}> {
  const [educationLevels, tracks, series] = await Promise.all([
    getEducationLevels(),
    getTracks(),
    getSeries(),
  ])

  return {
    educationLevels,
    tracks,
    series,
  }
}
