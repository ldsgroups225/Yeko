import { and, count, desc, eq, ilike, or } from 'drizzle-orm'
import { getDb } from '@/database/setup'
import { staff, users } from '@/drizzle/school-schema'
import { PAGINATION, SCHOOL_ERRORS } from './constants'

export async function getStaffBySchool(
  schoolId: string,
  options?: {
    search?: string
    position?: string
    status?: 'active' | 'inactive' | 'on_leave'
    limit?: number
    offset?: number
  },
) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const limit = Math.min(options?.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT)
  const offset = options?.offset || 0

  const conditions = [eq(staff.schoolId, schoolId)]

  if (options?.status) {
    conditions.push(eq(staff.status, options.status))
  }

  if (options?.position) {
    conditions.push(eq(staff.position, options.position))
  }

  if (options?.search) {
    conditions.push(or(ilike(users.name, `%${options.search}%`), ilike(users.email, `%${options.search}%`))!)
  }

  return db
    .select({
      id: staff.id,
      userId: staff.userId,
      schoolId: staff.schoolId,
      position: staff.position,
      department: staff.department,
      hireDate: staff.hireDate,
      status: staff.status,
      createdAt: staff.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
      },
    })
    .from(staff)
    .innerJoin(users, eq(staff.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(staff.createdAt))
    .limit(limit)
    .offset(offset)
}

export async function getStaffById(staffId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const result = await db.select().from(staff).where(and(eq(staff.id, staffId), eq(staff.schoolId, schoolId))).limit(1)

  return result[0] || null
}

export async function createStaff(data: {
  userId: string
  schoolId: string
  position: string
  department?: string
  hireDate?: Date
}) {
  if (!data.schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const [newStaff] = await db
    .insert(staff)
    .values({
      id: crypto.randomUUID(),
      userId: data.userId,
      schoolId: data.schoolId,
      position: data.position,
      department: data.department,
      hireDate: data.hireDate,
      status: 'active',
    })
    .returning()

  return newStaff
}

export async function updateStaff(
  staffId: string,
  schoolId: string,
  data: {
    position?: string
    department?: string
    hireDate?: Date
    status?: 'active' | 'inactive' | 'on_leave'
  },
) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // Verify staff belongs to school
  const staffMember = await getStaffById(staffId, schoolId)
  if (!staffMember) {
    throw new Error(SCHOOL_ERRORS.USER_NOT_FOUND)
  }

  const [updated] = await db
    .update(staff)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(staff.id, staffId))
    .returning()

  return updated
}

export async function deleteStaff(staffId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // Verify staff belongs to school
  const staffMember = await getStaffById(staffId, schoolId)
  if (!staffMember) {
    throw new Error(SCHOOL_ERRORS.USER_NOT_FOUND)
  }

  // Hard delete
  await db.delete(staff).where(eq(staff.id, staffId))

  return { success: true }
}

// Phase 11: Count staff for pagination
export async function countStaffBySchool(
  schoolId: string,
  options?: {
    search?: string
    position?: string
    status?: 'active' | 'inactive' | 'on_leave'
  },
) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const conditions = [eq(staff.schoolId, schoolId)]

  if (options?.status) {
    conditions.push(eq(staff.status, options.status))
  }

  if (options?.position) {
    conditions.push(eq(staff.position, options.position))
  }

  if (options?.search) {
    conditions.push(or(ilike(users.name, `%${options.search}%`), ilike(users.email, `%${options.search}%`))!)
  }

  const [result] = await db
    .select({ count: count() })
    .from(staff)
    .innerJoin(users, eq(staff.userId, users.id))
    .where(and(...conditions))

  return result?.count || 0
}
