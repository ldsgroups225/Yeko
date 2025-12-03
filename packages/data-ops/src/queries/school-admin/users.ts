import { and, count, desc, eq, ilike, inArray, isNull, or, sql } from 'drizzle-orm'
import { getDb } from '@/database/setup'
import { schools } from '@/drizzle/core-schema'
import { auditLogs, roles, userRoles, users, userSchools } from '@/drizzle/school-schema'
import { PAGINATION, SCHOOL_ERRORS } from './constants'

export async function getUsersBySchool(schoolId: string, options?: {
  search?: string
  status?: 'active' | 'inactive' | 'suspended'
  roleId?: string
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
        ilike(users.phone, `%${options.search}%`),
      )!,
    )
  }

  const db = getDb()

  // Build query with role aggregation
  const query = db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      avatarUrl: users.avatarUrl,
      status: users.status,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      roles: sql<string[]>`COALESCE(array_agg(DISTINCT ${roles.name}) FILTER (WHERE ${roles.name} IS NOT NULL), ARRAY[]::text[])`,
    })
    .from(users)
    .innerJoin(userSchools, eq(users.id, userSchools.userId))
    .leftJoin(userRoles, and(eq(userRoles.userId, users.id), eq(userRoles.schoolId, schoolId)))
    .leftJoin(roles, eq(roles.id, userRoles.roleId))
    .where(and(...conditions))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset)

  return query
}

// Phase 11: Count users for pagination
export async function countUsersBySchool(schoolId: string, options?: {
  search?: string
  status?: 'active' | 'inactive' | 'suspended'
  roleId?: string
}) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

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
        ilike(users.phone, `%${options.search}%`),
      )!,
    )
  }

  const db = getDb()

  const [result] = await db
    .select({ count: count() })
    .from(users)
    .innerJoin(userSchools, eq(users.id, userSchools.userId))
    .where(and(...conditions))

  return result?.count || 0
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
  authUserId: string | null
  schoolId: string
  roleIds: string[]
  phone?: string
  avatarUrl?: string
}) {
  if (!data.schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // Note: neon-http driver doesn't support transactions
  // Create user
  const [user] = await db.insert(users).values({
    id: crypto.randomUUID(),
    email: data.email,
    name: data.name,
    authUserId: data.authUserId,
    phone: data.phone,
    avatarUrl: data.avatarUrl,
    status: 'active',
  }).returning()

  // Link to school
  await db.insert(userSchools).values({
    id: crypto.randomUUID(),
    userId: user.id,
    schoolId: data.schoolId,
  })

  // Assign roles
  if (data.roleIds.length > 0) {
    await db.insert(userRoles).values(
      data.roleIds.map(roleId => ({
        id: crypto.randomUUID(),
        userId: user.id,
        roleId,
        schoolId: data.schoolId,
      })),
    )
  }

  return user
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

/**
 * Get schools by auth user ID (Better Auth user ID)
 * This is used to get schools for the currently logged-in user
 */
export async function getUserSchoolsByAuthUserId(authUserId: string) {
  if (!authUserId) {
    throw new Error('Auth User ID is required')
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
      eq(users.authUserId, authUserId),
      isNull(users.deletedAt),
      eq(schools.status, 'active'),
    ))
    .orderBy(schools.name)
}

/**
 * Get user permissions for a specific school
 * Returns merged permissions from all user roles
 */
export async function getUserPermissionsBySchool(userId: string, schoolId: string) {
  if (!userId || !schoolId) {
    return {}
  }

  const db = getDb()

  try {
    // Get user's roles for this school with permissions
    const userRolesWithPermissions = await db
      .select({
        permissions: roles.permissions,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.schoolId, schoolId),
        ),
      )

    // Merge permissions from all roles
    const mergedPermissions: Record<string, string[]> = {}

    for (const roleData of userRolesWithPermissions) {
      const perms = roleData.permissions as Record<string, string[]>
      for (const [resource, actions] of Object.entries(perms)) {
        if (!mergedPermissions[resource]) {
          mergedPermissions[resource] = []
        }
        // Add unique actions
        for (const action of actions) {
          if (!mergedPermissions[resource]?.includes(action)) {
            mergedPermissions[resource]?.push(action)
          }
        }
      }
    }

    return mergedPermissions
  }
  catch (error) {
    console.error('Error fetching user permissions:', error)
    return {}
  }
}

