import { Result as R } from '@praha/byethrow'
import * as classSubjectQueries from '@repo/data-ops/queries/class-subjects'
import {
  copyClassSubjects as dbCopyClassSubjects,
  removeSubjectFromClass as dbRemoveSubjectFromClass,
} from '@repo/data-ops/queries/class-subjects'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import { z } from 'zod'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

export const getClassSubjects = authServerFn
  .inputValidator(
    z.object({
      classId: z.string().optional(),
      subjectId: z.string().optional(),
      teacherId: z.string().optional(),
      schoolYearId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('classes', 'view')
    const _result1 = await classSubjectQueries.getClassSubjects({ ...data, schoolId })
    if (R.isFailure(_result1))
      return { success: false as const, error: 'Erreur lors de la récupération des matières de la classe' }
    return { success: true as const, data: _result1.value }
  })

export const getAssignmentMatrix = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: schoolYearId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId } = context.school
    await requirePermission('classes', 'view')
    const _result2 = await classSubjectQueries.getAssignmentMatrix(schoolId, schoolYearId)
    if (R.isFailure(_result2))
      return { success: false as const, error: 'Erreur lors de la récupération de la matrice d\'assignation' }
    return { success: true as const, data: _result2.value }
  })

export const assignTeacherToClassSubject = authServerFn
  .inputValidator(
    z.object({
      classId: z.string(),
      subjectId: z.string(),
      teacherId: z.string(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')
    const _result3 = await classSubjectQueries.assignTeacherToClassSubject(
      data.classId,
      data.subjectId,
      data.teacherId,
    )
    if (R.isFailure(_result3))
      return { success: false as const, error: 'Erreur lors de l\'assignation de l\'enseignant' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'class_subjects',
      recordId: _result3.value.id,
      newValues: data,
    })
    return { success: true as const, data: _result3.value }
  })

export const bulkAssignTeacher = authServerFn
  .inputValidator(
    z.array(
      z.object({
        classId: z.string(),
        subjectId: z.string(),
        teacherId: z.string(),
      }),
    ),
  )
  .handler(async ({ data: assignments, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')
    const _result4 = await classSubjectQueries.bulkAssignTeacher(assignments)
    if (R.isFailure(_result4))
      return { success: false as const, error: 'Erreur lors de l\'assignation groupée des enseignants' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'class_subjects',
      recordId: 'bulk',
      newValues: { count: assignments.length },
    })
    return { success: true as const, data: _result4.value }
  })

export const removeTeacherFromClassSubject = authServerFn
  .inputValidator(
    z.object({
      classId: z.string(),
      subjectId: z.string(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')
    const _result5 = await classSubjectQueries.removeTeacherFromClassSubject(data.classId, data.subjectId)
    if (R.isFailure(_result5))
      return { success: false as const, error: 'Erreur lors du retrait de l\'enseignant' }
    if (_result5.value) {
      await createAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'class_subjects',
        recordId: _result5.value.id,
        oldValues: { teacherId: _result5.value.teacherId },
        newValues: { teacherId: null },
      })
    }
    return { success: true as const, data: _result5.value }
  })

export const detectTeacherConflicts = authServerFn
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolYearId: z.string(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classes', 'view')
    const _result6 = await classSubjectQueries.detectTeacherConflicts(data.teacherId, data.schoolYearId)
    if (R.isFailure(_result6))
      return { success: false as const, error: 'Erreur lors de la détection des conflits' }
    return { success: true as const, data: _result6.value }
  })

export const saveClassSubject = authServerFn
  .inputValidator(z.object({
    classId: z.string(),
    subjectId: z.string(),
    teacherId: z.string().optional().nullable(),
    coefficient: z.number().min(0).optional(),
    hoursPerWeek: z.number().min(0).optional(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')

    const _result7 = await classSubjectQueries.addSubjectToClass(data)
    if (R.isFailure(_result7))
      return { success: false as const, error: 'Erreur lors de l\'ajout de la matière à la classe' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'class_subjects',
      recordId: _result7.value.id,
      newValues: data,
    })
    return { success: true as const, data: _result7.value }
  })

export const updateClassSubjectConfig = authServerFn
  .inputValidator(z.object({
    id: z.string(),
    coefficient: z.number().optional(),
    hoursPerWeek: z.number().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')

    const _result8 = await classSubjectQueries.updateClassSubjectDetails(data.id, {
      coefficient: data.coefficient,
      hoursPerWeek: data.hoursPerWeek,
      status: data.status,
    })
    if (R.isFailure(_result8))
      return { success: false as const, error: 'Erreur lors de la mise à jour de la configuration de la matière' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'class_subjects',
      recordId: _result8.value.id,
      newValues: data,
    })
    return { success: true as const, data: _result8.value }
  })

export const removeClassSubject = authServerFn
  .inputValidator(z.object({ classId: z.string(), subjectId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')

    const _result9 = await dbRemoveSubjectFromClass(data.classId, data.subjectId)
    if (R.isFailure(_result9))
      return { success: false as const, error: 'Erreur lors de la suppression de la matière de la classe' }
    if (_result9.value) {
      await createAuditLog({
        schoolId,
        userId,
        action: 'delete',
        tableName: 'class_subjects',
        recordId: _result9.value.id,
        newValues: { status: 'deleted' },
      })
    }
    return { success: true as const, data: _result9.value }
  })

export const copyClassSubjects = authServerFn
  .inputValidator(z.object({
    sourceClassId: z.string(),
    targetClassId: z.string(),
    overwrite: z.boolean().optional(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')

    const { sourceClassId, targetClassId, overwrite } = data

    const _result10 = await dbCopyClassSubjects(sourceClassId, targetClassId, { overwrite })
    if (R.isFailure(_result10))
      return { success: false as const, error: 'Erreur lors de la copie des matières' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'class_subjects',
      recordId: targetClassId,
      newValues: { sourceClassId, count: _result10.value.length },
    })
    return { success: true as const, data: { count: _result10.value.length } }
  })
