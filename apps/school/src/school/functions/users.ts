import { queueAuditLog } from '@repo/background-tasks'
import {
  bulkDeleteUsers,
  bulkUpdateUsersStatus,
  checkEmailUniqueness,
  countUsersBySchool,
  createUserWithSchool,
  deleteUser,
  getUserActivityLogs,
  getUserIdFromAuthUserId as getUserIdFromAuthUserIdQuery,
  getUsersBySchool,
  getUserWithRoles,
  updateUser,
} from '@repo/data-ops/queries/school-admin/users'
import { z } from 'zod'
import { userCreateSchema, userUpdateSchema } from '@/schemas/user'
import { authServerFn } from '../lib/server-fn'

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
export const getUsers = authServerFn
  .inputValidator(
    z.object({
      filters: userFiltersSchema.optional(),
      pagination: paginationSchema.optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
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
      success: true as const,
      data: {
        users,
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    }
  })

/**
 * Get user by ID with roles
 */
export const getUser = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: userId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    const user = await getUserWithRoles(userId, schoolId)

    if (!user)
      return { success: false as const, error: 'Utilisateur non trouvé' }

    return {
      success: true as const,
      data: {
        ...user,
        roleIds: user.roles.map((r: { roleId: string }) => r.roleId),
      },
    }
  })

/**
 * Create new user
 */
export const createNewUser = authServerFn
  .inputValidator(userCreateSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school

    // Check email uniqueness (returns true if email is available)
    const emailIsAvailable = await checkEmailUniqueness(data.email, schoolId)
    if (!emailIsAvailable) {
      return { success: false as const, error: 'Cet e-mail est déjà utilisé dans cet établissement' }
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

    return { success: true as const, data: user }
  })

/**
 * Update user
 */
export const updateExistingUser = authServerFn
  .inputValidator(
    z.object({
      userId: z.string(),
      data: userUpdateSchema,
    }),
  )
  .handler(async ({ data: { userId: targetUserId, data }, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school

    // Check email uniqueness if email is being changed (returns true if email is available)
    if (data.email) {
      const emailIsAvailable = await checkEmailUniqueness(data.email, schoolId, targetUserId)
      if (!emailIsAvailable) {
        return { success: false as const, error: 'Cet e-mail est déjà utilisé dans cet établissement' }
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

    return { success: true as const, data: result }
  })

/**
 * Delete user
 */
export const deleteExistingUser = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: targetUserId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school

    const result = await deleteUser(targetUserId, schoolId)

    // Log audit event (non-blocking via queue)
    queueAuditLog({
      schoolId,
      userId,
      action: 'delete',
      tableName: 'users',
      recordId: targetUserId,
    })

    return { success: true as const, data: result }
  })

/**
 * Bulk update users status
 */
export const bulkUpdateStatus = authServerFn
  .inputValidator(
    z.object({
      userIds: z.array(z.string()).min(1),
      status: z.enum(['active', 'inactive', 'suspended']),
    }),
  )
  .handler(async ({ data: { userIds, status }, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    const result = await bulkUpdateUsersStatus(userIds, schoolId, status, 'system')
    return { success: true as const, data: result }
  })

/**
 * Bulk delete users
 */
export const bulkDeleteExistingUsers = authServerFn
  .inputValidator(z.array(z.string()).min(1))
  .handler(async ({ data: userIds, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    const result = await bulkDeleteUsers(userIds, schoolId, 'system')
    return { success: true as const, data: result }
  })

/**
 * Get user activity logs
 */
export const getUserActivity = authServerFn
  .inputValidator(
    z.object({
      userId: z.string(),
      limit: z.number().min(1).max(100).default(50),
    }),
  )
  .handler(async ({ data: { userId, limit }, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    const result = await getUserActivityLogs(userId, schoolId, limit)
    return { success: true as const, data: result }
  })

/**
 * Get current user's role for the current school context
 * Used by the useRole hook
 */
export const getCurrentUserRole = authServerFn
  .handler(async ({ context }) => {
    if (!context?.school) {
      return { success: true as const, data: null }
    }

    const { schoolId, userId } = context.school

    try {
      const user = await getUserWithRoles(userId, schoolId)
      if (!user || user.roles.length === 0) {
        return { success: true as const, data: null }
      }

      // Return the first role (primary role)
      const primaryRole = user.roles[0]!
      return {
        success: true as const,
        data: {
          roleSlug: primaryRole.roleSlug,
          roleName: primaryRole.roleName,
          permissions: (primaryRole.permissions as Record<string, any>) || {},
        },
      }
    }
    catch (error) {
      console.error('Error fetching current user role:', error)
      return { success: true as const, data: null }
    }
  })

/**
 * Get internal user ID from auth user ID (Better Auth user ID)
 * This is used to convert the session user ID to the internal users table ID
 */
export const getUserIdFromAuthUserId = authServerFn
  .inputValidator(z.object({ authUserId: z.string() }))
  .handler(async ({ data }) => {
    const userId = await getUserIdFromAuthUserIdQuery(data.authUserId)
    return { success: true as const, data: userId }
  })
