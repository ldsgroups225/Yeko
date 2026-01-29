import type { TimetableConflict } from '@repo/data-ops/queries/timetables'
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
    return (await timetableQueries.getTimetableByClass(data)).match(
      value => ({ success: true as const, data: value }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération de l\'emploi du temps de la classe' }),
    )
  })

export const getTimetableByTeacher = authServerFn
  .inputValidator(getTimetableByTeacherSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('teachers', 'view')
    return (await timetableQueries.getTimetableByTeacher(data)).match(
      value => ({ success: true as const, data: value }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération de l\'emploi du temps de l\'enseignant' }),
    )
  })

export const getTimetableByClassroom = authServerFn
  .inputValidator(getTimetableByClassroomSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classrooms', 'view')
    return (await timetableQueries.getTimetableByClassroom(data)).match(
      value => ({ success: true as const, data: value }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération de l\'emploi du temps de la salle' }),
    )
  })

export const getTimetableSession = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classes', 'view')
    return (await timetableQueries.getTimetableSessionById(data.id)).match(
      value => ({ success: true as const, data: value }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération de la séance' }),
    )
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

    if (conflictsResult.isErr()) {
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

    return (await timetableQueries.createTimetableSession({
      id: crypto.randomUUID(),
      ...data,
    })).match(
      async (value) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'create',
          tableName: 'timetable_sessions',
          recordId: value.id,
          newValues: data,
        })
        return { success: true as const, data: value }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la création de la séance' }),
    )
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
    if (existingResult.isErr()) {
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

      if (conflictsResult.isErr()) {
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

    return (await timetableQueries.updateTimetableSession(id, updateData)).match(
      async (value) => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'update',
          tableName: 'timetable_sessions',
          recordId: id,
          newValues: updateData,
        })
        return { success: true as const, data: value }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la mise à jour de la séance' }),
    )
  })

export const deleteTimetableSession = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    await requirePermission('classes', 'edit')

    return (await timetableQueries.deleteTimetableSession(data.id)).match(
      async () => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'delete',
          tableName: 'timetable_sessions',
          recordId: data.id,
        })
        return { success: true as const, data: { success: true } }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la suppression de la séance' }),
    )
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

      if (conflictsResult.isErr()) {
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

      if (createResult.isOk()) {
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

    return (await timetableQueries.deleteClassTimetable(data.classId, data.schoolYearId)).match(
      async () => {
        await createAuditLog({
          schoolId,
          userId,
          action: 'delete',
          tableName: 'timetable_sessions',
          recordId: `class-${data.classId}`,
          newValues: { classId: data.classId, schoolYearId: data.schoolYearId },
        })
        return { success: true as const, data: { success: true } }
      },
      _ => ({ success: false as const, error: 'Erreur lors de la suppression de l\'emploi du temps' }),
    )
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
    return (await timetableQueries.detectConflicts(data)).match(
      value => ({ success: true as const, data: value }),
      _ => ({ success: false as const, error: 'Échec de la vérification des conflits' }),
    )
  })

export const getAllConflicts = authServerFn
  .inputValidator(z.object({ schoolId: z.string(), schoolYearId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    await requirePermission('classes', 'view')
    return (await timetableQueries.getAllConflictsForSchool(data.schoolId, data.schoolYearId)).match(
      value => ({ success: true as const, data: value }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des conflits' }),
    )
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
    return (await timetableQueries.getTeacherWeeklyHours(data.teacherId, data.schoolYearId)).match(
      value => ({ success: true as const, data: value }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des heures hebdomadaires' }),
    )
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
    return (await timetableQueries.getTeacherAvailability(data)).match(
      value => ({ success: true as const, data: value }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération de la disponibilité de l\'enseignant' }),
    )
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
    return (await timetableQueries.getClassroomAvailability(data)).match(
      value => ({ success: true as const, data: value }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération de la disponibilité de la salle' }),
    )
  })
