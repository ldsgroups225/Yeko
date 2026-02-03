import type {
  EducationLevel,
  Grade,
  Serie,
  Subject,
  SubjectCategory,
  Track,
} from '../drizzle/core-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, asc, count, eq, ilike, or } from 'drizzle-orm'

import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import {
  educationLevels,
  grades,
  series,
  subjects,
  tracks,
} from '../drizzle/core-schema'
import { DatabaseError } from '../errors'

// ===== EDUCATION LEVELS =====

export function getEducationLevels(): ResultAsync<EducationLevel[], DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.select().from(educationLevels).orderBy(asc(educationLevels.order)),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch education levels'),
  ).mapErr(tapLogErr(databaseLogger, {}))
}

// ===== TRACKS =====

export function getTracks(options?: {
  educationLevelId?: number
}): ResultAsync<Track[], DatabaseError> {
  const db = getDb()
  const query = db.select().from(tracks)

  if (options?.educationLevelId) {
    query.where(eq(tracks.educationLevelId, options.educationLevelId))
  }

  return ResultAsync.fromPromise(
    query.orderBy(asc(tracks.name)),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch tracks'),
  ).mapErr(tapLogErr(databaseLogger, options || {}))
}

export function getTrackById(id: string): ResultAsync<Track | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.select().from(tracks).where(eq(tracks.id, id)).then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch track by ID'),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

export function createTrack(
  data: Omit<typeof tracks.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
): ResultAsync<Track, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .insert(tracks)
      .values({
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .then(rows => rows[0]!),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create track'),
  ).mapErr(tapLogErr(databaseLogger, data))
}

export function updateTrack(
  id: string,
  data: Partial<
    Omit<typeof tracks.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
  >,
): ResultAsync<Track, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .update(tracks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tracks.id, id))
      .returning()
      .then((rows) => {
        if (rows.length === 0) {
          throw new Error(`Track with id ${id} not found`)
        }
        return rows[0]!
      }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to update track'),
  ).mapErr(tapLogErr(databaseLogger, { id, ...data }))
}

export function deleteTrack(id: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.delete(tracks).where(eq(tracks.id, id)).then(() => {}),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete track'),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

// ===== GRADES =====

export function getGrades(options?: {
  trackId?: string
}): ResultAsync<Grade[], DatabaseError> {
  const db = getDb()
  const query = db.select().from(grades)

  if (options?.trackId) {
    query.where(eq(grades.trackId, options.trackId))
  }

  return ResultAsync.fromPromise(
    query.orderBy(asc(grades.order)),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch grades'),
  ).mapErr(tapLogErr(databaseLogger, options || {}))
}

export function getGradeById(id: string): ResultAsync<Grade | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.select().from(grades).where(eq(grades.id, id)).then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch grade by ID'),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

export function createGrade(
  data: Omit<typeof grades.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
): ResultAsync<Grade, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .insert(grades)
      .values({
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .then(rows => rows[0]!),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create grade'),
  ).mapErr(tapLogErr(databaseLogger, data))
}

export function updateGrade(
  id: string,
  data: Partial<
    Omit<typeof grades.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
  >,
): ResultAsync<Grade, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .update(grades)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(grades.id, id))
      .returning()
      .then((rows) => {
        if (rows.length === 0) {
          throw new Error(`Grade with id ${id} not found`)
        }
        return rows[0]!
      }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to update grade'),
  ).mapErr(tapLogErr(databaseLogger, { id, ...data }))
}

export function deleteGrade(id: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.delete(grades).where(eq(grades.id, id)).then(() => {}),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete grade'),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

export function bulkUpdateGradesOrder(
  items: { id: string, order: number }[],
): ResultAsync<void, DatabaseError> {
  const db = getDb()
  if (items.length === 0)
    return ResultAsync.fromPromise(Promise.resolve(), err => DatabaseError.from(err))

  return ResultAsync.fromPromise(
    Promise.all(
      items.map(item =>
        db
          .update(grades)
          .set({
            order: item.order,
            updatedAt: new Date(),
          })
          .where(eq(grades.id, item.id)),
      ),
    ).then(() => {}),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to bulk update grades order'),
  ).mapErr(tapLogErr(databaseLogger, { items }))
}

// ===== SERIES =====

export function getSeries(options?: {
  trackId?: string
}): ResultAsync<Serie[], DatabaseError> {
  const db = getDb()
  const query = db.select().from(series)

  if (options?.trackId) {
    query.where(eq(series.trackId, options.trackId))
  }

  return ResultAsync.fromPromise(
    query.orderBy(asc(series.name)),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch series'),
  ).mapErr(tapLogErr(databaseLogger, options || {}))
}

export function getSerieById(id: string): ResultAsync<Serie | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.select().from(series).where(eq(series.id, id)).then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch serie by ID'),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

export function createSerie(
  data: Omit<typeof series.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
): ResultAsync<Serie, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .insert(series)
      .values({
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .then(rows => rows[0]!),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create serie'),
  ).mapErr(tapLogErr(databaseLogger, data))
}

export function updateSerie(
  id: string,
  data: Partial<
    Omit<typeof series.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
  >,
): ResultAsync<Serie, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .update(series)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(series.id, id))
      .returning()
      .then((rows) => {
        if (rows.length === 0) {
          throw new Error(`Serie with id ${id} not found`)
        }
        return rows[0]!
      }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to update serie'),
  ).mapErr(tapLogErr(databaseLogger, { id, ...data }))
}

