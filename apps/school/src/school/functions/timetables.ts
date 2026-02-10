import type { TimetableConflict } from '@repo/data-ops/queries/timetables'
import { Result as R } from '@praha/byethrow'
import { createAuditLog } from '@repo/data-ops/queries/school-admin/audit'
import * as timetableQueries from '@repo/data-ops/queries/timetables'
import { z } from 'zod'
import {
  createTimetableSessionSchema,
  detectConflictsSchema,
  getTimetableByClassroomSchema,
  getTimetableByClassSchema,
  getTimetableByTeacherSchema,
  importTimetableSchema,
  updateTimetableSessionSchema,
} from '@/schemas/timetable'
import { authServerFn } from '../lib/server-fn'
import { requirePermission } from '../middleware/permissions'

// ============================================
// TIMETABLE QUERIES
// ============================================

export const getTimetableByClass = authServerFn
  .inputValidator(getTimetableByClassSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classes', 'view')
    const _result1 = await timetableQueries.getTimetableByClass(data)
    if (R.isFailure(_result1))
      return { success: false as const, error: 'Erreur lors de la récupération de l\'emploi du temps de la classe' }
    return { success: true as const, data: _result1.value }
  })

export const getTimetableByTeacher = authServerFn
  .inputValidator(getTimetableByTeacherSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('teachers', 'view')
    const _result2 = await timetableQueries.getTimetableByTeacher(data)
    if (R.isFailure(_result2))
      return { success: false as const, error: 'Erreur lors de la récupération de l\'emploi du temps de l\'enseignant' }
    return { success: true as const, data: _result2.value }
  })

export const getTimetableByClassroom = authServerFn
  .inputValidator(getTimetableByClassroomSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classrooms', 'view')
    const _result3 = await timetableQueries.getTimetableByClassroom(data)
    if (R.isFailure(_result3))
      return { success: false as const, error: 'Erreur lors de la récupération de l\'emploi du temps de la salle' }
    return { success: true as const, data: _result3.value }
  })

export const getTimetableSession = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classes', 'view')
    const _result4 = await timetableQueries.getTimetableSessionById(data.id)
    if (R.isFailure(_result4))
      return { success: false as const, error: 'Erreur lors de la récupération de la séance' }
    return { success: true as const, data: _result4.value }
  })

// ============================================
// TIMETABLE MUTATIONS
// ============================================

export const createTimetableSession = authServerFn
  .inputValidator(createTimetableSessionSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')

    // Check for conflicts before creating
    const conflictsResult = await timetableQueries.detectConflicts({
      schoolId: data.schoolId,
      schoolYearId: data.schoolYearId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      teacherId: data.teacherId,
      classroomId: data.classroomId,
      classId: data.classId,
    })

    if (R.isFailure(conflictsResult)) {
      return { success: false as const, error: 'Échec de la vérification des conflits' }
    }

    const conflicts = conflictsResult.value

    if (conflicts.length > 0) {
      return {
        success: false as const,
        error: 'Conflits détectés',
        data: { conflicts },
      }
    }

    const _result5 = await timetableQueries.createTimetableSession({
      id: crypto.randomUUID(),
      ...data,
    })
    if (R.isFailure(_result5))
      return { success: false as const, error: 'Erreur lors de la création de la séance' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'timetable_sessions',
      recordId: _result5.value.id,
      newValues: data,
    })
    return { success: true as const, data: _result5.value }
  })

export const updateTimetableSession = authServerFn
  .inputValidator(updateTimetableSessionSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')

    const { id, ...updateData } = data

    // Get existing session to check conflicts
    const existingResult = await timetableQueries.getTimetableSessionById(id)
    if (R.isFailure(existingResult)) {
      return { success: false as const, error: 'Erreur lors de la récupération de la séance' }
    }
    const existing = existingResult.value

    if (!existing) {
      return { success: false as const, error: 'Séance non trouvée' }
    }

    // Check for conflicts if time/day/teacher/classroom changed
    if (
      updateData.dayOfWeek !== undefined
      || updateData.startTime !== undefined
      || updateData.endTime !== undefined
      || updateData.teacherId !== undefined
      || updateData.classroomId !== undefined
    ) {
      const conflictsResult = await timetableQueries.detectConflicts({
        schoolId: existing.schoolId,
        schoolYearId: existing.schoolYearId,
        dayOfWeek: updateData.dayOfWeek ?? existing.dayOfWeek,
        startTime: updateData.startTime ?? existing.startTime,
        endTime: updateData.endTime ?? existing.endTime,
        teacherId: updateData.teacherId ?? existing.teacherId,
        classroomId: updateData.classroomId ?? existing.classroomId ?? undefined,
        classId: existing.classId,
        excludeSessionId: id,
      })

      if (R.isFailure(conflictsResult)) {
        return { success: false as const, error: 'Échec de la vérification des conflits' }
      }

      const conflicts = conflictsResult.value

      if (conflicts.length > 0) {
        return {
          success: false as const,
          error: 'Conflits détectés',
          data: { conflicts },
        }
      }
    }

    const _result6 = await timetableQueries.updateTimetableSession(id, updateData)
    if (R.isFailure(_result6))
      return { success: false as const, error: 'Erreur lors de la mise à jour de la séance' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'update',
      tableName: 'timetable_sessions',
      recordId: id,
      newValues: updateData,
    })
    return { success: true as const, data: _result6.value }
  })

