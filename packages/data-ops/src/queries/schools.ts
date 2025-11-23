import type { School, SchoolInsert, SchoolStatus } from '@/drizzle/core-schema'
import { and, asc, count, desc, eq, inArray, like, or } from 'drizzle-orm'
import { getDb } from '@/database/setup'
import { schools } from '@/drizzle/core-schema'

// Get all schools with pagination and filtering
export async function getSchools(options: {
  page?: number
  limit?: number
  search?: string
  status?: SchoolStatus | SchoolStatus[]
  sortBy?: 'name' | 'code' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}) {
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
        like(schools.name, `%${search}%`),
        like(schools.code, `%${search}%`),
        like(schools.email, `%${search}%`),
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

  // Get total count
  const [countResult] = await db
    .select({ count: count() })
    .from(schools)
    .where(whereClause)

  const total = countResult?.count || 0

  // Get schools with sorting
  const orderByClause = sortOrder === 'asc'
    ? asc(schools[sortBy])
    : desc(schools[sortBy])

  const schoolsList = await db
    .select()
    .from(schools)
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset)

  return {
    schools: schoolsList,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// Get a single school by ID
export async function getSchoolById(id: string): Promise<School | null> {
  const db = getDb()

  const [school] = await db
    .select()
    .from(schools)
    .where(eq(schools.id, id))

  return school || null
}

// Create a new school
export async function createSchool(data: Omit<SchoolInsert, 'id' | 'createdAt' | 'updatedAt'>): Promise<School> {
  const db = getDb()

  const newSchools = await db
    .insert(schools)
    .values({
      id: crypto.randomUUID(), // Generate UUID
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()

  return newSchools[0]!
}

// Update an existing school
export async function updateSchool(
  id: string,
  data: Partial<Omit<SchoolInsert, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<School> {
  const db = getDb()

  const updatedSchools = await db
    .update(schools)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schools.id, id))
    .returning()

  if (updatedSchools.length === 0) {
    throw new Error(`School with id ${id} not found`)
  }

  return updatedSchools[0]!
}

// Delete a school
export async function deleteSchool(id: string): Promise<void> {
  const db = getDb()

  await db
    .delete(schools)
    .where(eq(schools.id, id))
}

// Get schools by status
export async function getSchoolsByStatus(status: SchoolStatus, limit?: number): Promise<School[]> {
  const db = getDb()

  const query = db
    .select()
    .from(schools)
    .where(eq(schools.status, status))
    .orderBy(desc(schools.createdAt))

  if (limit) {
    query.limit(limit)
  }

  return query
}

// Search schools by multiple criteria
export async function searchSchools(query: string, limit: number = 10): Promise<School[]> {
  const db = getDb()

  return db
    .select()
    .from(schools)
    .where(
      or(
        like(schools.name, `%${query}%`),
        like(schools.code, `%${query}%`),
        like(schools.email, `%${query}%`),
        like(schools.phone, `%${query}%`),
      ),
    )
    .limit(limit)
}
