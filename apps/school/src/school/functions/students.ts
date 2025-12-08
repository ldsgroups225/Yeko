import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import * as studentQueries from '@repo/data-ops/queries/students'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requirePermission } from '../middleware/permissions'
import { getSchoolContext, getSchoolYearContext } from '../middleware/school-context'

// ==================== Schemas ====================

// Phone validation regex for Ivory Coast format
const phoneRegex = /^(\+225)?\d{10}$/

// Simple HTML tag stripper for text sanitization
function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, '') // Remove HTML entities
    .trim()
}

// Zod transform for sanitizing text fields
function sanitizedString(maxLength: number) {
  return z.string().max(maxLength).transform(val => sanitizeText(val))
}

const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).transform(val => sanitizeText(val)),
  lastName: z.string().min(1, 'Last name is required').max(100).transform(val => sanitizeText(val)),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  gender: z.enum(['M', 'F', 'other']).optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  matricule: z.string().max(20).optional(),
  birthPlace: sanitizedString(100).optional(),
  nationality: sanitizedString(50).optional(),
  address: sanitizedString(500).optional(),
  emergencyContact: sanitizedString(100).optional(),
  emergencyPhone: z.string().max(20).regex(phoneRegex, 'Format invalide. Utilisez: +2250701020304 ou 0701020304').optional().or(z.literal('')),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  medicalNotes: sanitizedString(1000).optional(),
  previousSchool: sanitizedString(200).optional(),
  admissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
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
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'view')
    return await studentQueries.getStudents({ ...data, schoolId: context.schoolId })
  })

export const getStudentById = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'view')
    return await studentQueries.getStudentById(id)
  })

export const createStudent = createServerFn()
  .inputValidator(studentSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'create')

    // Get school year context for matricule generation
    const yearContext = await getSchoolYearContext()
    const schoolYearId = yearContext?.schoolYearId

    const student = await studentQueries.createStudent({
      ...data,
      schoolId: context.schoolId,
      schoolYearId,
    })

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'create',
      tableName: 'students',
      recordId: student.id,
      newValues: data,
    })

    return student
  })

export const updateStudent = createServerFn()
  .inputValidator(
    z.object({
      id: z.string(),
      updates: studentSchema.partial(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'edit')

    const oldStudent = await studentQueries.getStudentById(data.id)
    const student = await studentQueries.updateStudent(data.id, data.updates)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'update',
      tableName: 'students',
      recordId: data.id,
      oldValues: oldStudent?.student,
      newValues: data.updates,
    })

    return student
  })

export const deleteStudent = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'delete')

    const oldStudent = await studentQueries.getStudentById(id)
    await studentQueries.deleteStudent(id)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'delete',
      tableName: 'students',
      recordId: id,
      oldValues: oldStudent?.student,
    })

    return { success: true }
  })

export const updateStudentStatus = createServerFn()
  .inputValidator(
    z.object({
      id: z.string(),
      status: z.enum(['active', 'graduated', 'transferred', 'withdrawn']),
      reason: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'edit')

    const student = await studentQueries.updateStudentStatus(data.id, data.status, data.reason)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'update',
      tableName: 'students',
      recordId: data.id,
      newValues: { status: data.status, reason: data.reason },
    })

    return student
  })

export const bulkImportStudents = createServerFn()
  .inputValidator(z.array(studentSchema))
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'create')

    const results = await studentQueries.bulkImportStudents(context.schoolId, data as any)

    await createAuditLog({
      schoolId: context.schoolId,
      userId: context.userId,
      action: 'create',
      tableName: 'students',
      recordId: 'bulk',
      newValues: { count: results.success, errors: results.errors.length },
    })

    return results
  })

export const exportStudents = createServerFn()
  .inputValidator(studentFiltersSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')
    await requirePermission('students', 'view')
    return await studentQueries.exportStudents({ ...data, schoolId: context.schoolId })
  })

export const getStudentStatistics = createServerFn().handler(async () => {
  const context = await getSchoolContext()
  if (!context)
    throw new Error('No school context')
  await requirePermission('students', 'view')
  return await studentQueries.getStudentStatistics(context.schoolId)
})

export const generateMatricule = createServerFn().handler(async () => {
  const context = await getSchoolContext()
  if (!context)
    throw new Error('No school context')
  await requirePermission('students', 'create')

  // Get school year from context or fall back to active year
  const yearContext = await getSchoolYearContext()
  let schoolYearId = yearContext?.schoolYearId

  if (!schoolYearId) {
    const activeYear = await studentQueries.getActiveSchoolYear(context.schoolId)
    if (!activeYear) {
      throw new Error('No school year selected. Please select a school year.')
    }
    schoolYearId = activeYear.id
  }

  return await studentQueries.generateMatricule(context.schoolId, schoolYearId)
})
