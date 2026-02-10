import type {
  EducationLevel,
  Grade,
  Serie,
  Subject,
  SubjectCategory,
  Track,
} from '../drizzle/core-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'

import { and, asc, count, eq, ilike, or } from 'drizzle-orm'
import { getDb } from '../database/setup'
import {
  educationLevels,
  grades,
  series,
  subjects,
  tracks,
} from '../drizzle/core-schema'
import { DatabaseError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

// ===== EDUCATION LEVELS =====

export async function getEducationLevels(): R.ResultAsync<EducationLevel[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        return await db.select().from(educationLevels).orderBy(asc(educationLevels.order))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'educationLevels.fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, {})),
  )
}

// ===== TRACKS =====

export async function getTracks(options?: {
  educationLevelId?: number
}): R.ResultAsync<Track[], DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const query = db.select().from(tracks)

        if (options?.educationLevelId) {
          query.where(eq(tracks.educationLevelId, options.educationLevelId))
        }

        return await query.orderBy(asc(tracks.name))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'tracks.fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, options || {})),
  )
}

export async function getTrackById(id: string): R.ResultAsync<Track | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db.select().from(tracks).where(eq(tracks.id, id))
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'tracks.fetchByIdFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id })),
  )
}

export async function createTrack(
  data: Omit<typeof tracks.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
): R.ResultAsync<Track, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [row] = await db
          .insert(tracks)
          .values({
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()
        if (!row)
          throw new Error('Failed to create track')
        return row
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'tracks.createFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, data)),
  )
}

export async function updateTrack(
  id: string,
  data: Partial<
    Omit<typeof tracks.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
  >,
): R.ResultAsync<Track, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [row] = await db
          .update(tracks)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(tracks.id, id))
          .returning()

        if (!row) {
          throw new Error(`Track with id ${id} not found`)
        }
        return row
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'tracks.updateFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id, ...data })),
  )
}

export async function deleteTrack(id: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        await db.delete(tracks).where(eq(tracks.id, id))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'tracks.deleteFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id })),
  )
}

// ===== GRADES =====

export async function getGrades(options?: {
  trackId?: string
}): R.ResultAsync<Grade[], DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const query = db.select().from(grades)

        if (options?.trackId) {
          query.where(eq(grades.trackId, options.trackId))
        }

        return await query.orderBy(asc(grades.order))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'grades.fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, options || {})),
  )
}

export async function getGradeById(id: string): R.ResultAsync<Grade | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db.select().from(grades).where(eq(grades.id, id))
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'grades.fetchByIdFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id })),
  )
}

export async function createGrade(
  data: Omit<typeof grades.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
): R.ResultAsync<Grade, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [row] = await db
          .insert(grades)
          .values({
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()
        if (!row)
          throw new Error('Failed to create grade')
        return row
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'grades.createFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, data)),
  )
}

export async function updateGrade(
  id: string,
  data: Partial<
    Omit<typeof grades.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
  >,
): R.ResultAsync<Grade, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [row] = await db
          .update(grades)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(grades.id, id))
          .returning()

        if (!row) {
          throw new Error(`Grade with id ${id} not found`)
        }
        return row
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'grades.updateFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id, ...data })),
  )
}

export async function deleteGrade(id: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        await db.delete(grades).where(eq(grades.id, id))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'grades.deleteFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id })),
  )
}

export async function bulkUpdateGradesOrder(
  items: { id: string, order: number }[],
): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  if (items.length === 0)
    return R.succeed(undefined)

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
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
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'grades.bulkUpdateOrderFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { items })),
  )
}

// ===== SERIES =====

export async function getSeries(options?: {
  trackId?: string
}): R.ResultAsync<Serie[], DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const query = db.select().from(series)

        if (options?.trackId) {
          query.where(eq(series.trackId, options.trackId))
        }

        return await query.orderBy(asc(series.name))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'series.fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, options || {})),
  )
}

export async function getSerieById(id: string): R.ResultAsync<Serie | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db.select().from(series).where(eq(series.id, id))
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'series.fetchByIdFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id })),
  )
}

export async function createSerie(
  data: Omit<typeof series.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
): R.ResultAsync<Serie, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [row] = await db
          .insert(series)
          .values({
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()
        if (!row)
          throw new Error('Failed to create serie')
        return row
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'series.createFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, data)),
  )
}