// Phase 11: Bulk update users status
export async function bulkUpdateUsersStatus(
  userIds: string[],
  schoolId: string,
  status: 'active' | 'inactive' | 'suspended',
  performedBy: string,
) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  if (userIds.length === 0) {
    return { success: 0, failed: 0 }
  }

  const db = getDb()

  return db.transaction(async (tx: any) => {
    // Update users
    const updated = await tx
      .update(users)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(inArray(users.id, userIds))
      .returning()

    // Log audit for each user
    for (const user of updated) {
      await tx.insert(auditLogs).values({
        id: crypto.randomUUID(),
        schoolId,
        userId: performedBy,
        action: 'update',
        tableName: 'users',
        recordId: user.id,
        oldValues: { status: user.status },
        newValues: { status },
        createdAt: new Date(),
      })
    }

    return { success: updated.length, failed: userIds.length - updated.length }
  })
}

// Phase 11: Bulk delete users (soft delete)
export async function bulkDeleteUsers(userIds: string[], schoolId: string, performedBy: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  if (userIds.length === 0) {
    return { success: 0, failed: 0 }
  }

  const db = getDb()

  return db.transaction(async (tx: any) => {
    // Soft delete users
    const deleted = await tx
      .update(users)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(inArray(users.id, userIds))
      .returning()

    // Log audit for each user
    for (const user of deleted) {
      await tx.insert(auditLogs).values({
        id: crypto.randomUUID(),
        schoolId,
        userId: performedBy,
        action: 'delete',
        tableName: 'users',
        recordId: user.id,
        oldValues: { deletedAt: null },
        newValues: { deletedAt: new Date() },
        createdAt: new Date(),
      })
    }

    return { success: deleted.length, failed: userIds.length - deleted.length }
  })
}

// Phase 11: Check email uniqueness within school
export async function checkEmailUniqueness(email: string, schoolId: string, excludeUserId?: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const conditions = [eq(users.email, email), isNull(users.deletedAt)]

  if (excludeUserId) {
    conditions.push(sql`${users.id} != ${excludeUserId}`)
  }

  const [result] = await db
    .select({ count: count() })
    .from(users)
    .innerJoin(userSchools, eq(users.id, userSchools.userId))
    .where(and(eq(userSchools.schoolId, schoolId), ...conditions))

  return (result?.count || 0) === 0
}

// Phase 11: Get available users for teacher assignment (users not yet teachers)
export async function getAvailableUsersForTeacher(schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
    })
    .from(users)
    .innerJoin(userSchools, eq(users.id, userSchools.userId))
    .leftJoin(sql`(SELECT user_id FROM teachers WHERE school_id = ${schoolId})`, sql`teachers.user_id = ${users.id}`)
    .where(and(eq(userSchools.schoolId, schoolId), isNull(users.deletedAt), sql`teachers.user_id IS NULL`))
    .orderBy(users.name)
}

// Phase 11: Get user activity logs
export async function getUserActivityLogs(userId: string, schoolId: string, limit: number = 20) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  return db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      tableName: auditLogs.tableName,
      recordId: auditLogs.recordId,
      oldValues: auditLogs.oldValues,
      newValues: auditLogs.newValues,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .where(and(eq(auditLogs.userId, userId), eq(auditLogs.schoolId, schoolId)))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
}

// Phase 11: Update last login timestamp
export async function updateLastLogin(userId: string) {
  const db = getDb()

  await db
    .update(users)
    .set({
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}

// Sync user auth data - updates authUserId and lastLoginAt when user logs in
export async function syncUserAuthOnLogin(authUserId: string, email: string) {
  const db = getDb()

  // Find user by email
  const [existingUser] = await db
    .select({ id: users.id, authUserId: users.authUserId })
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1)

  if (!existingUser) {
    return null // User doesn't exist in school system
  }

  // Update authUserId if different and update lastLoginAt
  const updates: { authUserId?: string, lastLoginAt: Date, updatedAt: Date } = {
    lastLoginAt: new Date(),
    updatedAt: new Date(),
  }

  if (existingUser.authUserId !== authUserId) {
    updates.authUserId = authUserId
  }

  await db
    .update(users)
    .set(updates)
    .where(eq(users.id, existingUser.id))

  return existingUser.id
}
