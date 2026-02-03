import {
  countRoles,
  createRole,
  deleteRole,
  getAllRoles,
  getRoleById,
  getRoleUsersCount,
  updateRole,
} from '@repo/data-ops/queries/school-admin/roles'
import { z } from 'zod'
import { createRoleSchema, updateRoleSchema } from '@/schemas/role'
import { authServerFn } from '../lib/server-fn'

/**
 * Filters for role queries
 */
const roleFiltersSchema = z.object({
  search: z.string().optional(),
  scope: z.enum(['school', 'system']).optional(),
})

/**
 * Pagination schema
 */
const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

/**
 * Get roles with pagination and filters
 */
export const getRoles = authServerFn
  .inputValidator(
    z.object({
      filters: roleFiltersSchema.optional(),
      pagination: paginationSchema.optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    const { filters = {}, pagination = { page: 1, limit: 20 } } = data

    const offset = (pagination.page - 1) * pagination.limit

    const [rolesList, total] = await Promise.all([
      getAllRoles({
        ...filters,
        limit: pagination.limit,
        offset,
      }),
      countRoles(filters),
    ])

    // Get user counts for each role
    const rolesWithCounts = await Promise.all(
      rolesList.map(async (role) => {
        const userCount = await getRoleUsersCount(role.id, schoolId)
        return {
          ...role,
          userCount,
          permissionCount: Object.values(role.permissions as Record<string, string[]>).flat().length,
        }
      }),
    )

    return {
      success: true as const,
      data: {
        roles: rolesWithCounts,
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    }
  })

/**
 * Get role by ID
 */
export const getRole = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: roleId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school

    const role = await getRoleById(roleId)
    if (!role)
      return { success: true as const, data: null }

    const userCount = await getRoleUsersCount(roleId, schoolId)

    return {
      success: true as const,
      data: {
        ...role,
        userCount,
        permissionCount: Object.values(role.permissions as Record<string, string[]>).flat().length,
      },
    }
  })

/**
 * Create new role
 */
export const createNewRole = authServerFn
  .inputValidator(createRoleSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await createRole({
      name: data.name,
      slug: data.slug,
      description: data.description || undefined,
      permissions: data.permissions as any,
      scope: data.scope,
    })

    return { success: true as const, data: result }
  })

/**
 * Update role
 */
export const updateExistingRole = authServerFn
  .inputValidator(
    z.object({
      roleId: z.string(),
      data: updateRoleSchema,
    }),
  )
  .handler(async ({ data: { roleId, data }, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await updateRole(roleId, {
      name: data.name,
      description: data.description || undefined,
      permissions: data.permissions as any,
    })

    return { success: true as const, data: result }
  })

/**
 * Delete role
 */
export const deleteExistingRole = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: roleId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await deleteRole(roleId)
    return { success: true as const, data: result }
  })