export function deleteSerie(id: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.delete(series).where(eq(series.id, id)).then(() => {}),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete serie'),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

export function bulkCreateSeries(
  data: Omit<typeof series.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>[],
): ResultAsync<Serie[], DatabaseError> {
  const db = getDb()
  if (data.length === 0)
    return ResultAsync.fromPromise(Promise.resolve([]), err => DatabaseError.from(err))

  const values = data.map(item => ({
    id: crypto.randomUUID(),
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  return ResultAsync.fromPromise(
    db.insert(series).values(values).returning(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to bulk create series'),
  ).mapErr(tapLogErr(databaseLogger, { data }))
}

// ===== SUBJECTS =====

export function getSubjects(options?: {
  category?: SubjectCategory
  search?: string
  page?: number
  limit?: number
}): ResultAsync<{
  subjects: Subject[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}, DatabaseError> {
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

  return ResultAsync.fromPromise(
    (async () => {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch subjects'),
  ).mapErr(tapLogErr(databaseLogger, options || {}))
}

export function getSubjectById(id: string): ResultAsync<Subject | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.select().from(subjects).where(eq(subjects.id, id)).then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch subject by ID'),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

export function createSubject(
  data: Omit<typeof subjects.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
): ResultAsync<Subject, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .insert(subjects)
      .values({
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .then(rows => rows[0]!),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create subject'),
  ).mapErr(tapLogErr(databaseLogger, data))
}

export function updateSubject(
  id: string,
  data: Partial<
    Omit<typeof subjects.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
  >,
): ResultAsync<Subject, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .update(subjects)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(subjects.id, id))
      .returning()
      .then((rows) => {
        if (rows.length === 0) {
          throw new Error(`Subject with id ${id} not found`)
        }
        return rows[0]!
      }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to update subject'),
  ).mapErr(tapLogErr(databaseLogger, { id, ...data }))
}

export function deleteSubject(id: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.delete(subjects).where(eq(subjects.id, id)).then(() => {}),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete subject'),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

export function bulkCreateSubjects(
  data: Omit<typeof subjects.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>[],
): ResultAsync<Subject[], DatabaseError> {
  const db = getDb()
  if (data.length === 0)
    return ResultAsync.fromPromise(Promise.resolve([]), err => DatabaseError.from(err))

  const values = data.map(item => ({
    id: crypto.randomUUID(),
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  return ResultAsync.fromPromise(
    db.insert(subjects).values(values).returning(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to bulk create subjects'),
  ).mapErr(tapLogErr(databaseLogger, { data }))
}

// ===== CATALOG STATS =====

export function getCatalogStats(): ResultAsync<{
  educationLevels: number
  tracks: number
  grades: number
  series: number
  subjects: number
}, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    Promise.all([
      db.select({ count: count() }).from(educationLevels),
      db.select({ count: count() }).from(tracks),
      db.select({ count: count() }).from(grades),
      db.select({ count: count() }).from(series),
      db.select({ count: count() }).from(subjects),
    ]).then(([educationLevelsCount, tracksCount, gradesCount, seriesCount, subjectsCount]) => ({
      educationLevels: educationLevelsCount[0]?.count || 0,
      tracks: tracksCount[0]?.count || 0,
      grades: gradesCount[0]?.count || 0,
      series: seriesCount[0]?.count || 0,
      subjects: subjectsCount[0]?.count || 0,
    })),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch catalog stats'),
  ).mapErr(tapLogErr(databaseLogger, {}))
}

export function getSmartCatalogData(): ResultAsync<{
  educationLevels: EducationLevel[]
  tracks: Track[]
  series: Serie[]
}, DatabaseError> {
  return ResultAsync.combine([
    getEducationLevels(),
    getTracks(),
    getSeries(),
  ]).map(([educationLevels, tracks, series]) => ({
    educationLevels,
    tracks,
    series,
  }))
}
