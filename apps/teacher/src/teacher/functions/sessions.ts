import {
  completeTeacherClassSession,
  createTeacherClassSession,
  getClassStudents,
  getTeacherClassSessionById,
  getTeacherSessionHistory,
} from '@repo/data-ops/queries/teacher-app'
import { getTimetableSessionById } from '@repo/data-ops/queries/timetables'

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  completeSessionSchema,
  startSessionSchema,
  updateAttendanceSchema,
} from '@/schemas/session'

// Start a class session
export const startSession = createServerFn()
  .inputValidator(startSessionSchema)
  .handler(async ({ data }) => {
    // Get timetable session details
    const timetableSession = await getTimetableSessionById(data.timetableSessionId)

    if (!timetableSession) {
      return { success: false, error: 'Timetable session not found' }
    }

    // Validate teacher is assigned to this timetable session
    if (timetableSession.teacherId !== data.teacherId) {
      return { success: false, error: 'Unauthorized: Not assigned to this session' }
    }

    // Create class session
    const session = await createTeacherClassSession({
      timetableSessionId: data.timetableSessionId,
      teacherId: data.teacherId,
      schoolId: timetableSession.schoolId,
      classId: timetableSession.classId,
      subjectId: timetableSession.subjectId,
      date: data.date,
      startTime: timetableSession.startTime,
      endTime: timetableSession.endTime,
      topic: data.topic,
      chapterId: data.chapterId,
    })

    return {
      success: true,
      sessionId: session?.id,
    }
  })

// Complete a class session
export const completeSession = createServerFn({ method: 'POST' })
  .inputValidator(completeSessionSchema)
  .handler(async ({ data }) => {
    const {
      upsertParticipationGrades,
      createHomeworkAssignment,
    } = await import('@repo/data-ops/queries/teacher-app')

    // 1. Update session status and basic info
    const updated = await completeTeacherClassSession({
      sessionId: data.sessionId,
      teacherId: data.teacherId ?? '',
      studentsPresent: data.studentsPresent,
      studentsAbsent: data.studentsAbsent,
      notes: data.notes,
      homework: data.homework?.title, // Store title as summary
      chapterId: data.chapterId,
    })

    if (!updated) {
      return { success: false, error: 'Session not found or unauthorized' }
    }

    // 2. Upsert participation grades if any
    if (data.participationGrades && data.participationGrades.length > 0) {
      await upsertParticipationGrades({
        classSessionId: data.sessionId,
        teacherId: data.teacherId ?? '',
        grades: data.participationGrades.map(g => ({
          studentId: g.studentId,
          grade: g.grade,
          comment: g.comment,
        })),
      })
    }

    // 3. Create homework if provided
    if (data.homework) {
      const session = await getTeacherClassSessionById(data.sessionId)
      if (session) {
        await createHomeworkAssignment({
          schoolId: session.schoolId,
          classId: session.classId,
          subjectId: session.subjectId,
          teacherId: session.teacherId,
          classSessionId: session.id,
          title: data.homework.title,
          description: data.homework.description,
          dueDate: data.homework.dueDate,
          status: 'active',
        })
      }
    }

    // TODO: In Phase 13/14, we should also store attendanceRecords (per student)
    // For now, we only store totals in the session table

    return { success: true }
  })

// Update attendance counts for a session
export const updateSessionAttendance = createServerFn()
  .inputValidator(updateAttendanceSchema)
  .handler(async ({ data }) => {
    const updated = await completeTeacherClassSession({
      sessionId: data.sessionId,
      teacherId: data.teacherId ?? '',
      studentsPresent: data.studentsPresent,
      studentsAbsent: data.studentsAbsent,
    })

    if (!updated) {
      return { success: false, error: 'Session not found or unauthorized' }
    }

    return { success: true }
  })

// Get students for a class (for attendance/participation/grades)
export const getSessionStudents = createServerFn()
  .inputValidator(
    z.object({
      classId: z.string(),
      schoolYearId: z.string(),
      subjectId: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const students = await getClassStudents({
      classId: data.classId,
      schoolYearId: data.schoolYearId,
    })

    // Get class/subject info if subjectId provided
    let className: string | null = null
    let subjectName: string | null = null

    if (data.subjectId) {
      const { getClassSubjectInfo } = await import('@repo/data-ops/queries/teacher-app')
      const info = await getClassSubjectInfo({
        classId: data.classId,
        subjectId: data.subjectId,
      })
      className = info?.className ?? null
      subjectName = info?.subjectName ?? null
    }

    return { students, className, subjectName }
  })

// Get session details
export const getSessionDetails = createServerFn()
  .inputValidator(z.object({ sessionId: z.string() }))
  .handler(async ({ data }) => {
    const session = await getTeacherClassSessionById(data.sessionId)

    if (!session) {
      return { session: null }
    }

    return {
      session: {
        id: session.id,
        classId: session.classId,
        className: session.className,
        schoolYearId: session.schoolYearId,
        subjectId: session.subjectId,
        subjectName: session.subjectName,
        teacherId: session.teacherId,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        topic: session.topic,
        notes: session.notes,
        homework: session.homework,
        status: session.status as 'scheduled' | 'completed' | 'cancelled',
        studentsPresent: session.studentsPresent,
        studentsAbsent: session.studentsAbsent,
        chapterId: session.chapterId,
        chapterName: null, // TODO: Fetch chapter name if needed
      },
    }
  })

// Get session history for a teacher
export const getSessionHistory = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      classId: z.string().optional(),
      subjectId: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(50).default(20),
    }),
  )
  .handler(async ({ data }) => {
    const result = await getTeacherSessionHistory({
      teacherId: data.teacherId,
      classId: data.classId,
      subjectId: data.subjectId,
      startDate: data.startDate,
      endDate: data.endDate,
      page: data.page,
      pageSize: data.pageSize,
    })

    return {
      sessions: result.sessions.map(s => ({
        id: s.id,
        className: s.className,
        subjectName: s.subjectName,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status as 'scheduled' | 'completed' | 'cancelled',
        studentsPresent: s.studentsPresent,
        studentsAbsent: s.studentsAbsent,
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    }
  })
