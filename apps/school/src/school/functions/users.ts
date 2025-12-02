import {
  bulkDeleteUsers,
  bulkUpdateUsersStatus,
  checkEmailUniqueness,
  countUsersBySchool,
  createUserWithSchool,
  deleteUser,
  getUserActivityLogs,
  getUserById,
  getUsersBySchool,
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
 * Get user by ID
 */
export const getUser = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: userId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context
    return await getUserById(userId, schoolId)
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
    const { schoolId } = context

    // Check email uniqueness
    const emailExists = await checkEmailUniqueness(data.email, schoolId)
    if (emailExists) {
      throw new Error('Email already exists in this school')
    }

    return await createUserWithSchool({
      email: data.email,
      name: data.name,
      authUserId: 'temp-auth-id', // TODO: Get from auth session
      schoolId,
      roleIds: data.roleIds,
      phone: data.phone || undefined,
      avatarUrl: data.avatarUrl || undefined,
    })
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
  .handler(async ({ data: { userId, data } }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context

    // Check email uniqueness if email is being changed
    if (data.email) {
      const emailExists = await checkEmailUniqueness(data.email, schoolId, userId)
      if (emailExists) {
        throw new Error('Email already exists in this school')
      }
    }

    return await updateUser(userId, schoolId, {
      name: data.name,
      phone: data.phone || undefined,
      avatarUrl: data.avatarUrl || undefined,
      status: data.status,
    })
  })

/**
 * Delete user
 */
export const deleteExistingUser = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: userId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context
    return await deleteUser(userId, schoolId)
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
