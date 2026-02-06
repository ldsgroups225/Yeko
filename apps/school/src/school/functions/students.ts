import type { ExportStudentRow, ImportStudentResult, StudentFullProfile, StudentStatistics, StudentWithDetails } from '@repo/data-ops/queries/students'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { getActiveSchoolYear } from '@repo/data-ops/queries/school-admin/school-years'
import * as studentQueries from '@repo/data-ops/queries/students'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

// Students schema matched with DB
const studentSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  matricule: z.string().optional(),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['M', 'F', 'other']).optional(),
  birthPlace: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  medicalNotes: z.string().optional(),
  previousSchool: z.string().optional(),
  status: z.enum(['active', 'graduated', 'transferred', 'withdrawn']).default('active'),
  admissionDate: z.string().default(() => new Date().toISOString()),
  photoUrl: z.string().optional(),
})

const studentFiltersSchema = z.object({
  classId: z.string().optional(),
  gradeId: z.string().optional(),
  schoolYearId: z.string().optional(),
  status: z.enum(['active', 'graduated', 'transferred', 'withdrawn']).optional(),
  gender: z.enum(['M', 'F', 'other']).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sortBy: z.enum(['name', 'matricule', 'dob', 'enrollmentDate', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

// ==================== Server Functions ====================

export const getStudents = authServerFn
  .inputValidator(studentFiltersSchema)
  .handler(async ({ data, context }): Promise<{ success: true, data: { data: StudentWithDetails[], total: number, page: number, totalPages: number } } | { success: false, error: string }> => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('students', 'view')
    return (await studentQueries.getStudents({ ...data, schoolId: context.school.schoolId })).match(
      paginatedData => ({ success: true as const, data: paginatedData }),
      error => ({ success: false as const, error: error.message }),
    )
  })

export const getStudentById = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }): Promise<{ success: true, data: StudentFullProfile } | { success: false, error: string }> => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('students', 'view')
    return (await studentQueries.getStudentById(id)).match(
      student => ({ success: true as const, data: student }),
      error => ({ success: false as const, error: error.message }),
    )
  })

export const createStudent = authServerFn
  .inputValidator(studentSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school, schoolYear } = context
    await requirePermission('students', 'create')
    const schoolYearId = schoolYear?.schoolYearId

    return (await studentQueries.createStudent({
      ...data,
      schoolId: school.schoolId,
      schoolYearId,
    })).match(
      async (student) => {
        await createAuditLog({
          schoolId: school.schoolId,
          userId: school.userId,
          action: 'create',
          tableName: 'students',
          recordId: student.id,
          newValues: { firstName: student.firstName, lastName: student.lastName, matricule: student.matricule },
        })
        return { success: true as const, data: student }
      },
      error => ({ success: false as const, error: error.message }),
    )
  })

export const updateStudent = authServerFn
  .inputValidator(
    z.object({
      id: z.string(),
      data: studentSchema.partial(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    await requirePermission('students', 'edit')

    return (await studentQueries.updateStudent(data.id, data.data)).match(
      async (student) => {
        await createAuditLog({
          schoolId: school.schoolId,
          userId: school.userId,
          action: 'update',
          tableName: 'students',
          recordId: data.id,
          newValues: data.data,
        })
        return { success: true as const, data: student }
      },
      error => ({ success: false as const, error: error.message }),
    )
  })

export const deleteStudent = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }): Promise<{ success: true, data: { success: true } } | { success: false, error: string }> => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    await requirePermission('students', 'delete')

    return (await studentQueries.deleteStudent(id)).match(
      async () => {
        await createAuditLog({
          schoolId: school.schoolId,
          userId: school.userId,
          action: 'delete',
          tableName: 'students',
          recordId: id,
        })
        return { success: true as const, data: { success: true } }
      },
      error => ({ success: false as const, error: error.message }),
    )
  })

export const updateStudentStatus = authServerFn
  .inputValidator(
    z.object({
      id: z.string(),
      status: z.enum(['active', 'graduated', 'transferred', 'withdrawn']),
      reason: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    await requirePermission('students', 'edit')

    return (await studentQueries.updateStudentStatus(data.id, data.status, data.reason)).match(
      async (student) => {
        await createAuditLog({
          schoolId: school.schoolId,
          userId: school.userId,
          action: 'update',
          tableName: 'students',
          recordId: data.id,
          newValues: { status: data.status, reason: data.reason },
        })
        return { success: true as const, data: student }
      },
      error => ({ success: false as const, error: error.message }),
    )
  })

export const bulkImportStudents = authServerFn
  .inputValidator(z.array(studentSchema))
  .handler(async ({ data, context }): Promise<{ success: true, data: ImportStudentResult } | { success: false, error: string }> => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    await requirePermission('students', 'create')

    return (await studentQueries.bulkImportStudents(school.schoolId, data.map(student => ({
      ...student,
      schoolId: school.schoolId,
    })))).match(
      async (results) => {
        await createAuditLog({
          schoolId: school.schoolId,
          userId: school.userId,
          action: 'create',
          tableName: 'students',
          recordId: 'bulk',
          newValues: { count: results.success, errors: results.errors.length },
        })
        return { success: true as const, data: results }
      },
      error => ({ success: false as const, error: error.message }),
    )
  })

export const exportStudents = authServerFn
  .inputValidator(studentFiltersSchema)
  .handler(async ({ data, context }): Promise<{ success: true, data: ExportStudentRow[] } | { success: false, error: string }> => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('students', 'view')
    return (await studentQueries.exportStudents({ ...data, schoolId: context.school.schoolId })).match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

export const getStudentStatistics = authServerFn
  .handler(async ({ context }): Promise<{ success: true, data: StudentStatistics } | { success: false, error: string }> => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('students', 'view')
    return (await studentQueries.getStudentStatistics(context.school.schoolId)).match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

export const generateMatricule = authServerFn
  .handler(async ({ context }): Promise<{ success: true, data: string } | { success: false, error: string }> => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school, schoolYear } = context
    await requirePermission('students', 'create')
    let schoolYearId = schoolYear?.schoolYearId

    if (!schoolYearId) {
      const activeYearResult = await getActiveSchoolYear(school.schoolId)
      const activeYear = activeYearResult.match(
        ay => ay,
        () => null,
      )

      if (!activeYear) {
        return { success: false as const, error: 'Aucune année scolaire sélectionnée. Veuillez sélectionner une année scolaire.' }
      }
      schoolYearId = activeYear.id
    }

    return (await studentQueries.generateMatricule(school.schoolId, schoolYearId!)).match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })
