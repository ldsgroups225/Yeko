import {
  assignSubjectsToTeacher,
  countTeachersBySchool,
  createTeacher,
  deleteTeacher,
  getTeacherByUserId,
  getTeacherClasses,
  getTeachersBySchool,
  getTeacherWithSubjects,
  updateTeacher,
} from '@repo/data-ops/queries/school-admin/teachers'
import { getTimetableByTeacher } from '@repo/data-ops/queries/timetables'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { teacherCreateSchema, teacherUpdateSchema } from '@/schemas/teacher'
import { getSchoolContext } from '../middleware/school-context'

/**
 * Filters for teacher queries
 */
const teacherFiltersSchema = z.object({
  search: z.string().optional(),
  subjectId: z.string().optional(),
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
 * Get teachers with pagination and filters
 */
export const getTeachers = createServerFn()
  .inputValidator(
    z.object({
      filters: teacherFiltersSchema.optional(),
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

    const [teachers, total] = await Promise.all([
      getTeachersBySchool(schoolId, {
        ...filters,
        limit: pagination.limit,
        offset,
      }),
      countTeachersBySchool(schoolId, filters),
    ])

    return {
      teachers,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    }
  })

/**
 * Get teacher by ID
 */
export const getTeacher = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: teacherId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context
    return await getTeacherWithSubjects(teacherId, schoolId)
  })

/**
 * Create new teacher
 */
export const createNewTeacher = createServerFn()
  .inputValidator(teacherCreateSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context

    return await createTeacher({
      userId: data.userId,
      schoolId,
      specialization: data.specialization || undefined,
      hireDate: data.hireDate || undefined,
      subjectIds: data.subjectIds,
    })
  })

/**
 * Update teacher
 */
export const updateExistingTeacher = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      data: teacherUpdateSchema,
    }),
  )
  .handler(async ({ data: { teacherId, data } }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context

    return await updateTeacher(teacherId, schoolId, {
      specialization: data.specialization || undefined,
      hireDate: data.hireDate || undefined,
      status: data.status,
    })
  })

/**
 * Delete teacher
 */
export const deleteExistingTeacher = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: teacherId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context
    return await deleteTeacher(teacherId, schoolId)
  })

/**
 * Assign subjects to teacher
 */
export const assignSubjects = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      subjectIds: z.array(z.string()).min(1),
    }),
  )
  .handler(async ({ data: { teacherId, subjectIds } }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context
    return await assignSubjectsToTeacher(teacherId, schoolId, subjectIds)
  })

/**
 * Get teacher subjects
 */
export const getTeacherSubjectsList = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: teacherId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context
    return await getTeacherWithSubjects(teacherId, schoolId)
  })

/**
 * Get current teacher by user ID from session
 */
export const getCurrentTeacher = createServerFn()
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context
    return await getTeacherByUserId(data.userId, schoolId)
  })
/**
 * Get teacher classes
 */
export const getTeacherClassesList = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: teacherId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    const { schoolId } = context
    return await getTeacherClasses(teacherId, schoolId)
  })

/**
 * Get teacher schedules
 */
export const getTeacherSchedulesList = createServerFn()
  .inputValidator(z.object({ teacherId: z.string(), schoolYearId: z.string() }))
  .handler(async ({ data: { teacherId, schoolYearId } }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    return await getTimetableByTeacher({ teacherId, schoolYearId })
  })
