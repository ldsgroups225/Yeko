import type { School, SchoolInsert, SchoolStatus } from '../drizzle/core-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'

import { and, asc, count, desc, eq, ilike, inArray, or } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { schools } from '../drizzle/core-schema'
import { DatabaseError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

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

    const [[countResult], schoolsList] = await Promise.all([
      // Get total count
      db
        .select({ count: count() })
        .from(schools)
        .where(whereClause),
      // Get schools with sorting
      db
        .select()
        .from(schools)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
    ])

    const total = countResult?.count || 0

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
  const db = getDb()

  return ResultAsync.fromPromise(
    db.select().from(schools).where(eq(schools.id, id)).then(res => res[0] || null),
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
  const db = getDb()

  return ResultAsync.fromPromise(
    db.delete(schools).where(eq(schools.id, id)).then(() => {}),
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
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(schools)
      .where(eq(schools.id, id))
      .limit(1)
      .then(res => res[0] || null),
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

  return ResultAsync.fromPromise((async () => {
    // Get current settings
    const [school] = await db
      .select({ settings: schools.settings })
      .from(schools)
      .where(eq(schools.id, id))
      .limit(1)

    const currentSettings = (school?.settings as Record<string, unknown>) ?? {}
    const mergedSettings = { ...currentSettings, ...newSettings }

    const [updated] = await db
      .update(schools)
      .set({ settings: mergedSettings, updatedAt: new Date() })
      .where(eq(schools.id, id))
      .returning()
    return updated || null
  })(), err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to update school settings for id ${id}`))
    .mapErr(tapLogErr(databaseLogger, { id, newSettings }))
}

// Update school logo
export function updateSchoolLogo(
  id: string,
  logoUrl: string | null,
): ResultAsync<School | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .update(schools)
      .set({ logoUrl, updatedAt: new Date() })
      .where(eq(schools.id, id))
      .returning()
      .then(res => res[0] || null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to update school logo for id ${id}`),
  ).mapErr(tapLogErr(databaseLogger, { id, logoUrl }))
}

// Bulk create schools with transaction
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
    const created: School[] = []
    const errors: Array<{ index: number, code: string, error: string }> = []

    // Get existing codes to check for duplicates
    const codes = schoolsData.map(
      (s: Omit<SchoolInsert, 'id' | 'createdAt' | 'updatedAt'>) => s.code,
    )
    const existingSchools = await db
      .select({ code: schools.code })
      .from(schools)
      .where(inArray(schools.code, codes))

    const existingCodes = new Set(
      existingSchools.map((s: { code: string }) => s.code),
    )

    // Filter out duplicates if skipDuplicates is true
    const schoolsToCreate: Array<{
      index: number
      data: Omit<SchoolInsert, 'id' | 'createdAt' | 'updatedAt'>
    }> = []

    for (let i = 0; i < schoolsData.length; i++) {
      const school = schoolsData[i]
      if (!school)
        continue

      if (existingCodes.has(school.code)) {
        if (options?.skipDuplicates) {
          errors.push({
            index: i,
            code: school.code,
            error: getNestedErrorMessage('school', 'alreadyExists'),
          })
          continue
        }
        else {
          errors.push({
            index: i,
            code: school.code,
            error: getNestedErrorMessage('school', 'alreadyExists'),
          })
        }
      }
      else {
        schoolsToCreate.push({ index: i, data: school })
      }
    }

    // If not skipping duplicates and there are errors, return early
    if (!options?.skipDuplicates && errors.length > 0) {
      return { success: false, created: [], errors }
    }

    // Create schools
    if (schoolsToCreate.length > 0) {
      const inserted = await db
        .insert(schools)
        .values(schoolsToCreate.map(({ data }) => ({
          id: crypto.randomUUID(),
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })))
        .returning()

      if (inserted) {
        created.push(...inserted)
      }
    }

    return { success: true, created, errors }
  })(), err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to bulk create schools'))
    .mapErr(tapLogErr(databaseLogger, options))
}
