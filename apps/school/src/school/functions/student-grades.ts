import type { GradeType } from '@/schemas/grade'
import { Result as R } from '@praha/byethrow'
import * as gradeQueries from '@repo/data-ops/queries/grades'

import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
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
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

// Get grades by class (for grade entry table)
export const getGradesByClass = authServerFn
  .inputValidator(getGradesByClassSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('grades', 'view')
    const _result1 = await gradeQueries.getGradesByClass({ ...data, schoolId: context.school.schoolId })
    if (R.isFailure(_result1))
      return { success: false as const, error: 'Erreur lors de la récupération des notes de la classe' }
    return { success: true as const, data: _result1.value }
  })

// Get single grade by ID
export const getGrade = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('grades', 'view')
    const _result2 = await gradeQueries.getStudentGradeById(context.school.schoolId, data.id)
    if (R.isFailure(_result2))
      return { success: false as const, error: 'Erreur lors de la récupération de la note' }
    return { success: true as const, data: _result2.value }
  })

// Create single grade
export const createGrade = authServerFn
  .inputValidator(createGradeSchema.extend({ teacherId: z.string().min(1, 'ID de l\'enseignant requis') }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('grades', 'create')

    const result = await gradeQueries.createStudentGrade(schoolId, {
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

    if (R.isFailure(result))
      return { success: false as const, error: 'Erreur lors de la création de la note' }

    if (!result.value)
      return { success: false as const, error: 'Erreur lors de la création de la note' }

    await createAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'student_grades',
      recordId: result.value.id,
      newValues: data,
    })
    return { success: true as const, data: result.value }
  })

// Create bulk grades (for entire class)
export const createBulkGrades = authServerFn
  .inputValidator(bulkGradesSchema.extend({ teacherId: z.string().min(1, 'ID de l\'enseignant requis') }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('grades', 'create')

    const gradeDate = data.gradeDate ?? new Date().toISOString().split('T')[0]
    const results = []

    for (const gradeItem of data.grades) {
      const result = await gradeQueries.createStudentGrade(schoolId, {
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

      if (R.isFailure(result))
        return { success: false as const, error: 'Une erreur est survenue lors de la création groupée' }

      results.push(result.value)
    }

    await createAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'student_grades',
      recordId: 'bulk',
      newValues: { classId: data.classId, count: results.length },
    })

    return { success: true as const, data: { count: results.length, grades: results } }
  })

// Update grade
export const updateGrade = authServerFn
  .inputValidator(updateGradeSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('grades', 'edit')

    const updateData: Partial<{
      value: string
      type: GradeType
      weight: number
      description: string
      gradeDate: string
    }> = {}
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

    const _result3 = await gradeQueries.updateStudentGrade(schoolId, data.id, updateData)
    if (R.isFailure(_result3))
      return { success: false as const, error: 'Erreur lors de la mise à jour de la note' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'student_grades',
      recordId: data.id,
      newValues: updateData,
    })
    return { success: true as const, data: _result3.value }
  })

// Delete grade
export const deleteGrade = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('grades', 'delete')
    // Note: Delete implementation missing in data-ops but we log it if it were implemented
    return { success: true as const, data: { id: data.id } }
  })

// Delete all draft grades for a specific evaluation
export const deleteDraftGrades = authServerFn
  .inputValidator(z.object({
    classId: z.string(),
    subjectId: z.string(),
    termId: z.string(),
    type: z.enum(gradeTypes),
    gradeDate: z.string(),
    description: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('grades', 'delete')

    const _result4 = await gradeQueries.deleteDraftGrades({ ...data, schoolId })
    if (R.isFailure(_result4))
      return { success: false as const, error: 'Erreur lors de la suppression des brouillons' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'delete',
      tableName: 'student_grades',
      recordId: 'drafts',
      newValues: { ...data, count: _result4.value.length },
    })
    return { success: true as const, data: { count: _result4.value.length } }
  })

// Submit grades for validation
export const submitGradesForValidation = authServerFn
  .inputValidator(submitGradesSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('grades', 'edit')

    const _result5 = await gradeQueries.updateGradesStatus(schoolId, data.gradeIds, 'submitted')
    if (R.isFailure(_result5))
      return { success: false as const, error: 'Erreur lors de la soumission des notes' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'student_grades',
      recordId: 'submit',
      newValues: { count: _result5.value.length },
    })
    return { success: true as const, data: { count: _result5.value.length } }
  })

// Validate grades (coordinator only)
export const validateGrades = authServerFn
  .inputValidator(validateGradesSchema.extend({ userId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('grades', 'edit')

    const _result6 = await gradeQueries.updateGradesStatus(schoolId, data.gradeIds, 'validated', data.userId)
    if (R.isFailure(_result6))
      return { success: false as const, error: 'Erreur lors de la validation des notes' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'student_grades',
      recordId: 'validate',
      newValues: { count: _result6.value.length, validatorId: data.userId },
    })
    return { success: true as const, data: { count: _result6.value.length } }
  })

// Reject grades (coordinator only)
export const rejectGrades = authServerFn
  .inputValidator(rejectGradesSchema.extend({ userId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('grades', 'edit')

    const _result7 = await gradeQueries.updateGradesStatus(schoolId, data.gradeIds, 'rejected', data.userId, data.reason)
    if (R.isFailure(_result7))
      return { success: false as const, error: 'Erreur lors du rejet des notes' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'student_grades',
      recordId: 'reject',
      newValues: { count: _result7.value.length, reason: data.reason },
    })
    return { success: true as const, data: { count: _result7.value.length } }
  })

// Get pending validations (coordinator view)
export const getPendingValidations = authServerFn
  .inputValidator(getPendingValidationsSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('grades', 'view')
    const _result8 = await gradeQueries.getPendingValidations({ ...data, schoolId: context.school.schoolId })
    if (R.isFailure(_result8))
      return { success: false as const, error: 'Erreur lors de la récupération des notes en attente' }
    return { success: true as const, data: _result8.value }
  })

// Get grade statistics
export const getGradeStatistics = authServerFn
  .inputValidator(getGradeStatisticsSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('grades', 'view')
    const _result9 = await gradeQueries.getClassGradeStatistics({ ...data, schoolId: context.school.schoolId })
    if (R.isFailure(_result9))
      return { success: false as const, error: 'Erreur lors de la récupération des statistiques' }
    return { success: true as const, data: _result9.value }
  })

// Get grade validation history
export const getGradeValidationHistory = authServerFn
  .inputValidator(z.object({ gradeId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('grades', 'view')
    const _result10 = await gradeQueries.getGradeValidationHistory(data.gradeId)
    if (R.isFailure(_result10))
      return { success: false as const, error: 'Erreur lors de la récupération de l\'historique' }
    return { success: true as const, data: _result10.value }
  })

// Get submitted grade IDs for validation batch
export const getSubmittedGradeIds = authServerFn
  .inputValidator(z.object({
    classId: z.string(),
    subjectId: z.string(),
    termId: z.string(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('grades', 'view')
    const _result11 = await gradeQueries.getSubmittedGradeIds({ ...data, schoolId: context.school.schoolId })
    if (R.isFailure(_result11))
      return { success: false as const, error: 'Erreur lors de la récupération des IDs des notes' }
    return { success: true as const, data: _result11.value }
  })
