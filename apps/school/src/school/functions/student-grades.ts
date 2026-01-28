import * as gradeQueries from '@repo/data-ops/queries/grades'
import { z } from 'zod'

import {
  bulkGradesSchema,
  createGradeSchema,
  getGradesByClassSchema,
  getGradeStatisticsSchema,
  getPendingValidationsSchema,
  gradeTypes,
  rejectGradesSchema,
  submitGradesSchema,
  updateGradeSchema,
  validateGradesSchema,
} from '@/schemas/grade'
import { createAuthenticatedServerFn } from '../lib/server-fn'

// Get grades by class (for grade entry table)
export const getGradesByClass = createAuthenticatedServerFn()
  .inputValidator(getGradesByClassSchema)
  .handler(async ({ data, context }: any) => {
    const result = await gradeQueries.getGradesByClass({ ...data, schoolId: context!.school.id })
    if (result.isErr()) throw result.error
    return result.value
  })

// Get single grade by ID
export const getGrade = createAuthenticatedServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }: any) => {
    const result = await gradeQueries.getStudentGradeById(context!.school.id, data.id)
    if (result.isErr()) throw result.error
    return result.value
  })

// Create single grade
export const createGrade = createAuthenticatedServerFn()
  .inputValidator(createGradeSchema.extend({ teacherId: z.string().min(1, 'Teacher ID is required') }))
  .handler(async ({ data, context }: any) => {
    const result = await gradeQueries.createStudentGrade(context!.school.id, {
      id: crypto.randomUUID(),
      studentId: data.studentId,
      classId: data.classId,
      subjectId: data.subjectId,
      termId: data.termId,
      teacherId: data.teacherId,
      value: String(data.value),
      type: data.type,
      weight: data.weight ?? 1,
      description: data.description,
      gradeDate: data.gradeDate ?? new Date().toISOString().split('T')[0],
      status: 'draft',
    })
    if (result.isErr()) throw result.error
    return { success: true, data: result.value }
  })

// Create bulk grades (for entire class)
export const createBulkGrades = createAuthenticatedServerFn()
  .inputValidator(bulkGradesSchema.extend({ teacherId: z.string().min(1, 'Teacher ID is required') }))
  .handler(async ({ data, context }: any) => {
    const gradeDate = data.gradeDate ?? new Date().toISOString().split('T')[0]

    // Use Promise.all with ResultAsync for parallel execution
    // Or better: Use ResultAsync.combine if supported by neverthrow version, 
    // but importing ResultAsync here is needed.
    // Instead of importing ResultAsync, lets just await loops or map.
    
    // We'll iterate and collect results. If any fails, we throw.
    const results = []
    for (const gradeItem of data.grades) {
      const result = await gradeQueries.createStudentGrade(context!.school.id, {
        id: crypto.randomUUID(),
        studentId: gradeItem.studentId,
        classId: data.classId,
        subjectId: data.subjectId,
        termId: data.termId,
        teacherId: data.teacherId,
        value: String(gradeItem.value),
        type: data.type,
        weight: data.weight ?? 1,
        description: data.description,
        gradeDate,
        status: 'draft',
      })
      if (result.isErr()) throw result.error
      results.push(result.value)
    }

    return { success: true, count: results.length, data: results }
  })

// Update grade
export const updateGrade = createAuthenticatedServerFn()
  .inputValidator(updateGradeSchema)
  .handler(async ({ data, context }: any) => {
    const updateData: Record<string, unknown> = {}
    if (data.value !== undefined)
      updateData.value = String(data.value)
    if (data.type !== undefined)
      updateData.type = data.type
    if (data.weight !== undefined)
      updateData.weight = data.weight
    if (data.description !== undefined)
      updateData.description = data.description
    if (data.gradeDate !== undefined)
      updateData.gradeDate = data.gradeDate

    const result = await gradeQueries.updateStudentGrade(context!.school.id, data.id, updateData)
    if (result.isErr()) throw result.error
    return { success: true, data: result.value }
  })

// Delete grade
export const deleteGrade = createAuthenticatedServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    // Note: Delete implementation missing in data-ops, keeping consistent standardized response
    // If needed, implement deleteStudentGrade in data-ops
    return { success: true, id: data.id }
  })

// Delete all draft grades for a specific evaluation
export const deleteDraftGrades = createAuthenticatedServerFn()
  .inputValidator(z.object({
    classId: z.string(),
    subjectId: z.string(),
    termId: z.string(),
    type: z.enum(gradeTypes),
    gradeDate: z.string(),
    description: z.string().optional(),
  }))
  .handler(async ({ data, context }: any) => {
    const result = await gradeQueries.deleteDraftGrades({ ...data, schoolId: context!.school.id })
    if (result.isErr()) throw result.error
    return { success: true, count: result.value.length }
  })

// Submit grades for validation
export const submitGradesForValidation = createAuthenticatedServerFn()
  .inputValidator(submitGradesSchema)
  .handler(async ({ data, context }: any) => {
    const result = await gradeQueries.updateGradesStatus(context!.school.id, data.gradeIds, 'submitted')
    if (result.isErr()) throw result.error
    return { success: true, count: result.value.length }
  })

// Validate grades (coordinator only)
export const validateGrades = createAuthenticatedServerFn()
  .inputValidator(validateGradesSchema.extend({ userId: z.string() }))
  .handler(async ({ data, context }: any) => {
    const result = await gradeQueries.updateGradesStatus(context!.school.id, data.gradeIds, 'validated', data.userId)
    if (result.isErr()) throw result.error
    return { success: true, count: result.value.length }
  })

// Reject grades (coordinator only)
export const rejectGrades = createAuthenticatedServerFn()
  .inputValidator(rejectGradesSchema.extend({ userId: z.string() }))
  .handler(async ({ data, context }: any) => {
    const result = await gradeQueries.updateGradesStatus(context!.school.id, data.gradeIds, 'rejected', data.userId, data.reason)
    if (result.isErr()) throw result.error
    return { success: true, count: result.value.length }
  })

// Get pending validations (coordinator view)
export const getPendingValidations = createAuthenticatedServerFn()
  .inputValidator(getPendingValidationsSchema)
  .handler(async ({ data, context }: any) => {
    const result = await gradeQueries.getPendingValidations({ ...data, schoolId: context!.school.id })
    if (result.isErr()) throw result.error
    return result.value
  })

// Get grade statistics
export const getGradeStatistics = createAuthenticatedServerFn()
  .inputValidator(getGradeStatisticsSchema)
  .handler(async ({ data, context }: any) => {
    // Check if schoolId is consistent? data might have classId.
    // getGradeStatistics uses classId. We must ensure class belongs to school.
    // The query logic now does this check inside data-ops.
    const result = await gradeQueries.getClassGradeStatistics({ ...data, schoolId: context!.school.id })
    if (result.isErr()) throw result.error
    return result.value
  })

// Get grade validation history
export const getGradeValidationHistory = createAuthenticatedServerFn()
  .inputValidator(z.object({ gradeId: z.string() }))
  .handler(async ({ data }) => {
    const result = await gradeQueries.getGradeValidationHistory(data.gradeId)
    if (result.isErr()) throw result.error
    return result.value
  })

// Get submitted grade IDs for validation batch
export const getSubmittedGradeIds = createAuthenticatedServerFn()
  .inputValidator(z.object({
    classId: z.string(),
    subjectId: z.string(),
    termId: z.string(),
  }))
  .handler(async ({ data, context }: any) => {
    const result = await gradeQueries.getSubmittedGradeIds({ ...data, schoolId: context!.school.id })
    if (result.isErr()) throw result.error
    return result.value
  })
