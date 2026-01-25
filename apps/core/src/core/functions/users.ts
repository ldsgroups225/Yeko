import { assignSystemRolesToUser, countSystemUsers, getSystemUsers, updateSystemUser } from '@repo/data-ops/queries/school-admin/users'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

/**
 * Fetch all platform users with pagination and search
 */
export const getPlatformUsers = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: any) => z.object({
      search: z.string().optional(),
      status: z.enum(['active', 'inactive', 'suspended']).optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const offset = (data.page - 1) * data.limit

    const [users, total] = await Promise.all([
      getSystemUsers({
        search: data.search,
        status: data.status,
        limit: data.limit,
        offset,
      }),
      countSystemUsers({
        search: data.search,
        status: data.status,
      }),
    ])

    return {
      data: users,
      meta: {
        total,
        page: data.page,
        limit: data.limit,
        totalPages: Math.ceil(total / data.limit),
        hasNext: data.page * data.limit < total,
        hasPrev: data.page > 1,
      },
    }
  })

/**
 * Update a user's base information or status
 */
export const updatePlatformUser = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: any) => z.object({
      id: z.string(),
      name: z.string().optional(),
      phone: z.string().optional(),
      status: z.enum(['active', 'inactive', 'suspended']).optional(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { id, ...updates } = data
    return updateSystemUser(id, updates)
  })

/**
 * Assign system roles to a user
 */
export const assignUserSystemRoles = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: any) => z.object({
      userId: z.string(),
      roleIds: z.array(z.string()),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    return assignSystemRolesToUser(data.userId, data.roleIds)
  })
