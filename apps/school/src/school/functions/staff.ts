import {
  countStaffBySchool,
  createStaff,
  deleteStaff,
  getStaffById,
  getStaffBySchool,
  updateStaff,
} from '@repo/data-ops/queries/school-admin/staff'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createStaffSchema, updateStaffSchema } from '@/schemas/staff'
import { getSchoolContext } from '../middleware/school-context'

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
export const getStaffList = createServerFn()
  .inputValidator(
    z.object({
      filters: staffFiltersSchema.optional(),
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

    const [staffList, total] = await Promise.all([
      getStaffBySchool(schoolId, {
        ...filters,
        limit: pagination.limit,
        offset,
      }),
      countStaffBySchool(schoolId, filters),
    ])

    return {
      staff: staffList,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    }
  })

/**
 * Get staff member by ID
 */
export const getStaffMember = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: staffId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context
    return await getStaffById(staffId, schoolId)
  })

/**
 * Create new staff member
 */
export const createNewStaff = createServerFn()
  .inputValidator(createStaffSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context

    return await createStaff({
      userId: data.userId,
      schoolId,
      position: data.position,
      department: data.department || undefined,
      hireDate: data.hireDate || undefined,
    })
  })

/**
 * Update staff member
 */
export const updateExistingStaff = createServerFn()
  .inputValidator(
    z.object({
      staffId: z.string(),
      data: updateStaffSchema,
    }),
  )
  .handler(async ({ data: { staffId, data } }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context

    return await updateStaff(staffId, schoolId, {
      position: data.position,
      department: data.department || undefined,
      hireDate: data.hireDate || undefined,
      status: data.status,
    })
  })

/**
 * Delete staff member
 */
export const deleteExistingStaff = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: staffId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context
    return await deleteStaff(staffId, schoolId)
  })
