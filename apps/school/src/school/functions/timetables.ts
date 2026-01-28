import type { TimetableConflict } from '@repo/data-ops/queries/timetables'
import * as timetableQueries from '@repo/data-ops/queries/timetables'
import { createServerFn } from '@tanstack/react-start'
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

// ============================================
// TIMETABLE QUERIES
// ============================================

export const getTimetableByClass = createServerFn()
  .inputValidator(getTimetableByClassSchema)
  .handler(async ({ data }) => {
    const result = await timetableQueries.getTimetableByClass(data)
    if (result.isErr()) {
      return { success: false, error: result.error.message }
    }
    return { success: true, data: result.value }
  })

export const getTimetableByTeacher = createServerFn()
  .inputValidator(getTimetableByTeacherSchema)
  .handler(async ({ data }) => {
    const result = await timetableQueries.getTimetableByTeacher(data)
    if (result.isErr()) {
      return { success: false, error: result.error.message }
    }
    return { success: true, data: result.value }
  })

export const getTimetableByClassroom = createServerFn()
  .inputValidator(getTimetableByClassroomSchema)
  .handler(async ({ data }) => {
    const result = await timetableQueries.getTimetableByClassroom(data)
    if (result.isErr()) {
      return { success: false, error: result.error.message }
    }
    return { success: true, data: result.value }
  })

export const getTimetableSession = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const result = await timetableQueries.getTimetableSessionById(data.id)
    if (result.isErr()) {
      return { success: false, error: result.error.message }
    }
    return { success: true, data: result.value }
  })

// ============================================
// TIMETABLE MUTATIONS
// ============================================

export const createTimetableSession = createServerFn()
  .inputValidator(createTimetableSessionSchema)
  .handler(async ({ data }) => {
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
      return { success: false, error: 'Échec de la vérification des conflits' }
    }

    const conflicts = conflictsResult.value

    if (conflicts.length > 0) {
      return {
        success: false,
        error: 'Conflits détectés',
        conflicts,
      }
    }

    const sessionResult = await timetableQueries.createTimetableSession({
      id: crypto.randomUUID(),
      ...data,
    })

    if (sessionResult.isErr()) {
      return { success: false, error: sessionResult.error.message }
    }

    return { success: true, data: sessionResult.value }
  })

export const updateTimetableSession = createServerFn()
  .inputValidator(updateTimetableSessionSchema)
  .handler(async ({ data }) => {
    const { id, ...updateData } = data

    // Get existing session to check conflicts
    const existingResult = await timetableQueries.getTimetableSessionById(id)
    if (existingResult.isErr()) {
      return { success: false, error: 'Erreur lors de la récupération de la séance' }
    }
    const existing = existingResult.value

    if (!existing) {
      return { success: false, error: 'Séance non trouvée' }
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
        return { success: false, error: 'Échec de la vérification des conflits' }
      }

      const conflicts = conflictsResult.value

      if (conflicts.length > 0) {
        return {
          success: false,
          error: 'Conflits détectés',
          conflicts,
        }
      }
    }

    const sessionResult = await timetableQueries.updateTimetableSession(id, updateData)
    if (sessionResult.isErr()) {
      return { success: false, error: sessionResult.error.message }
    }

    return { success: true, data: sessionResult.value }
  })

export const deleteTimetableSession = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const result = await timetableQueries.deleteTimetableSession(data.id)
    if (result.isErr()) {
      return { success: false, error: result.error.message }
    }
    return { success: true }
  })

// ============================================
// BULK OPERATIONS
// ============================================

export const importTimetable = createServerFn()
  .inputValidator(importTimetableSchema)
  .handler(async ({ data }) => {
    const results = {
      total: data.sessions.length,
      success: 0,
      failed: 0,
      conflicts: [] as { index: number, conflicts: TimetableConflict[] }[],
    }

    // If replaceExisting, delete existing sessions for each class
    if (data.replaceExisting) {
      const classIds = [...new Set(data.sessions.map((s: { classId: string }) => s.classId))]
      for (const classId of classIds) {
        // We log error but don't abort specific class import if one delete fails?
        // Or should we? For now, simplistic approach as in original
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
        // Logled internal error in detectConflicts via tapLogErr
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

    return { success: true, data: results }
  })

export const deleteClassTimetable = createServerFn()
  .inputValidator(z.object({ classId: z.string(), schoolYearId: z.string() }))
  .handler(async ({ data }) => {
    const result = await timetableQueries.deleteClassTimetable(data.classId, data.schoolYearId)
    if (result.isErr()) {
      return { success: false, error: result.error.message }
    }
    return { success: true }
  })

// ============================================
// CONFLICT DETECTION
// ============================================

export const detectConflicts = createServerFn()
  .inputValidator(detectConflictsSchema)
  .handler(async ({ data }) => {
    const result = await timetableQueries.detectConflicts(data)
    if (result.isErr()) {
      return { success: false, error: result.error.message }
    }
    return { success: true, data: result.value }
  })

export const getAllConflicts = createServerFn()
  .inputValidator(z.object({ schoolId: z.string(), schoolYearId: z.string() }))
  .handler(async ({ data }) => {
    const result = await timetableQueries.getAllConflictsForSchool(data.schoolId, data.schoolYearId)
    if (result.isErr()) {
      return { success: false, error: result.error.message }
    }
    return { success: true, data: result.value }
  })

// ============================================
// TEACHER WORKLOAD & AVAILABILITY
// ============================================

export const getTeacherWeeklyHours = createServerFn()
  .inputValidator(z.object({ teacherId: z.string(), schoolYearId: z.string() }))
  .handler(async ({ data }) => {
    const result = await timetableQueries.getTeacherWeeklyHours(data.teacherId, data.schoolYearId)
    if (result.isErr()) {
      return { success: false, error: result.error.message }
    }
    return { success: true, data: result.value }
  })

export const getTeacherAvailability = createServerFn()
  .inputValidator(z.object({
    teacherId: z.string(),
    schoolYearId: z.string(),
    dayOfWeek: z.number().min(1).max(7),
  }))
  .handler(async ({ data }) => {
    const result = await timetableQueries.getTeacherAvailability(data)
    if (result.isErr()) {
      return { success: false, error: result.error.message }
    }
    return { success: true, data: result.value }
  })

export const getClassroomAvailability = createServerFn()
  .inputValidator(z.object({
    classroomId: z.string(),
    schoolYearId: z.string(),
    dayOfWeek: z.number().min(1).max(7),
  }))
  .handler(async ({ data }) => {
    const result = await timetableQueries.getClassroomAvailability(data)
    if (result.isErr()) {
      return { success: false, error: result.error.message }
    }
    return { success: true, data: result.value }
  })
