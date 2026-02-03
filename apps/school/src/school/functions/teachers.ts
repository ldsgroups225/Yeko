import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import {
  assignSubjectsToTeacher,
  countTeachersBySchool,
  createTeacher,
  deleteTeacher,
  getTeacherByUserId,
  getTeacherClasses,
  getTeachersBySchool,
  getTeacherWithSubjects,
  linkTeacherByEmail,
  updateTeacher,
} from '@repo/data-ops/queries/school-admin/teachers'
import { getTimetableByTeacher } from '@repo/data-ops/queries/timetables'
import { z } from 'zod'
import { teacherCreateSchema, teacherUpdateSchema } from '@/schemas/teacher'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

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
export const getTeachers = authServerFn
  .inputValidator(
    z.object({
      filters: teacherFiltersSchema.optional(),
      pagination: paginationSchema.optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('teachers', 'view')

    const { schoolId } = context.school
    const { filters = {}, pagination = { page: 1, limit: 20 } } = data

    const offset = (pagination.page - 1) * pagination.limit

    try {
      const [teachers, total] = await Promise.all([
        getTeachersBySchool(schoolId, {
          ...filters,
          limit: pagination.limit,
          offset,
        }),
        countTeachersBySchool(schoolId, filters),
      ])

      return {
        success: true as const,
        data: {
          teachers,
          total,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil(total / pagination.limit),
        },
      }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la récupération des enseignants' }
    }
  })

/**
 * Get teacher by ID
 */
export const getTeacher = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: teacherId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('teachers', 'view')

    try {
      const result = await getTeacherWithSubjects(teacherId, context.school.schoolId)
      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Enseignant non trouvé' }
    }
  })

/**
 * Create new teacher
 */
export const createNewTeacher = authServerFn
  .inputValidator(teacherCreateSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('teachers', 'create')

    try {
      const result = await createTeacher({
        userId: data.userId,
        schoolId,
        specialization: data.specialization || undefined,
        hireDate: data.hireDate || undefined,
        subjectIds: data.subjectIds,
      })

      await createAuditLog({
        schoolId,
        userId,
        action: 'create',
        tableName: 'teachers',
        recordId: result.id,
        newValues: data,
      })

      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la création de l\'enseignant' }
    }
  })

/**
 * Update teacher
 */
export const updateExistingTeacher = authServerFn
  .inputValidator(
    z.object({
      teacherId: z.string(),
      data: teacherUpdateSchema,
    }),
  )
  .handler(async ({ data: { teacherId, data }, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('teachers', 'edit')

    try {
      const updated = await updateTeacher(teacherId, schoolId, {
        specialization: data.specialization || undefined,
        hireDate: data.hireDate || undefined,
        status: data.status,
      })

      if (data.subjectIds) {
        await assignSubjectsToTeacher(teacherId, schoolId, data.subjectIds)
      }

      await createAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'teachers',
        recordId: teacherId,
        newValues: data,
      })

      return { success: true as const, data: updated }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la mise à jour de l\'enseignant' }
    }
  })

/**
 * Delete teacher
 */
export const deleteExistingTeacher = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: teacherId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('teachers', 'delete')

    try {
      const result = await deleteTeacher(teacherId, schoolId)

      await createAuditLog({
        schoolId,
        userId,
        action: 'delete',
        tableName: 'teachers',
        recordId: teacherId,
      })

      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la suppression de l\'enseignant' }
    }
  })

/**
 * Assign subjects to teacher
 */
export const assignSubjects = authServerFn
  .inputValidator(
    z.object({
      teacherId: z.string(),
      subjectIds: z.array(z.string()).min(1),
    }),
  )
  .handler(async ({ data: { teacherId, subjectIds }, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('teachers', 'edit')

    try {
      const result = await assignSubjectsToTeacher(teacherId, schoolId, subjectIds)

      await createAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'teacher_subjects',
        recordId: teacherId,
        newValues: { subjectIds },
      })

      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de l\'assignation des matières' }
    }
  })

/**
 * Get teacher subjects
 */
export const getTeacherSubjectsList = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: teacherId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('teachers', 'view')

    try {
      const result = await getTeacherWithSubjects(teacherId, context.school.schoolId)
      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la récupération des matières de l\'enseignant' }
    }
  })

/**
 * Get current teacher by user ID from session
 */
export const getCurrentTeacher = authServerFn
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      const result = await getTeacherByUserId(data.userId, context.school.schoolId)
      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Enseignant non trouvé' }
    }
  })

/**
 * Get teacher classes
 */
export const getTeacherClassesList = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: teacherId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('teachers', 'view')

    try {
      const result = await getTeacherClasses(teacherId, context.school.schoolId)
      return { success: true as const, data: result }
    }
    catch {
      return { success: false as const, error: 'Erreur lors de la récupération des classes de l\'enseignant' }
    }
  })

/**
 * Link teacher by email
 */
export const linkTeacherByEmailFn = authServerFn
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('teachers', 'create')

    try {
      const result = await linkTeacherByEmail(data.email, schoolId)

      await createAuditLog({
        schoolId,
        userId,
        action: 'create',
        tableName: 'teachers',
        recordId: 'email-link',
        newValues: { email: data.email },
      })

      return { success: true as const, data: result }
    }
    catch (error) {
      if (error instanceof Error && (error.message === 'User not found' || error.message === 'Auth user not found')) {
        return { success: false as const, error: 'Utilisateur non trouvé', code: 'USER_NOT_FOUND' }
      }
      return { success: false as const, error: error instanceof Error ? error.message : 'Une erreur est survenue' }
    }
  })

export const getTeacherSchedulesList = authServerFn
  .inputValidator(z.object({ teacherId: z.string(), schoolYearId: z.string() }))
  .handler(async ({ data: { teacherId, schoolYearId }, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('teachers', 'view')

    const result = await getTimetableByTeacher({ teacherId, schoolYearId })
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })
