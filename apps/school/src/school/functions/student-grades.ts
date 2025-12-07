import * as gradeQueries from '@repo/data-ops/queries/grades'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  bulkGradesSchema,
  createGradeSchema,
  getGradesByClassSchema,
  getGradeStatisticsSchema,
  getPendingValidationsSchema,
  rejectGradesSchema,
  submitGradesSchema,
  updateGradeSchema,
  validateGradesSchema,
} from '@/schemas/grade'

// Get grades by class (for grade entry table)
export const getGradesByClass = createServerFn()
  .inputValidator(getGradesByClassSchema)
  .handler(async ({ data }) => {
    return await gradeQueries.getGradesByClass(data)
  })

// Get single grade by ID
export const getGrade = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    return await gradeQueries.getStudentGradeById(data.id)
  })

// Create single grade
export const createGrade = createServerFn()
  .inputValidator(createGradeSchema.extend({ teacherId: z.string() }))
  .handler(async ({ data }) => {
    const grade = await gradeQueries.createStudentGrade({
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
    return { success: true, data: grade }
  })

// Create bulk grades (for entire class)
export const createBulkGrades = createServerFn()
  .inputValidator(bulkGradesSchema.extend({ teacherId: z.string() }))
  .handler(async ({ data }) => {
    const results = []
    const gradeDate = data.gradeDate ?? new Date().toISOString().split('T')[0]

    for (const gradeItem of data.grades) {
      const grade = await gradeQueries.createStudentGrade({
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
      results.push(grade)
    }

    return { success: true, count: results.length, data: results }
  })

// Update grade
export const updateGrade = createServerFn()
  .inputValidator(updateGradeSchema)
  .handler(async ({ data }) => {
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

    const grade = await gradeQueries.updateStudentGrade(data.id, updateData)
    return { success: true, data: grade }
  })

// Delete grade
export const deleteGrade = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    return { success: true, id: data.id }
  })

// Submit grades for validation
export const submitGradesForValidation = createServerFn()
  .inputValidator(submitGradesSchema)
  .handler(async ({ data }) => {
    const updated = await gradeQueries.updateGradesStatus(data.gradeIds, 'submitted')
    return { success: true, count: updated.length }
  })

// Validate grades (coordinator only)
export const validateGrades = createServerFn()
  .inputValidator(validateGradesSchema.extend({ userId: z.string() }))
  .handler(async ({ data }) => {
    const updated = await gradeQueries.updateGradesStatus(data.gradeIds, 'validated', data.userId)
    return { success: true, count: updated.length }
  })

// Reject grades (coordinator only)
export const rejectGrades = createServerFn()
  .inputValidator(rejectGradesSchema.extend({ userId: z.string() }))
  .handler(async ({ data }) => {
    const updated = await gradeQueries.updateGradesStatus(data.gradeIds, 'rejected', data.userId, data.reason)
    return { success: true, count: updated.length }
  })

// Get pending validations (coordinator view)
export const getPendingValidations = createServerFn()
  .inputValidator(getPendingValidationsSchema)
  .handler(async ({ data }) => {
    return await gradeQueries.getPendingValidations(data)
  })

// Get grade statistics
export const getGradeStatistics = createServerFn()
  .inputValidator(getGradeStatisticsSchema)
  .handler(async ({ data }) => {
    return await gradeQueries.getClassGradeStatistics(data)
  })

// Get grade validation history
export const getGradeValidationHistory = createServerFn()
  .inputValidator(z.object({ gradeId: z.string() }))
  .handler(async ({ data }) => {
    return await gradeQueries.getGradeValidationHistory(data.gradeId)
  })

// Get submitted grade IDs for validation batch
export const getSubmittedGradeIds = createServerFn()
  .inputValidator(z.object({
    classId: z.string(),
    subjectId: z.string(),
    termId: z.string(),
  }))
  .handler(async ({ data }) => {
    return await gradeQueries.getSubmittedGradeIds(data)
  })
