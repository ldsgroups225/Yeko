import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import * as studentQueries from '@repo/data-ops/queries/students'
import type { StudentWithDetails } from '@repo/data-ops/queries/students'
import { requirePermission } from '../middleware/permissions'
import { getSchoolContext, getSchoolYearContext } from '../middleware/school-context'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'

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

export const getStudents = createServerFn()
  .inputValidator(studentFiltersSchema)
  .handler(async ({ data }): Promise<{ success: true; data: { data: StudentWithDetails[], total: number, page: number, totalPages: number } } | { success: false; error: string }> => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'view')

    return (await studentQueries.getStudents({ ...data, schoolId: context.schoolId })).match(
      paginatedData => ({ success: true as const, data: paginatedData }),
      error => ({ success: false as const, error: error.message }),
    )
  })

export const getStudentById = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id }): Promise<{ success: true; data: any } | { success: false; error: string }> => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'view')

    return (await studentQueries.getStudentById(id)).match(
      student => ({ success: true as const, data: student }),
      error => ({ success: false as const, error: error.message }),
    )

  })


export const createStudent = createServerFn()
  .inputValidator(studentSchema)
  .handler(async ({ data }): Promise<{ success: true; data: any } | { success: false; error: string }> => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'create')

    const yearContext = await getSchoolYearContext()
    const schoolYearId = yearContext?.schoolYearId

    return (await studentQueries.createStudent({
      ...data,
      schoolId: context.schoolId,
      schoolYearId,
    })).match(
      async student => {
        await createAuditLog({
          schoolId: context.schoolId,
          userId: context.userId,
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


export const updateStudent = createServerFn()
  .inputValidator(
    z.object({
      id: z.string(),
      data: studentSchema.partial(),
    }),
  )
  .handler(async ({ data }): Promise<{ success: true; data: any } | { success: false; error: string }> => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'edit')

    return (await studentQueries.updateStudent(data.id, data.data)).match(
      async student => {
        await createAuditLog({
          schoolId: context.schoolId,
          userId: context.userId,
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


export const deleteStudent = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id }): Promise<{ success: true } | { success: false; error: string }> => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'delete')

    return (await studentQueries.deleteStudent(id)).match(
      async () => {
        await createAuditLog({
          schoolId: context.schoolId,
          userId: context.userId,
          action: 'delete',
          tableName: 'students',
          recordId: id,
        })
        return { success: true as const }
      },
      error => ({ success: false as const, error: error.message }),
    )

  })


export const updateStudentStatus = createServerFn()
  .inputValidator(
    z.object({
      id: z.string(),
      status: z.enum(['active', 'graduated', 'transferred', 'withdrawn']),
      reason: z.string().optional(),
    }),
  )
  .handler(async ({ data }): Promise<{ success: true; data: any } | { success: false; error: string }> => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'edit')

    return (await studentQueries.updateStudentStatus(data.id, data.status, data.reason)).match(
      async student => {
        await createAuditLog({
          schoolId: context.schoolId,
          userId: context.userId,
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


export const bulkImportStudents = createServerFn()
  .inputValidator(z.array(studentSchema))
  .handler(async ({ data }): Promise<{ success: true; data: any } | { success: false; error: string }> => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'create')

    return (await studentQueries.bulkImportStudents(context.schoolId, data.map(student => ({
      ...student,
      schoolId: context.schoolId,
    })))).match(
      async results => {
        await createAuditLog({
          schoolId: context.schoolId,
          userId: context.userId,
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


export const exportStudents = createServerFn()
  .inputValidator(studentFiltersSchema)
  .handler(async ({ data }): Promise<{ success: true; data: any } | { success: false; error: string }> => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'view')

    return (await studentQueries.exportStudents({ ...data, schoolId: context.schoolId })).match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })


export const getStudentStatistics = createServerFn().handler(async (): Promise<{ success: true; data: any } | { success: false; error: string }> => {
  const context = await getSchoolContext()
  if (!context)
    throw new Error('No school context')
  await requirePermission('students', 'view')

    return (await studentQueries.getStudentStatistics(context.schoolId)).match(
    data => ({ success: true as const, data }),
    error => ({ success: false as const, error: error.message }),
  )

})

export const generateMatricule = createServerFn().handler(async (): Promise<{ success: true; data: any } | { success: false; error: string }> => {
  const context = await getSchoolContext()
  if (!context)
    throw new Error('No school context')
  await requirePermission('students', 'create')

  const yearContext = await getSchoolYearContext()
  let schoolYearId = yearContext?.schoolYearId

  if (!schoolYearId) {
    const activeYearResult = await studentQueries.getActiveSchoolYear(context.schoolId)
    const activeYear = activeYearResult.match(
      ay => ay,
      () => null
    )
    
    if (!activeYear) {
      throw new Error('No school year selected. Please select a school year.')
    }
    schoolYearId = activeYear.id
  }

  return (await studentQueries.generateMatricule(context.schoolId, schoolYearId!)).match(
    data => ({ success: true as const, data }),
    error => ({ success: false as const, error: error.message }),
  )

})
