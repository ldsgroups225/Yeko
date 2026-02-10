import type { ExportStudentRow, ImportStudentResult, StudentFullProfile, StudentStatistics, StudentWithDetails } from '@repo/data-ops/queries/students'
import { Result as R } from '@praha/byethrow'
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
    const _result1 = await studentQueries.getStudents({ ...data, schoolId: context.school.schoolId })
    if (R.isFailure(_result1))
      return { success: false as const, error: _result1.error.message }
    return { success: true as const, data: _result1.value }
  })

export const getStudentById = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }): Promise<{ success: true, data: StudentFullProfile } | { success: false, error: string }> => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('students', 'view')
    const _result2 = await studentQueries.getStudentById(id)
    if (R.isFailure(_result2))
      return { success: false as const, error: _result2.error.message }
    return { success: true as const, data: _result2.value }
  })

export const createStudent = authServerFn
  .inputValidator(studentSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school, schoolYear } = context
    await requirePermission('students', 'create')
    const schoolYearId = schoolYear?.schoolYearId

    const _result3 = await studentQueries.createStudent({
      ...data,
      schoolId: school.schoolId,
      schoolYearId,
    })
    if (R.isFailure(_result3))
      return { success: false as const, error: _result3.error.message }
    await createAuditLog({
      schoolId: school.schoolId,
      userId: school.userId,
      action: 'create',
      tableName: 'students',
      recordId: _result3.value.id,
      newValues: { firstName: _result3.value.firstName, lastName: _result3.value.lastName, matricule: _result3.value.matricule },
    })
    return { success: true as const, data: _result3.value }
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

    const _result4 = await studentQueries.updateStudent(data.id, data.data)
    if (R.isFailure(_result4))
      return { success: false as const, error: _result4.error.message }
    await createAuditLog({
      schoolId: school.schoolId,
      userId: school.userId,
      action: 'update',
      tableName: 'students',
      recordId: data.id,
      newValues: data.data,
    })
    return { success: true as const, data: _result4.value }
  })

export const deleteStudent = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: id, context }): Promise<{ success: true, data: { success: true } } | { success: false, error: string }> => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    await requirePermission('students', 'delete')

    const _result5 = await studentQueries.deleteStudent(id)
    if (R.isFailure(_result5))
      return { success: false as const, error: _result5.error.message }
    await createAuditLog({
      schoolId: school.schoolId,
      userId: school.userId,
      action: 'delete',
      tableName: 'students',
      recordId: id,
    })
    return { success: true as const, data: { success: true } }
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

    const _result6 = await studentQueries.updateStudentStatus(data.id, data.status, data.reason)
    if (R.isFailure(_result6))
      return { success: false as const, error: _result6.error.message }
    await createAuditLog({
      schoolId: school.schoolId,
      userId: school.userId,
      action: 'update',
      tableName: 'students',
      recordId: data.id,
      newValues: { status: data.status, reason: data.reason },
    })
    return { success: true as const, data: _result6.value }
  })

export const bulkImportStudents = authServerFn
  .inputValidator(z.array(studentSchema))
  .handler(async ({ data, context }): Promise<{ success: true, data: ImportStudentResult } | { success: false, error: string }> => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    await requirePermission('students', 'create')

    const _result7 = await studentQueries.bulkImportStudents(school.schoolId, data.map(student => ({
      ...student,
      schoolId: school.schoolId,
    })))
    if (R.isFailure(_result7))
      return { success: false as const, error: _result7.error.message }
    await createAuditLog({
      schoolId: school.schoolId,
      userId: school.userId,
      action: 'create',
      tableName: 'students',
      recordId: 'bulk',
      newValues: { count: _result7.value.success, errors: _result7.value.errors.length },
    })
    return { success: true as const, data: _result7.value }
  })

export const exportStudents = authServerFn
  .inputValidator(studentFiltersSchema)
  .handler(async ({ data, context }): Promise<{ success: true, data: ExportStudentRow[] } | { success: false, error: string }> => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('students', 'view')
    const _result8 = await studentQueries.exportStudents({ ...data, schoolId: context.school.schoolId })
    if (R.isFailure(_result8))
      return { success: false as const, error: _result8.error.message }
    return { success: true as const, data: _result8.value }
  })

export const getStudentStatistics = authServerFn
  .handler(async ({ context }): Promise<{ success: true, data: StudentStatistics } | { success: false, error: string }> => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('students', 'view')
    const _result9 = await studentQueries.getStudentStatistics(context.school.schoolId)
    if (R.isFailure(_result9))
      return { success: false as const, error: _result9.error.message }
    return { success: true as const, data: _result9.value }
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
      const activeYear = R.isFailure(activeYearResult) ? null : activeYearResult.value

      if (!activeYear) {
        return { success: false as const, error: 'Aucune année scolaire sélectionnée. Veuillez sélectionner une année scolaire.' }
      }
      schoolYearId = activeYear.id
    }

    const _result10 = await studentQueries.generateMatricule(school.schoolId, schoolYearId!)
    if (R.isFailure(_result10))
      return { success: false as const, error: _result10.error.message }
    return { success: true as const, data: _result10.value }
  })
