import type { School, SchoolInsert } from '../drizzle/core-schema'
import crypto from 'node:crypto'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { eq, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { schools } from '../drizzle/core-schema'
import { DatabaseError, dbError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

// Create a new school
export function createSchool(
  data: Omit<SchoolInsert, 'id' | 'createdAt' | 'updatedAt'>,
): R.ResultAsync<School, DatabaseError> {
  return R.pipe(
    R.try({
      try: () => {
        const db = getDb()
        return db
          .insert(schools)
          .values({
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()
          .then((res) => {
            const createdSchool = res[0]
            if (!createdSchool) {
              throw dbError('INTERNAL_ERROR', 'Failed to create school')
            }
            return createdSchool
          })
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create school'),
    }),
    R.mapError(tapLogErr(databaseLogger, data)),
  )
}

// Update an existing school
export function updateSchool(
  id: string,
  data: Partial<Omit<SchoolInsert, 'id' | 'createdAt' | 'updatedAt'>>,
): R.ResultAsync<School, DatabaseError> {
  return R.pipe(
    R.try({
      try: () => {
        const db = getDb()
        return db
          .update(schools)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(schools.id, id))
          .returning()
          .then((res) => {
            const updatedSchool = res[0]
            if (!updatedSchool) {
              throw dbError('NOT_FOUND', `School with id ${id} not found`)
            }
            return updatedSchool
          })
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to update school'),
    }),
    R.mapError(tapLogErr(databaseLogger, { id, data })),
  )
}

// Delete a school
export function deleteSchool(id: string): R.ResultAsync<void, DatabaseError> {
  return R.pipe(
    R.try({
      try: () => {
        const db = getDb()
        return db.delete(schools).where(eq(schools.id, id)).then(() => undefined)
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete school'),
    }),
    R.mapError(tapLogErr(databaseLogger, { id })),
  )
}

export async function bulkCreateSchools(
  schoolsData: Array<Omit<SchoolInsert, 'id' | 'createdAt' | 'updatedAt'>>,
  options?: { skipDuplicates?: boolean },
): R.ResultAsync<
  { success: boolean, created: School[], errors: Array<{ index: number, code: string, error: string }> },
  DatabaseError
> {
  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()
        if (schoolsData.length === 0)
          return { success: true, created: [], errors: [] }
        const schoolsToInsert = schoolsData.map(data => ({
          id: crypto.randomUUID(),
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        const inserted = await db
          .insert(schools)
          .values(schoolsToInsert)
          .onConflictDoNothing({ target: schools.code })
          .returning()
        const created = inserted || []
        const insertedCodes = new Set(created.map(s => s.code))
        const errors: Array<{ index: number, code: string, error: string }> = []
        if (created.length < schoolsData.length) {
          for (let i = 0; i < schoolsData.length; i++) {
            const school = schoolsData[i]
            if (school && !insertedCodes.has(school.code)) {
              errors.push({
                index: i,
                code: school.code,
                error: getNestedErrorMessage('school', 'alreadyExists'),
              })
            }
          }
        }
        if (!options?.skipDuplicates && errors.length > 0)
          return { success: false, created, errors }
        return { success: true, created, errors }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to bulk create schools'),
    }),
    R.mapError(tapLogErr(databaseLogger, options)),
  )
}

export function updateSchoolProfile(id: string, data: { name?: string, address?: string | null, phone?: string | null, email?: string | null }): R.ResultAsync<School | null, DatabaseError> {
  return R.pipe(R.try({ try: () => getDb().update(schools).set({ ...data, updatedAt: new Date() }).where(eq(schools.id, id)).returning().then(res => res[0] || null), catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to update profile for ${id}`) }), R.mapError(tapLogErr(databaseLogger, { id, ...data })))
}

export function updateSchoolSettings(id: string, newSettings: Record<string, unknown>): R.ResultAsync<School | null, DatabaseError> {
  return R.pipe(R.try({ try: () => getDb().update(schools).set({ settings: sql`${schools.settings} || ${newSettings}::jsonb`, updatedAt: new Date() }).where(eq(schools.id, id)).returning().then(res => res[0] || null), catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to update settings for ${id}`) }), R.mapError(tapLogErr(databaseLogger, { id, newSettings })))
}

// Update school logo
export function updateSchoolLogo(
  id: string,
  logoUrl: string | null,
): R.ResultAsync<School | null, DatabaseError> {
  return R.pipe(
    R.try({
      try: () => {
        const db = getDb()
        return db
          .update(schools)
          .set({ logoUrl, updatedAt: new Date() })
          .where(eq(schools.id, id))
          .returning()
          .then(res => res[0] || null)
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to update logo for school ${id}`),
    }),
    R.mapError(tapLogErr(databaseLogger, { id, logoUrl })),
  )
}
