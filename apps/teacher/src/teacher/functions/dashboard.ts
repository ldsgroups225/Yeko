import {
  getClassStudents,
  getTeacherActiveSession,
  getTeacherAssignedClasses,
  getTeacherDaySchedule,
  getTeacherNotificationsQuery,
  getTeacherPendingGradesCount,
  getTeacherRecentMessages,
  getTeacherUnreadMessagesCount,
  getTeacherWeeklySchedule,
} from '@repo/data-ops/queries/teacher-app'
import { createServerFn } from '@tanstack/react-start'

import { z } from 'zod'

// Dashboard data aggregation
export const getTeacherDashboard = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolId: z.string(),
      schoolYearId: z.string(),
      date: z.string().optional(), // ISO date, defaults to today
    }),
  )
  .handler(async ({ data }) => {
    const today = data.date || new Date().toISOString().split('T')[0]!
    const dayOfWeek = new Date(today).getDay() // 0 = Sunday, 1 = Monday, etc.

    // Fetch all dashboard data in parallel
    const [
      todaySchedule,
      activeSession,
      pendingGrades,
      unreadMessages,
      recentMessages,
      notifications,
    ] = await Promise.all([
      getTeacherDaySchedule({
        teacherId: data.teacherId,
        schoolYearId: data.schoolYearId,
        dayOfWeek,
      }),
      getTeacherActiveSession({
        teacherId: data.teacherId,
        date: today,
      }),
      getTeacherPendingGradesCount(data.teacherId),
      getTeacherUnreadMessagesCount(data.teacherId),
      getTeacherRecentMessages({ teacherId: data.teacherId, limit: 5 }),
      getTeacherNotificationsQuery({ teacherId: data.teacherId, unreadOnly: true, limit: 10 }),
    ])

    // Format schedule with class names
    const formattedSchedule = todaySchedule.map((session: typeof todaySchedule[number]) => ({
      id: session.id,
      dayOfWeek: session.dayOfWeek,
      startTime: session.startTime,
      endTime: session.endTime,
      class: {
        id: session.class.id,
        name: `${session.class.gradeName} ${session.class.section}`.trim(),
        grade: session.class.gradeName,
        section: session.class.section,
      },
      subject: {
        id: session.subject.id,
        name: session.subject.name,
        shortName: session.subject.shortName,
      },
      classroom: session.classroom?.id
        ? {
            id: session.classroom.id,
            name: session.classroom.name,
            code: session.classroom.code,
          }
        : null,
      date: today,
    }))

    // Calculate upcoming classes (next 3 after current time)
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const upcomingClasses = formattedSchedule
      .filter(s => s.startTime > currentTime)
      .slice(0, 3)
      .map(s => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        class: { id: s.class.id, name: s.class.name },
        subject: { id: s.subject.id, name: s.subject.name },
        minutesUntil: calculateMinutesUntil(currentTime, s.startTime),
      }))

    // Format messages
    const formattedMessages = recentMessages.map(msg => ({
      id: msg.id,
      senderName: msg.senderType === 'parent' ? 'Parent' : 'Enseignant',
      subject: msg.subject,
      preview: msg.content.substring(0, 100),
      createdAt: msg.createdAt?.toISOString() ?? new Date().toISOString(),
      isRead: msg.isRead,
    }))

    // Format notifications
    const formattedNotifications = notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      createdAt: n.createdAt?.toISOString() ?? new Date().toISOString(),
      isRead: n.isRead,
    }))

    return {
      todaySchedule: formattedSchedule,
      upcomingClasses,
      activeSession: activeSession
        ? {
            id: activeSession.id,
            classId: activeSession.classId,
            className: activeSession.className,
            subjectName: activeSession.subjectName,
            startTime: activeSession.startTime,
            startedAt: activeSession.startedAt?.toISOString() ?? new Date().toISOString(),
          }
        : null,
      pendingGrades,
      unreadMessages,
      recentMessages: formattedMessages,
      notifications: formattedNotifications,
      date: today,
    }
  })

// Helper function to calculate minutes until a time
function calculateMinutesUntil(currentTime: string, targetTime: string): number {
  const [currentH, currentM] = currentTime.split(':').map(Number)
  const [targetH, targetM] = targetTime.split(':').map(Number)

  const currentMinutes = (currentH ?? 0) * 60 + (currentM ?? 0)
  const targetMinutes = (targetH ?? 0) * 60 + (targetM ?? 0)

  return Math.max(0, targetMinutes - currentMinutes)
}

// Get teacher's schedule for a date range
export const getTeacherSchedule = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolId: z.string(),
      schoolYearId: z.string(),
      startDate: z.string(), // ISO date
      endDate: z.string(), // ISO date
    }),
  )
  .handler(async ({ data }) => {
    const schedule = await getTeacherWeeklySchedule({
      teacherId: data.teacherId,
      schoolYearId: data.schoolYearId,
    })

    // Format sessions with class names
    const sessions = schedule.map(session => ({
      id: session.id,
      dayOfWeek: session.dayOfWeek,
      startTime: session.startTime,
      endTime: session.endTime,
      class: {
        id: session.class.id,
        name: `${session.class.gradeName} ${session.class.section}`.trim(),
        grade: session.class.gradeName,
        section: session.class.section,
      },
      subject: {
        id: session.subject.id,
        name: session.subject.name,
        shortName: session.subject.shortName,
      },
      classroom: session.classroom?.id
        ? {
            id: session.classroom.id,
            name: session.classroom.name,
            code: session.classroom.code,
          }
        : null,
      date: '', // Will be calculated based on week
      hasSession: false,
      sessionStatus: null as 'scheduled' | 'completed' | 'cancelled' | null,
    }))

    return { sessions }
  })

// Get teacher's assigned classes
export const getTeacherClasses = createServerFn()
  .inputValidator(
    z.object({
      teacherId: z.string(),
      schoolId: z.string(),
      schoolYearId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const classes = await getTeacherAssignedClasses({
      teacherId: data.teacherId,
      schoolYearId: data.schoolYearId,
    })

    // Get student counts for each class
    const classesWithCounts = await Promise.all(
      classes.map(async (cls) => {
        const students = await getClassStudents({
          classId: cls.id,
          schoolYearId: data.schoolYearId,
        })
        return {
          id: cls.id,
          name: cls.name,
          grade: { id: '', name: cls.name.split(' ')[0] ?? '' },
          section: cls.name.split(' ')[1] ?? '',
          studentCount: students.length,
          subjects: cls.subjects,
        }
      }),
    )

    return { classes: classesWithCounts }
  })
