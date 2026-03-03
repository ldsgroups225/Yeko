import type { School, SchoolStatus } from '../drizzle/core-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, asc, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { schools } from '../drizzle/core-schema'
import { DatabaseError } from '../errors'

// --- Prepared Statements ---

const prepared = {
  get getSchoolById() {
    return getDb()
      .select()
      .from(schools)
      .where(eq(schools.id, sql.placeholder('id')))
      .prepare('get_school_by_id')
  },
  get getSchoolByCode() {
    return getDb()
      .select()
      .from(schools)
      .where(eq(schools.code, sql.placeholder('code')))
      .limit(1)
      .prepare('get_school_by_code')
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
}): R.ResultAsync<{ schools: School[], pagination: { page: number, limit: number, total: number, totalPages: number } }, DatabaseError> {
  const { pageNum = 1, pageSize = 20, search, status, sortBy = 'name', sortOrder = 'asc' } = { pageNum: options.page, pageSize: options.limit, ...options }
  const page = Math.max(1, pageNum)
  const limit = Math.max(1, Math.min(100, pageSize))
  const offset = (page - 1) * limit

  return R.pipe(
    R.try({
      try: async () => {
        const db = getDb()
        const conditions = []
        if (status) {
          if (Array.isArray(status))
            conditions.push(inArray(schools.status, status))
          else conditions.push(eq(schools.status, status))
        }
        if (search) {
          conditions.push(or(ilike(schools.name, `%${search}%`), ilike(schools.code, `%${search}%`), ilike(schools.email || '', `%${search}%`), ilike(schools.phone || '', `%${search}%`))!)
        }
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined
        const [totalCountResult] = await db.select({ count: sql<number>`count(*)::int` }).from(schools).where(whereClause)
        const total = totalCountResult?.count ?? 0
        const orderBy = sortOrder === 'desc' ? desc(schools[sortBy] ?? schools.name) : asc(schools[sortBy] ?? schools.name)
        const schoolsList = await db.select().from(schools).where(whereClause).orderBy(orderBy).limit(limit).offset(offset)
        return { schools: schoolsList, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch schools'),
    }),
    R.mapError(tapLogErr(databaseLogger, options)),
  )
}

export function getSchoolById(id: string): R.ResultAsync<School | null, DatabaseError> {
  return R.pipe(R.try({ try: () => prepared.getSchoolById.execute({ id }).then(res => res[0] || null), catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to fetch school ${id}`) }), R.mapError(tapLogErr(databaseLogger, { id })))
}

export function getSchoolByCode(code: string): R.ResultAsync<School | null, DatabaseError> {
  return R.pipe(R.try({ try: () => prepared.getSchoolByCode.execute({ code }).then(res => res[0] || null), catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to fetch school with code ${code}`) }), R.mapError(tapLogErr(databaseLogger, { code })))
}

export function getSchoolsByStatus(status: SchoolStatus, limit: number = 20): R.ResultAsync<School[], DatabaseError> {
  return R.pipe(R.try({ try: () => getDb().select().from(schools).where(eq(schools.status, status)).orderBy(desc(schools.createdAt)).limit(limit), catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to fetch schools by status`) }), R.mapError(tapLogErr(databaseLogger, { status })))
}

export function searchSchools(query: string, limit: number = 10): R.ResultAsync<School[], DatabaseError> {
  return R.pipe(R.try({ try: () => getDb().select().from(schools).where(or(ilike(schools.name, `%${query}%`), ilike(schools.code, `%${query}%`), ilike(schools.email || '', `%${query}%`), ilike(schools.phone || '', `%${query}%`))).limit(limit), catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', `Failed to search schools`) }), R.mapError(tapLogErr(databaseLogger, { query })))
}
