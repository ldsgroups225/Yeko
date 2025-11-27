import { and, desc, eq, ilike, isNull, or } from 'drizzle-orm'
import { getDb } from '@/database/setup'
import { schools } from '@/drizzle/core-schema'
import { roles, userRoles, users, userSchools } from '@/drizzle/school-schema'
import { PAGINATION, SCHOOL_ERRORS } from './constants'

export async function getUsersBySchool(schoolId: string, options?: {
  search?: string
  status?: 'active' | 'inactive' | 'suspended'
  limit?: number
  offset?: number
}) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const limit = Math.min(options?.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT)
  const offset = options?.offset || 0

  const conditions = [
    eq(userSchools.schoolId, schoolId),
    isNull(users.deletedAt),
  ]

  if (options?.status) {
    conditions.push(eq(users.status, options.status))
  }

  if (options?.search) {
    conditions.push(
      or(
        ilike(users.name, `%${options.search}%`),
        ilike(users.email, `%${options.search}%`),
      )!,
    )
  }

  const db = getDb()

  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      avatarUrl: users.avatarUrl,
      status: users.status,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .innerJoin(userSchools, eq(users.id, userSchools.userId))
    .where(and(...conditions))
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset)
}

export async function getUserById(userId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const result = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      avatarUrl: users.avatarUrl,
      status: users.status,
      authUserId: users.authUserId,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .innerJoin(userSchools, eq(users.id, userSchools.userId))
    .where(and(
      eq(users.id, userId),
      eq(userSchools.schoolId, schoolId),
      isNull(users.deletedAt),
    ))
    .limit(1)

  return result[0] || null
}

export async function getUserWithRoles(userId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const user = await getUserById(userId, schoolId)
  if (!user) {
    throw new Error(SCHOOL_ERRORS.USER_NOT_FOUND)
  }

  const db = getDb()

  const userRolesList = await db
    .select({
      roleId: roles.id,
      roleName: roles.name,
      roleSlug: roles.slug,
      permissions: roles.permissions,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(and(
      eq(userRoles.userId, userId),
      eq(userRoles.schoolId, schoolId),
    ))

  return {
    ...user,
    roles: userRolesList,
  }
}

export async function createUserWithSchool(data: {
  email: string
  name: string
  authUserId: string
  schoolId: string
  roleIds: string[]
  phone?: string
  avatarUrl?: string
}) {
  if (!data.schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  return db.transaction(async (tx: any) => {
    // Create user
    const [user] = await tx.insert(users).values({
      id: crypto.randomUUID(),
      email: data.email,
      name: data.name,
      authUserId: data.authUserId,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      status: 'active',
    }).returning()

    // Link to school
    await tx.insert(userSchools).values({
      id: crypto.randomUUID(),
      userId: user.id,
      schoolId: data.schoolId,
    })

    // Assign roles
    if (data.roleIds.length > 0) {
      await tx.insert(userRoles).values(
        data.roleIds.map(roleId => ({
          id: crypto.randomUUID(),
          userId: user.id,
          roleId,
          schoolId: data.schoolId,
        })),
      )
    }

    return user
  })
}

export async function updateUser(userId: string, schoolId: string, data: {
  name?: string
  phone?: string
  avatarUrl?: string
  status?: 'active' | 'inactive' | 'suspended'
}) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  // Verify user belongs to school
  const user = await getUserById(userId, schoolId)
  if (!user) {
    throw new Error(SCHOOL_ERRORS.USER_NOT_FOUND)
  }

  const db = getDb()

  const [updated] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning()

  return updated
}

export async function deleteUser(userId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  // Verify user belongs to school
  const user = await getUserById(userId, schoolId)
  if (!user) {
    throw new Error(SCHOOL_ERRORS.USER_NOT_FOUND)
  }

  const db = getDb()

  // Soft delete
  const [deleted] = await db
    .update(users)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning()

  return deleted
}

export async function assignRolesToUser(userId: string, schoolId: string, roleIds: string[]) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  return db.transaction(async (tx: any) => {
    // Remove existing roles for this school
    await tx.delete(userRoles).where(and(
      eq(userRoles.userId, userId),
      eq(userRoles.schoolId, schoolId),
    ))

    // Add new roles
    if (roleIds.length > 0) {
      await tx.insert(userRoles).values(
        roleIds.map(roleId => ({
          id: crypto.randomUUID(),
          userId,
          roleId,
          schoolId,
        })),
      )
    }

    return getUserWithRoles(userId, schoolId)
  })
}

export async function getUserSchoolsByUserId(userId: string) {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const db = getDb()

  return db
    .select({
      id: schools.id,
      name: schools.name,
      code: schools.code,
      status: schools.status,
      logoUrl: schools.logoUrl,
    })
    .from(userSchools)
    .innerJoin(schools, eq(userSchools.schoolId, schools.id))
    .innerJoin(users, eq(userSchools.userId, users.id))
    .where(and(
      eq(userSchools.userId, userId),
      isNull(users.deletedAt),
      eq(schools.status, 'active'),
    ))
    .orderBy(schools.name)
}
