import type { School, SchoolInsert, SchoolStatus } from '../drizzle/core-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'

import { and, asc, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { schools } from '../drizzle/core-schema'
import { DatabaseError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

// --- Prepared Statements ---

/**
 * Lazy-loaded prepared statements for performance
 */
const prepared = {
  get getSchoolById() {
    return getDb()
      .select()
      .from(schools)
      .where(eq(schools.id, sql.placeholder('id')))
      .prepare('get_school_by_id')
  },
  get deleteSchool() {
    return getDb()
      .delete(schools)
      .where(eq(schools.id, sql.placeholder('id')))
      .prepare('delete_school')
  },
  get getSchoolProfile() {
    return getDb()
      .select()
      .from(schools)
      .where(eq(schools.id, sql.placeholder('id')))
      .limit(1)
      .prepare('get_school_profile')
  },
  get updateSchoolLogo() {
    return getDb()
      .update(schools)
      .set({ logoUrl: sql.placeholder('logoUrl') as unknown as string, updatedAt: new Date() })
      .where(eq(schools.id, sql.placeholder('id')))
      .returning()
      .prepare('update_school_logo')
  },
}

// Get all schools with pagination and filtering
export function getSchools(options: {
  page?: number
  limit?: number
  search?: string
  status?: SchoolStatus | SchoolStatus[]
  sortBy?: 'name' | 'code' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}): ResultAsync<{
  schools: School[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}, DatabaseError> {
  const db = getDb()
  const {
    page = 1,
    limit = 20,
    search,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options

  const offset = (page - 1) * limit

  // Build where conditions
  const conditions = []

  if (search) {
    conditions.push(
      or(
        ilike(schools.name, `%${search}%`),
        ilike(schools.code, `%${search}%`),
        ilike(schools.email, `%${search}%`),
      ),
    )
  }

  if (status) {
    if (Array.isArray(status)) {
      conditions.push(inArray(schools.status, status))
    }
    else {
      conditions.push(eq(schools.status, status))
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  return ResultAsync.fromPromise((async () => {
    const orderByClause
      = sortOrder === 'asc' ? asc(schools[sortBy]) : desc(schools[sortBy])

    const rows = await db
      .select({
        school: schools,
        totalCount: sql<number>`COUNT(*) OVER()`.as('total_count'),
      })
      .from(schools)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset)

    const total = rows[0]?.totalCount || 0
    const schoolsList = rows.map(({ school }) => school)

    return {
      schools: schoolsList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  })(), err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch schools'))
    .mapErr(tapLogErr(databaseLogger, options))
}

// Get a single school by ID
export function getSchoolById(id: string): ResultAsync<School | null, DatabaseError> {
  return ResultAsync.fromPromise(
    prepared.getSchoolById.execute({ id }).then(res => res[0] || null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to fetch school with id ${id}`),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

// Create a new school
export function createSchool(
  data: Omit<SchoolInsert, 'id' | 'createdAt' | 'updatedAt'>,
): ResultAsync<School, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db
      .insert(schools)
      .values({
        id: crypto.randomUUID(), // Generate UUID
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .then((res) => {
        if (!res[0])
          throw new Error('Failed to create school')
        return res[0]
      }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create school'),
  ).mapErr(tapLogErr(databaseLogger, data))
}

// Update an existing school
export function updateSchool(
  id: string,
  data: Partial<Omit<SchoolInsert, 'id' | 'createdAt' | 'updatedAt'>>,
): ResultAsync<School, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db
      .update(schools)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schools.id, id))
      .returning()
      .then((res) => {
        if (res.length === 0)
          throw new Error(`School with id ${id} not found`)
        return res[0]!
      }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to update school with id ${id}`),
  ).mapErr(tapLogErr(databaseLogger, { id, ...data }))
}

// Delete a school
export function deleteSchool(id: string): ResultAsync<void, DatabaseError> {
  return ResultAsync.fromPromise(
    prepared.deleteSchool.execute({ id }).then(() => {}),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to delete school with id ${id}`),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

// Get schools by status
export function getSchoolsByStatus(
  status: SchoolStatus,
  limit?: number,
): ResultAsync<School[], DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise((async () => {
    const query = db
      .select()
      .from(schools)
      .where(eq(schools.status, status))
      .orderBy(desc(schools.createdAt))

    if (limit) {
      query.limit(limit)
    }

    return query
  })(), err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch schools by status'))
    .mapErr(tapLogErr(databaseLogger, { status, limit }))
}

// Search schools by multiple criteria
export function searchSchools(
  query: string,
  limit: number = 10,
): ResultAsync<School[], DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db
      .select()
      .from(schools)
      .where(
        or(
          ilike(schools.name, `%${query}%`),
          ilike(schools.code, `%${query}%`),
          ilike(schools.email, `%${query}%`),
          ilike(schools.phone, `%${query}%`),
        ),
      )
      .limit(limit),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to search schools with query: ${query}`),
  ).mapErr(tapLogErr(databaseLogger, { query, limit }))
}

// Get school profile by ID with settings
export function getSchoolProfile(id: string): ResultAsync<School | null, DatabaseError> {
  return ResultAsync.fromPromise(
    prepared.getSchoolProfile.execute({ id }).then(res => res[0] || null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to fetch school profile for id ${id}`),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

// Update school profile (name, address, phone, email)
export function updateSchoolProfile(
  id: string,
  data: {
    name?: string
    address?: string | null
    phone?: string | null
    email?: string | null
  },
): ResultAsync<School | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .update(schools)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schools.id, id))
      .returning()
      .then(res => res[0] || null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to update school profile for id ${id}`),
  ).mapErr(tapLogErr(databaseLogger, { id, ...data }))
}

// Update school settings (JSONB merge)
export function updateSchoolSettings(
  id: string,
  newSettings: Record<string, unknown>,
): ResultAsync<School | null, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db
      .update(schools)
      .set({
        settings: sql`${schools.settings} || ${newSettings}::jsonb`,
        updatedAt: new Date(),
      })
      .where(eq(schools.id, id))
      .returning()
      .then(res => res[0] || null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to update school settings for id ${id}`),
  ).mapErr(tapLogErr(databaseLogger, { id, newSettings }))
}

// Update school logo
export function updateSchoolLogo(
  id: string,
  logoUrl: string | null,
): ResultAsync<School | null, DatabaseError> {
  return ResultAsync.fromPromise(
    prepared.updateSchoolLogo.execute({ id, logoUrl }).then(res => res[0] || null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to update school logo for id ${id}`),
  ).mapErr(tapLogErr(databaseLogger, { id, logoUrl }))
}

export function bulkCreateSchools(
  schoolsData: Array<Omit<SchoolInsert, 'id' | 'createdAt' | 'updatedAt'>>,
  options?: { skipDuplicates?: boolean },
): ResultAsync<{
  success: boolean
  created: School[]
  errors: Array<{ index: number, code: string, error: string }>
}, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise((async () => {
    if (schoolsData.length === 0) {
      return { success: true, created: [], errors: [] }
    }

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

    // neon-http driver doesn't support interactive transactions for conditional rollbacks.
    // We perform the bulk insert and return success status based on skipDuplicates policy.
    if (!options?.skipDuplicates && errors.length > 0) {
      return { success: false, created, errors }
    }

    return { success: true, created, errors }
  })(), err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to bulk create schools'))
    .mapErr(tapLogErr(databaseLogger, options))
}
