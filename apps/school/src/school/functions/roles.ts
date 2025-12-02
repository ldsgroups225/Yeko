import {
  countRoles,
  createRole,
  deleteRole,
  getAllRoles,
  getRoleById,
  getRoleUsersCount,
  updateRole,
} from '@repo/data-ops/queries/school-admin/roles'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createRoleSchema, updateRoleSchema } from '@/schemas/role'
import { getSchoolContext } from '../middleware/school-context'

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
export const getRoles = createServerFn()
  .inputValidator(
    z.object({
      filters: roleFiltersSchema.optional(),
      pagination: paginationSchema.optional(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context
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
      rolesList.map(async (role: any) => {
        const userCount = await getRoleUsersCount(role.id, schoolId)
        return {
          ...role,
          userCount,
          permissionCount: Object.values(role.permissions as Record<string, string[]>).flat().length,
        }
      }),
    )

    return {
      roles: rolesWithCounts,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    }
  })

/**
 * Get role by ID
 */
export const getRole = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: roleId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context

    const role = await getRoleById(roleId)
    if (!role)
      return null

    const userCount = await getRoleUsersCount(roleId, schoolId)

    return {
      ...role,
      userCount,
      permissionCount: Object.values(role.permissions as Record<string, string[]>).flat().length,
    }
  })

/**
 * Create new role
 */
export const createNewRole = createServerFn()
  .inputValidator(createRoleSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await createRole({
      name: data.name,
      slug: data.slug,
      description: data.description || undefined,
      permissions: data.permissions,
      scope: data.scope,
    })
  })

/**
 * Update role
 */
export const updateExistingRole = createServerFn()
  .inputValidator(
    z.object({
      roleId: z.string(),
      data: updateRoleSchema,
    }),
  )
  .handler(async ({ data: { roleId, data } }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await updateRole(roleId, {
      name: data.name,
      description: data.description || undefined,
      permissions: data.permissions,
    })
  })

/**
 * Delete role
 */
export const deleteExistingRole = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: roleId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    return await deleteRole(roleId)
  })
