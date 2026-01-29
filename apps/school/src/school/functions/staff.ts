import {
  countStaffBySchool,
  createStaff,
  deleteStaff,
  getStaffById,
  getStaffBySchool,
  updateStaff,
} from '@repo/data-ops/queries/school-admin/staff'
import { z } from 'zod'
import { createStaffSchema, updateStaffSchema } from '@/schemas/staff'
import { authServerFn } from '../lib/server-fn'

/**
 * Filters for staff queries
 */
const staffFiltersSchema = z.object({
  search: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
})

/**
 * Pagination schema
 */
const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

/**
 * Get staff with pagination and filters
 */
export const getStaffList = authServerFn
  .inputValidator(
    z.object({
      filters: staffFiltersSchema.optional(),
      pagination: paginationSchema.optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    const { filters = {}, pagination = { page: 1, limit: 20 } } = data

    const offset = (pagination.page - 1) * pagination.limit

    const [staffList, total] = await Promise.all([
      getStaffBySchool(schoolId, {
        ...filters,
        limit: pagination.limit,
        offset,
      }),
      countStaffBySchool(schoolId, filters),
    ])

    return {
      success: true as const,
      data: {
        staff: staffList,
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    }
  })

/**
 * Get staff member by ID
 */
export const getStaffMember = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: staffId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    const result = await getStaffById(staffId, schoolId)
    return { success: true as const, data: result }
  })

/**
 * Create new staff member
 */
export const createNewStaff = authServerFn
  .inputValidator(createStaffSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school

    const result = await createStaff({
      userId: data.userId,
      schoolId,
      position: data.position,
      department: data.department || undefined,
      hireDate: data.hireDate || undefined,
    })

    return { success: true as const, data: result }
  })

/**
 * Update staff member
 */
export const updateExistingStaff = authServerFn
  .inputValidator(
    z.object({
      staffId: z.string(),
      data: updateStaffSchema,
    }),
  )
  .handler(async ({ data: { staffId, data }, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school

    const result = await updateStaff(staffId, schoolId, {
      position: data.position,
      department: data.department || undefined,
      hireDate: data.hireDate || undefined,
      status: data.status,
    })

    return { success: true as const, data: result }
  })

/**
 * Delete staff member
 */
export const deleteExistingStaff = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: staffId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    const result = await deleteStaff(staffId, schoolId)
    return { success: true as const, data: result }
  })