export const deleteTimetableSession = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')

    const _result7 = await timetableQueries.deleteTimetableSession(data.id)
    if (R.isFailure(_result7))
      return { success: false as const, error: 'Erreur lors de la suppression de la séance' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'delete',
      tableName: 'timetable_sessions',
      recordId: data.id,
    })
    return { success: true as const, data: { success: true } }
  })

// ============================================
// BULK OPERATIONS
// ============================================

export const importTimetable = authServerFn
  .inputValidator(importTimetableSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')

    const results = {
      total: data.sessions.length,
      success: 0,
      failed: 0,
      conflicts: [] as { index: number, conflicts: TimetableConflict[] }[],
    }

    // If replaceExisting, delete existing sessions
    if (data.replaceExisting) {
      const classIds = [...new Set(data.sessions.map(s => s.classId))]
      for (const classId of classIds) {
        await timetableQueries.deleteClassTimetable(classId, data.schoolYearId)
      }
    }

    // Create sessions
    for (let i = 0; i < data.sessions.length; i++) {
      const session = data.sessions[i]
      if (!session)
        continue

      // Check for conflicts
      const conflictsResult = await timetableQueries.detectConflicts({
        schoolId: data.schoolId,
        schoolYearId: data.schoolYearId,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        teacherId: session.teacherId,
        classroomId: session.classroomId,
        classId: session.classId,
      })

      if (R.isFailure(conflictsResult)) {
        results.failed++
        continue
      }

      const conflicts = conflictsResult.value

      if (conflicts.length > 0) {
        results.failed++
        results.conflicts.push({ index: i, conflicts })
        continue
      }

      const createResult = await timetableQueries.createTimetableSession({
        id: crypto.randomUUID(),
        schoolId: data.schoolId,
        schoolYearId: data.schoolYearId,
        ...session,
      })

      if (R.isSuccess(createResult)) {
        results.success++
      }
      else {
        results.failed++
      }
    }

    await createAuditLog({
      schoolId,
      userId,
      action: 'create',
      tableName: 'timetable_sessions',
      recordId: 'bulk-import',
      newValues: { total: data.sessions.length, success: results.success },
    })

    return { success: true as const, data: results }
  })

export const deleteClassTimetable = authServerFn
  .inputValidator(z.object({ classId: z.string(), schoolYearId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')

    const _result8 = await timetableQueries.deleteClassTimetable(data.classId, data.schoolYearId)
    if (R.isFailure(_result8))
      return { success: false as const, error: 'Erreur lors de la suppression de l\'emploi du temps' }
    await createAuditLog({
      schoolId,
      userId,
      action: 'delete',
      tableName: 'timetable_sessions',
      recordId: `class-${data.classId}`,
      newValues: { classId: data.classId, schoolYearId: data.schoolYearId },
    })
    return { success: true as const, data: { success: true } }
  })

// ============================================
// CONFLICT DETECTION
// ============================================

export const detectConflicts = authServerFn
  .inputValidator(detectConflictsSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classes', 'view')
    const _result9 = await timetableQueries.detectConflicts(data)
    if (R.isFailure(_result9))
      return { success: false as const, error: 'Échec de la vérification des conflits' }
    return { success: true as const, data: _result9.value }
  })

export const getAllConflicts = authServerFn
  .inputValidator(z.object({ schoolId: z.string(), schoolYearId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classes', 'view')
    const _result10 = await timetableQueries.getAllConflictsForSchool(data.schoolId, data.schoolYearId)
    if (R.isFailure(_result10))
      return { success: false as const, error: 'Erreur lors de la récupération des conflits' }
    return { success: true as const, data: _result10.value }
  })

// ============================================
// TEACHER WORKLOAD & AVAILABILITY
// ============================================

export const getTeacherWeeklyHours = authServerFn
  .inputValidator(z.object({ teacherId: z.string(), schoolYearId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('teachers', 'view')
    const _result11 = await timetableQueries.getTeacherWeeklyHours(data.teacherId, data.schoolYearId)
    if (R.isFailure(_result11))
      return { success: false as const, error: 'Erreur lors de la récupération des heures hebdomadaires' }
    return { success: true as const, data: _result11.value }
  })

export const getTeacherAvailability = authServerFn
  .inputValidator(z.object({
    teacherId: z.string(),
    schoolYearId: z.string(),
    dayOfWeek: z.number().min(1).max(7),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('teachers', 'view')
    const _result12 = await timetableQueries.getTeacherAvailability(data)
    if (R.isFailure(_result12))
      return { success: false as const, error: 'Erreur lors de la récupération de la disponibilité de l\'enseignant' }
    return { success: true as const, data: _result12.value }
  })

export const getClassroomAvailability = authServerFn
  .inputValidator(z.object({
    classroomId: z.string(),
    schoolYearId: z.string(),
    dayOfWeek: z.number().min(1).max(7),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classrooms', 'view')
    const _result13 = await timetableQueries.getClassroomAvailability(data)
    if (R.isFailure(_result13))
      return { success: false as const, error: 'Erreur lors de la récupération de la disponibilité de la salle' }
    return { success: true as const, data: _result13.value }
  })