export async function updateSerie(
  id: string,
  data: Partial<
    Omit<typeof series.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
  >,
): R.ResultAsync<Serie, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [row] = await db
          .update(series)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(series.id, id))
          .returning()

        if (!row) {
          throw new Error(`Serie with id ${id} not found`)
        }
        return row
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'series.updateFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id, ...data })),
  )
}

export async function deleteSerie(id: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        await db.delete(series).where(eq(series.id, id))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'series.deleteFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id })),
  )
}

export async function bulkCreateSeries(
  data: Omit<typeof series.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>[],
): R.ResultAsync<Serie[], DatabaseError> {
  const db = getDb()
  if (data.length === 0)
    return R.succeed([])

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const values = data.map(item => ({
          id: crypto.randomUUID(),
          ...item,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))

        return await db.insert(series).values(values).returning()
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'series.bulkCreateFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { data })),
  )
}

// ===== SUBJECTS =====

export async function getSubjects(options?: {
  category?: SubjectCategory
  search?: string
  page?: number
  limit?: number
}): R.ResultAsync<{
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

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
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
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'subjects.fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, options || {})),
  )
}

export async function getSubjectById(id: string): R.ResultAsync<Subject | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db.select().from(subjects).where(eq(subjects.id, id))
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'subjects.fetchByIdFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id })),
  )
}

export async function createSubject(
  data: Omit<typeof subjects.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
): R.ResultAsync<Subject, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [row] = await db
          .insert(subjects)
          .values({
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()
        if (!row)
          throw new Error('Failed to create subject')
        return row
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'subjects.createFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, data)),
  )
}

export async function updateSubject(
  id: string,
  data: Partial<
    Omit<typeof subjects.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
  >,
): R.ResultAsync<Subject, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [row] = await db
          .update(subjects)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(subjects.id, id))
          .returning()

        if (!row) {
          throw new Error(`Subject with id ${id} not found`)
        }
        return row
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'subjects.updateFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id, ...data })),
  )
}

export async function deleteSubject(id: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        await db.delete(subjects).where(eq(subjects.id, id))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'subjects.deleteFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id })),
  )
}

export async function bulkCreateSubjects(
  data: Omit<typeof subjects.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>[],
): R.ResultAsync<Subject[], DatabaseError> {
  const db = getDb()
  if (data.length === 0)
    return R.succeed([])

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const values = data.map(item => ({
          id: crypto.randomUUID(),
          ...item,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))

        return await db.insert(subjects).values(values).returning()
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'subjects.bulkCreateFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { data })),
  )
}

// ===== CATALOG STATS =====

export async function getCatalogStats(): R.ResultAsync<{
  educationLevels: number
  tracks: number
  grades: number
  series: number
  subjects: number
}, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [educationLevelsCount, tracksCount, gradesCount, seriesCount, subjectsCount] = await Promise.all([
          db.select({ count: count() }).from(educationLevels),
          db.select({ count: count() }).from(tracks),
          db.select({ count: count() }).from(grades),
          db.select({ count: count() }).from(series),
          db.select({ count: count() }).from(subjects),
        ])

        return {
          educationLevels: educationLevelsCount[0]?.count || 0,
          tracks: tracksCount[0]?.count || 0,
          grades: gradesCount[0]?.count || 0,
          series: seriesCount[0]?.count || 0,
          subjects: subjectsCount[0]?.count || 0,
        }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'stats.fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, {})),
  )
}

/**
 * Get catalog data (education levels, tracks, series) in a smart way.
 * This is used to hydrate forms and lists with catalog data.
 */
export async function getSmartCatalogData(): R.ResultAsync<{
  educationLevels: EducationLevel[]
  tracks: Track[]
  series: Serie[]
}, DatabaseError> {
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [educationLevelsRes, tracksRes, seriesRes] = await Promise.all([
          getEducationLevels(),
          getTracks(),
          getSeries(),
        ])

        const educationLevels = R.unwrap(educationLevelsRes)
        const tracks = R.unwrap(tracksRes)
        const series = R.unwrap(seriesRes)

        return {
          educationLevels,
          tracks,
          series,
        }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('catalogs', 'smartCatalog.fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, {})),
  )
}
