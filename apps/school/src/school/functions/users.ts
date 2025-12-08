import { queueAuditLog } from '@repo/background-tasks'
import {
  bulkDeleteUsers,
  bulkUpdateUsersStatus,
  checkEmailUniqueness,
  countUsersBySchool,
  createUserWithSchool,
  deleteUser,
  getUserActivityLogs,
  getUsersBySchool,
  getUserWithRoles,
  updateUser,
} from '@repo/data-ops/queries/school-admin/users'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { userCreateSchema, userUpdateSchema } from '@/schemas/user'
import { getSchoolContext } from '../middleware/school-context'

/**
 * Filters for user queries
 */
const userFiltersSchema = z.object({
  search: z.string().optional(),
  roleId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
})

/**
 * Pagination schema
 */
const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

/**
 * Get users with pagination and filters
 */
export const getUsers = createServerFn()
  .inputValidator(
    z.object({
      filters: userFiltersSchema.optional(),
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

    const [users, total] = await Promise.all([
      getUsersBySchool(schoolId, {
        ...filters,
        limit: pagination.limit,
        offset,
      }),
      countUsersBySchool(schoolId, filters),
    ])

    return {
      users,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    }
  })

/**
 * Get user by ID with roles
 */
export const getUser = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: userId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context
    const user = await getUserWithRoles(userId, schoolId)
    return {
      ...user,
      roleIds: user.roles.map((r: { roleId: string }) => r.roleId),
    }
  })

/**
 * Create new user
 */
export const createNewUser = createServerFn()
  .inputValidator(userCreateSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId, userId } = context

    // Check email uniqueness (returns true if email is available)
    const emailIsAvailable = await checkEmailUniqueness(data.email, schoolId)
    if (!emailIsAvailable) {
      throw new Error('Email already exists in this school')
    }

    // TODO: Create auth user account and get real authUserId
    // For now, using null until user logs in for the first time
    const user = await createUserWithSchool({
      email: data.email,
      name: data.name,
      authUserId: null as unknown as string, // Will be set when user first logs in
      schoolId,
      roleIds: data.roleIds,
      phone: data.phone || undefined,
      avatarUrl: data.avatarUrl || undefined,
    })

    // Log audit event (non-blocking via queue)
    queueAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'users',
      recordId: user.id,
      newValues: { name: data.name, email: data.email, roleIds: data.roleIds },
    })

    return user
  })

/**
 * Update user
 */
export const updateExistingUser = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
      data: userUpdateSchema,
    }),
  )
  .handler(async ({ data: { userId: targetUserId, data } }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId, userId } = context

    // Check email uniqueness if email is being changed (returns true if email is available)
    if (data.email) {
      const emailIsAvailable = await checkEmailUniqueness(data.email, schoolId, targetUserId)
      if (!emailIsAvailable) {
        throw new Error('Email already exists in this school')
      }
    }

    const result = await updateUser(targetUserId, schoolId, {
      name: data.name,
      phone: data.phone || undefined,
      avatarUrl: data.avatarUrl || undefined,
      status: data.status,
    })

    // Log audit event (non-blocking via queue)
    queueAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'users',
      recordId: targetUserId,
      newValues: data as Record<string, unknown>,
    })

    return result
  })

/**
 * Delete user
 */
export const deleteExistingUser = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: targetUserId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId, userId } = context

    const result = await deleteUser(targetUserId, schoolId)

    // Log audit event (non-blocking via queue)
    queueAuditLog({
      schoolId,
      userId,
      action: 'delete',
      tableName: 'users',
      recordId: targetUserId,
    })

    return result
  })

/**
 * Bulk update users status
 */
export const bulkUpdateStatus = createServerFn()
  .inputValidator(
    z.object({
      userIds: z.array(z.string()).min(1),
      status: z.enum(['active', 'inactive', 'suspended']),
    }),
  )
  .handler(async ({ data: { userIds, status } }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context
    return await bulkUpdateUsersStatus(userIds, status, schoolId, 'system')
  })

/**
 * Bulk delete users
 */
export const bulkDeleteExistingUsers = createServerFn()
  .inputValidator(z.array(z.string()).min(1))
  .handler(async ({ data: userIds }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context
    return await bulkDeleteUsers(userIds, schoolId, 'system')
  })

/**
 * Get user activity logs
 */
export const getUserActivity = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
      limit: z.number().min(1).max(100).default(50),
    }),
  )
  .handler(async ({ data: { userId, limit } }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context
    return await getUserActivityLogs(userId, schoolId, limit)
  })

/**
 * Get current user's role for the current school context
 * Used by the useRole hook
 */
export const getCurrentUserRole = createServerFn()
  .handler(async () => {
    const context = await getSchoolContext()
    if (!context?.schoolId || !context?.userId) {
      return null
    }

    const { schoolId, userId } = context

    try {
      const user = await getUserWithRoles(userId, schoolId)
      if (!user || user.roles.length === 0) {
        return null
      }

      // Return the first role (primary role)
      const primaryRole = user.roles[0]
      return {
        roleSlug: primaryRole.roleSlug,
        roleName: primaryRole.roleName,
        permissions: primaryRole.permissions || {},
      }
    }
    catch (error) {
      console.error('Error fetching current user role:', error)
      return null
    }
  })
