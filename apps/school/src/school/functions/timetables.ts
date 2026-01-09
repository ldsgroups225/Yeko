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
    return await timetableQueries.getTimetableByClass(data)
  })

export const getTimetableByTeacher = createServerFn()
  .inputValidator(getTimetableByTeacherSchema)
  .handler(async ({ data }) => {
    return await timetableQueries.getTimetableByTeacher(data)
  })

export const getTimetableByClassroom = createServerFn()
  .inputValidator(getTimetableByClassroomSchema)
  .handler(async ({ data }) => {
    return await timetableQueries.getTimetableByClassroom(data)
  })

export const getTimetableSession = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    return await timetableQueries.getTimetableSessionById(data.id)
  })

// ============================================
// TIMETABLE MUTATIONS
// ============================================

export const createTimetableSession = createServerFn()
  .inputValidator(createTimetableSessionSchema)
  .handler(async ({ data }) => {
    // IconCheck for conflicts before creating
    const conflicts = await timetableQueries.detectConflicts({
      schoolId: data.schoolId,
      schoolYearId: data.schoolYearId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      teacherId: data.teacherId,
      classroomId: data.classroomId,
      classId: data.classId,
    })

    if (conflicts.length > 0) {
      return {
        success: false,
        error: 'Conflits détectés',
        conflicts,
      }
    }

    const session = await timetableQueries.createTimetableSession({
      id: crypto.randomUUID(),
      ...data,
    })

    return { success: true, data: session }
  })

export const updateTimetableSession = createServerFn()
  .inputValidator(updateTimetableSessionSchema)
  .handler(async ({ data }) => {
    const { id, ...updateData } = data

    // Get existing session to check conflicts
    const existing = await timetableQueries.getTimetableSessionById(id)
    if (!existing) {
      return { success: false, error: 'Séance non trouvée' }
    }

    // IconCheck for conflicts if time/day/teacher/classroom changed
    if (
      updateData.dayOfWeek !== undefined
      || updateData.startTime !== undefined
      || updateData.endTime !== undefined
      || updateData.teacherId !== undefined
      || updateData.classroomId !== undefined
    ) {
      const conflicts = await timetableQueries.detectConflicts({
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

      if (conflicts.length > 0) {
        return {
          success: false,
          error: 'Conflits détectés',
          conflicts,
        }
      }
    }

    const session = await timetableQueries.updateTimetableSession(id, updateData)
    return { success: true, data: session }
  })

export const deleteTimetableSession = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await timetableQueries.deleteTimetableSession(data.id)
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
        await timetableQueries.deleteClassTimetable(classId, data.schoolYearId)
      }
    }

    // Create sessions
    for (let i = 0; i < data.sessions.length; i++) {
      const session = data.sessions[i]
      if (!session)
        continue

      // IconCheck for conflicts
      const conflicts = await timetableQueries.detectConflicts({
        schoolId: data.schoolId,
        schoolYearId: data.schoolYearId,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        teacherId: session.teacherId,
        classroomId: session.classroomId,
        classId: session.classId,
      })

      if (conflicts.length > 0) {
        results.failed++
        results.conflicts.push({ index: i, conflicts })
        continue
      }

      try {
        await timetableQueries.createTimetableSession({
          id: crypto.randomUUID(),
          schoolId: data.schoolId,
          schoolYearId: data.schoolYearId,
          ...session,
        })
        results.success++
      }
      catch {
        results.failed++
      }
    }

    return { success: true, data: results }
  })

export const deleteClassTimetable = createServerFn()
  .inputValidator(z.object({ classId: z.string(), schoolYearId: z.string() }))
  .handler(async ({ data }) => {
    await timetableQueries.deleteClassTimetable(data.classId, data.schoolYearId)
    return { success: true }
  })

// ============================================
// CONFLICT DETECTION
// ============================================

export const detectConflicts = createServerFn()
  .inputValidator(detectConflictsSchema)
  .handler(async ({ data }) => {
    return await timetableQueries.detectConflicts(data)
  })

export const getAllConflicts = createServerFn()
  .inputValidator(z.object({ schoolId: z.string(), schoolYearId: z.string() }))
  .handler(async ({ data }) => {
    return await timetableQueries.getAllConflictsForSchool(data.schoolId, data.schoolYearId)
  })

// ============================================
// TEACHER WORKLOAD & AVAILABILITY
// ============================================

export const getTeacherWeeklyHours = createServerFn()
  .inputValidator(z.object({ teacherId: z.string(), schoolYearId: z.string() }))
  .handler(async ({ data }) => {
    return await timetableQueries.getTeacherWeeklyHours(data.teacherId, data.schoolYearId)
  })

export const getTeacherAvailability = createServerFn()
  .inputValidator(z.object({
    teacherId: z.string(),
    schoolYearId: z.string(),
    dayOfWeek: z.number().min(1).max(7),
  }))
  .handler(async ({ data }) => {
    return await timetableQueries.getTeacherAvailability(data)
  })

export const getClassroomAvailability = createServerFn()
  .inputValidator(z.object({
    classroomId: z.string(),
    schoolYearId: z.string(),
    dayOfWeek: z.number().min(1).max(7),
  }))
  .handler(async ({ data }) => {
    return await timetableQueries.getClassroomAvailability(data)
  })
