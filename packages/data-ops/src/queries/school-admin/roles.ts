import { desc, eq, ilike } from 'drizzle-orm'
import { getDb } from '@/database/setup'
import { roles } from '@/drizzle/school-schema'
import { PAGINATION, SCHOOL_ERRORS } from './constants'

export async function getAllRoles(options?: {
  search?: string
  scope?: 'school' | 'system'
  limit?: number
  offset?: number
}) {
  const db = getDb()

  const limit = Math.min(options?.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT)
  const offset = options?.offset || 0

  const conditions = []

  if (options?.scope) {
    conditions.push(eq(roles.scope, options.scope))
  }

  if (options?.search) {
    conditions.push(ilike(roles.name, `%${options.search}%`))
  }

  const query = db.select().from(roles).orderBy(desc(roles.createdAt)).limit(limit).offset(offset)

  if (conditions.length > 0) {
    return query.where(conditions.length === 1 ? conditions[0] : undefined)
  }

  return query
}

export async function getRoleById(roleId: string) {
  const db = getDb()

  const result = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1)

  return result[0] || null
}

export async function getRoleBySlug(slug: string) {
  const db = getDb()

  const result = await db.select().from(roles).where(eq(roles.slug, slug)).limit(1)

  return result[0] || null
}

export async function createRole(data: {
  name: string
  slug: string
  description?: string
  permissions: Record<string, string[]>
  scope: 'school' | 'system'
}) {
  const db = getDb()

  const [role] = await db
    .insert(roles)
    .values({
      id: crypto.randomUUID(),
      name: data.name,
      slug: data.slug,
      description: data.description,
      permissions: data.permissions,
      scope: data.scope,
    })
    .returning()

  return role
}

export async function updateRole(
  roleId: string,
  data: {
    name?: string
    description?: string
    permissions?: Record<string, string[]>
  },
) {
  const db = getDb()

  // Verify role exists
  const role = await getRoleById(roleId)
  if (!role) {
    throw new Error(SCHOOL_ERRORS.ROLE_NOT_FOUND)
  }

  const [updated] = await db
    .update(roles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(roles.id, roleId))
    .returning()

  return updated
}

export async function deleteRole(roleId: string) {
  const db = getDb()

  // Verify role exists
  const role = await getRoleById(roleId)
  if (!role) {
    throw new Error(SCHOOL_ERRORS.ROLE_NOT_FOUND)
  }

  // Hard delete (cascade will handle user_roles)
  await db.delete(roles).where(eq(roles.id, roleId))

  return { success: true }
}

export async function checkPermission(roleId: string, action: string, resource: string): Promise<boolean> {
  const role = await getRoleById(roleId)

  if (!role) {
    return false
  }

  const permissions = role.permissions as Record<string, string[]>
  return permissions[resource]?.includes(action) ?? false
}
