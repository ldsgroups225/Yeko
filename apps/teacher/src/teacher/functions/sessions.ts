import { Result as R } from '@praha/byethrow'
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
    const timetableSessionResult = await getTimetableSessionById(data.timetableSessionId)

    if (R.isFailure(timetableSessionResult) || !timetableSessionResult.value) {
      return { success: false, error: 'Timetable session not found' }
    }

    const timetableSession = timetableSessionResult.value

    // Validate teacher is assigned to this timetable session
    if (timetableSession.teacherId !== data.teacherId) {
      return { success: false, error: 'Unauthorized: Not assigned to this session' }
    }

    // Create class session
    const sessionResult = await createTeacherClassSession({
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

    if (R.isFailure(sessionResult)) {
      return {
        success: false,
        error: sessionResult.error.message,
        code: sessionResult.error.details?.code as string | undefined,
      }
    }

    return {
      success: true,
      sessionId: sessionResult.value.id,
    }
  })

// Complete a class session
export const completeSession = createServerFn({ method: 'POST' })
  .inputValidator(completeSessionSchema)
  .handler(async ({ data }) => {
    const {
      upsertParticipationGrades,
      createHomeworkAssignment,
      upsertStudentAttendance,
      recordChapterCompletion,
      updateCurriculumProgress,
      getTeacherClassSessionById,
    } = await import('@repo/data-ops/queries/teacher-app')

    // 0. Fetch session details first (needed for schoolId and sync)
    // We need to verify the session exists and get context info
    const sessionResult = await getTeacherClassSessionById(data.sessionId)
    if (R.isFailure(sessionResult) || !sessionResult.value) {
      return { success: false, error: 'Session not found' }
    }
    const session = sessionResult.value

    // 1. Update session status and basic info
    const updatedResult = await completeTeacherClassSession({
      sessionId: data.sessionId,
      teacherId: data.teacherId ?? '',
      studentsPresent: data.studentsPresent,
      studentsAbsent: data.studentsAbsent,
      notes: data.notes,
      homework: data.homework?.title, // Store title as summary
      chapterId: data.chapterId,
    })

    if (R.isFailure(updatedResult)) {
      return {
        success: false,
        error: updatedResult.error.message,
        code: updatedResult.error.details?.code as string | undefined,
      }
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

    // 3. Upsert student attendance records
    if (data.attendanceRecords) {
      const records = Object.entries(data.attendanceRecords).map(([studentId, status]) => ({
        studentId,
        status: status as 'present' | 'late' | 'absent' | 'excused',
      }))

      await upsertStudentAttendance({
        schoolId: session.schoolId,
        classId: session.classId,
        classSessionId: session.id,
        teacherId: data.teacherId ?? '',
        date: session.date,
        records,
      })
    }

    // 4. Create homework if provided
    if (data.homework) {
      await createHomeworkAssignment({
        schoolId: session.schoolId,
        classId: session.classId,
        subjectId: session.subjectId,
        teacherId: session.teacherId,
        classSessionId: session.id,
        title: data.homework.title,
        description: data.homework.description ?? undefined,
        dueDate: data.homework.dueDate,
        status: 'active',
      })
    }

    // 5. Record Chapter Completion & Update Progress
    if (data.lessonCompleted && data.chapterId) {
      // Record the completion
      await recordChapterCompletion({
        classId: session.classId,
        subjectId: session.subjectId,
        chapterId: data.chapterId,
        classSessionId: session.id,
        teacherId: data.teacherId ?? '',
        notes: data.notes,
      })

      // Update curriculum progress
      // Note: We don't have termId explicitly, but updateCurriculumProgress
      // will try to find the active record for this class/subject
      await updateCurriculumProgress({
        classId: session.classId,
        subjectId: session.subjectId,
      })
    }

    return { success: true }
  })

// Update attendance counts for a session
export const updateSessionAttendance = createServerFn()
  .inputValidator(updateAttendanceSchema)
  .handler(async ({ data }) => {
    const updatedResult = await completeTeacherClassSession({
      sessionId: data.sessionId,
      teacherId: data.teacherId ?? '',
      studentsPresent: data.studentsPresent,
      studentsAbsent: data.studentsAbsent,
    })

    if (R.isFailure(updatedResult)) {
      return {
        success: false,
        error: updatedResult.error.message,
        code: updatedResult.error.details?.code as string | undefined,
      }
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
    const studentsResult = await getClassStudents({
      classId: data.classId,
      schoolYearId: data.schoolYearId,
    })

    if (R.isFailure(studentsResult)) {
      return { students: [], className: null, subjectName: null }
    }

    const students = studentsResult.value

    // Get class/subject info if subjectId provided
    let className: string | null = null
    let subjectName: string | null = null

    if (data.subjectId) {
      const { getClassSubjectInfo } = await import('@repo/data-ops/queries/teacher-app')
      const infoResult = await getClassSubjectInfo({
        classId: data.classId,
        subjectId: data.subjectId,
      })

      if (R.isSuccess(infoResult) && infoResult.value) {
        className = infoResult.value.className ?? null
        subjectName = infoResult.value.subjectName ?? null
      }
    }

    return { students, className, subjectName }
  })

// Get session details
export const getSessionDetails = createServerFn()
  .inputValidator(z.object({ sessionId: z.string() }))
  .handler(async ({ data }) => {
    const sessionResult = await getTeacherClassSessionById(data.sessionId)

    if (R.isFailure(sessionResult) || !sessionResult.value) {
      return { session: null }
    }

    const session = sessionResult.value

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
        chapterName: session.chapterName,
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

    if (R.isFailure(result)) {
      return {
        sessions: [],
        total: 0,
        page: data.page,
        pageSize: data.pageSize,
      }
    }

    return {
      sessions: result.value.sessions.map(s => ({
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
      total: result.value.total,
      page: result.value.page,
      pageSize: result.value.pageSize,
    }
  })
