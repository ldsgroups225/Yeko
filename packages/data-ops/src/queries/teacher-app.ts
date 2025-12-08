/**
 * Teacher App Queries
 * Queries specifically for the Yeko Teacher mobile app
 */
import type { PgTransaction } from 'drizzle-orm/pg-core'
import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { getDb } from '../database/setup'
import { subjects } from '../drizzle/core-schema'
import {
  classes,
  classrooms,
  classSessions,
  classSubjects,
  enrollments,
  participationGrades,
  studentGrades,
  students,
  teacherMessages,
  teacherNotifications,
  timetableSessions,
} from '../drizzle/school-schema'

// ============================================
// TEACHER DASHBOARD
// ============================================

/**
 * Get teacher's schedule for a specific day
 */
export async function getTeacherDaySchedule(params: {
  teacherId: string
  schoolYearId: string
  dayOfWeek: number
}) {
  const db = getDb()

  return db
    .select({
      id: timetableSessions.id,
      dayOfWeek: timetableSessions.dayOfWeek,
      startTime: timetableSessions.startTime,
      endTime: timetableSessions.endTime,
      class: {
        id: classes.id,
        section: classes.section,
        gradeName: sql<string>`(SELECT name FROM grades WHERE id = ${classes.gradeId})`,
      },
      subject: {
        id: subjects.id,
        name: subjects.name,
        shortName: subjects.shortName,
      },
      classroom: {
        id: classrooms.id,
        name: classrooms.name,
        code: classrooms.code,
      },
    })
    .from(timetableSessions)
    .innerJoin(classes, eq(timetableSessions.classId, classes.id))
    .innerJoin(subjects, eq(timetableSessions.subjectId, subjects.id))
    .leftJoin(classrooms, eq(timetableSessions.classroomId, classrooms.id))
    .where(
      and(
        eq(timetableSessions.teacherId, params.teacherId),
        eq(timetableSessions.schoolYearId, params.schoolYearId),
        eq(timetableSessions.dayOfWeek, params.dayOfWeek),
      ),
    )
    .orderBy(asc(timetableSessions.startTime))
}

/**
 * Get teacher's weekly schedule
 */
export async function getTeacherWeeklySchedule(params: {
  teacherId: string
  schoolYearId: string
}) {
  const db = getDb()

  return db
    .select({
      id: timetableSessions.id,
      dayOfWeek: timetableSessions.dayOfWeek,
      startTime: timetableSessions.startTime,
      endTime: timetableSessions.endTime,
      class: {
        id: classes.id,
        section: classes.section,
        gradeName: sql<string>`(SELECT name FROM grades WHERE id = ${classes.gradeId})`,
      },
      subject: {
        id: subjects.id,
        name: subjects.name,
        shortName: subjects.shortName,
      },
      classroom: {
        id: classrooms.id,
        name: classrooms.name,
        code: classrooms.code,
      },
    })
    .from(timetableSessions)
    .innerJoin(classes, eq(timetableSessions.classId, classes.id))
    .innerJoin(subjects, eq(timetableSessions.subjectId, subjects.id))
    .leftJoin(classrooms, eq(timetableSessions.classroomId, classrooms.id))
    .where(
      and(
        eq(timetableSessions.teacherId, params.teacherId),
        eq(timetableSessions.schoolYearId, params.schoolYearId),
      ),
    )
    .orderBy(asc(timetableSessions.dayOfWeek), asc(timetableSessions.startTime))
}

/**
 * Get active session for teacher (if any)
 */
export async function getTeacherActiveSession(params: {
  teacherId: string
  date: string
}) {
  const db = getDb()

  const result = await db
    .select({
      id: classSessions.id,
      classId: classSessions.classId,
      className: sql<string>`(SELECT g.name || ' ' || c.section FROM classes c JOIN grades g ON c.grade_id = g.id WHERE c.id = ${classSessions.classId})`,
      subjectId: classSessions.subjectId,
      subjectName: subjects.name,
      startTime: classSessions.startTime,
      startedAt: classSessions.createdAt,
      status: classSessions.status,
    })
    .from(classSessions)
    .innerJoin(subjects, eq(classSessions.subjectId, subjects.id))
    .where(
      and(
        eq(classSessions.teacherId, params.teacherId),
        eq(classSessions.date, params.date),
        eq(classSessions.status, 'scheduled'),
      ),
    )
    .limit(1)

  return result[0] ?? null
}

/**
 * Get count of pending grade validations for teacher
 */
export async function getTeacherPendingGradesCount(teacherId: string) {
  const db = getDb()

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(studentGrades)
    .where(
      and(
        eq(studentGrades.teacherId, teacherId),
        eq(studentGrades.status, 'submitted'),
      ),
    )

  return result[0]?.count ?? 0
}

/**
 * Get count of unread messages for teacher
 */
export async function getTeacherUnreadMessagesCount(teacherId: string) {
  const db = getDb()

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(teacherMessages)
    .where(
      and(
        eq(teacherMessages.recipientType, 'teacher'),
        eq(teacherMessages.recipientId, teacherId),
        eq(teacherMessages.isRead, false),
      ),
    )

  return result[0]?.count ?? 0
}

/**
 * Get recent messages for teacher
 */
export async function getTeacherRecentMessages(params: {
  teacherId: string
  limit?: number
}) {
  const db = getDb()
  const limit = params.limit ?? 5

  return db
    .select({
      id: teacherMessages.id,
      senderType: teacherMessages.senderType,
      senderId: teacherMessages.senderId,
      subject: teacherMessages.subject,
      content: teacherMessages.content,
      isRead: teacherMessages.isRead,
      createdAt: teacherMessages.createdAt,
    })
    .from(teacherMessages)
    .where(
      and(
        eq(teacherMessages.recipientType, 'teacher'),
        eq(teacherMessages.recipientId, params.teacherId),
      ),
    )
    .orderBy(desc(teacherMessages.createdAt))
    .limit(limit)
}

/**
 * Get unread notifications for teacher
 */
export async function getTeacherNotificationsQuery(params: {
  teacherId: string
  unreadOnly?: boolean
  limit?: number
}) {
  const db = getDb()
  const limit = params.limit ?? 20

  const conditions = [eq(teacherNotifications.teacherId, params.teacherId)]
  if (params.unreadOnly) {
    conditions.push(eq(teacherNotifications.isRead, false))
  }

  return db
    .select()
    .from(teacherNotifications)
    .where(and(...conditions))
    .orderBy(desc(teacherNotifications.createdAt))
    .limit(limit)
}

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Start a class session
 */
export async function createTeacherClassSession(params: {
  timetableSessionId: string
  teacherId: string
  schoolId: string
  classId: string
  subjectId: string
  date: string
  startTime: string
  endTime: string
  topic?: string
  chapterId?: string
}) {
  const db = getDb()

  const [session] = await db
    .insert(classSessions)
    .values({
      id: nanoid(),
      schoolId: params.schoolId,
      classId: params.classId,
      subjectId: params.subjectId,
      teacherId: params.teacherId,
      timetableSessionId: params.timetableSessionId,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
      topic: params.topic,
      chapterId: params.chapterId,
      status: 'scheduled',
    })
    .returning()

  return session
}

/**
 * Complete a class session
 */
export async function completeTeacherClassSession(params: {
  sessionId: string
  teacherId: string
  studentsPresent?: number
  studentsAbsent?: number
  notes?: string
  homework?: string
  chapterId?: string
}) {
  const db = getDb()

  const [updated] = await db
    .update(classSessions)
    .set({
      status: 'completed',
      completedAt: new Date(),
      studentsPresent: params.studentsPresent,
      studentsAbsent: params.studentsAbsent,
      notes: params.notes,
      homework: params.homework,
      chapterId: params.chapterId,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(classSessions.id, params.sessionId),
        eq(classSessions.teacherId, params.teacherId),
      ),
    )
    .returning()

  return updated
}

/**
 * Get session details
 */
export async function getTeacherClassSessionById(sessionId: string) {
  const db = getDb()

  const result = await db
    .select({
      id: classSessions.id,
      classId: classSessions.classId,
      className: sql<string>`(SELECT g.name || ' ' || c.section FROM classes c JOIN grades g ON c.grade_id = g.id WHERE c.id = ${classSessions.classId})`,
      subjectId: classSessions.subjectId,
      subjectName: subjects.name,
      teacherId: classSessions.teacherId,
      date: classSessions.date,
      startTime: classSessions.startTime,
      endTime: classSessions.endTime,
      topic: classSessions.topic,
      notes: classSessions.notes,
      homework: classSessions.homework,
      status: classSessions.status,
      studentsPresent: classSessions.studentsPresent,
      studentsAbsent: classSessions.studentsAbsent,
      chapterId: classSessions.chapterId,
      createdAt: classSessions.createdAt,
      completedAt: classSessions.completedAt,
    })
    .from(classSessions)
    .innerJoin(subjects, eq(classSessions.subjectId, subjects.id))
    .where(eq(classSessions.id, sessionId))
    .limit(1)

  return result[0] ?? null
}

/**
 * Get session history for teacher
 */
export async function getTeacherSessionHistory(params: {
  teacherId: string
  classId?: string
  subjectId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}) {
  const db = getDb()
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20

  const conditions = [eq(classSessions.teacherId, params.teacherId)]
  if (params.classId)
    conditions.push(eq(classSessions.classId, params.classId))
  if (params.subjectId)
    conditions.push(eq(classSessions.subjectId, params.subjectId))
  if (params.startDate)
    conditions.push(gte(classSessions.date, params.startDate))
  if (params.endDate)
    conditions.push(lte(classSessions.date, params.endDate))

  const [sessions, countResult] = await Promise.all([
    db
      .select({
        id: classSessions.id,
        className: sql<string>`(SELECT g.name || ' ' || c.section FROM classes c JOIN grades g ON c.grade_id = g.id WHERE c.id = ${classSessions.classId})`,
        subjectName: subjects.name,
        date: classSessions.date,
        startTime: classSessions.startTime,
        endTime: classSessions.endTime,
        status: classSessions.status,
        studentsPresent: classSessions.studentsPresent,
        studentsAbsent: classSessions.studentsAbsent,
      })
      .from(classSessions)
      .innerJoin(subjects, eq(classSessions.subjectId, subjects.id))
      .where(and(...conditions))
      .orderBy(desc(classSessions.date), desc(classSessions.startTime))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(classSessions)
      .where(and(...conditions)),
  ])

  return {
    sessions,
    total: countResult[0]?.count ?? 0,
    page,
    pageSize,
  }
}

// ============================================
// STUDENTS & PARTICIPATION
// ============================================

/**
 * Get students enrolled in a class
 */
export async function getClassStudents(params: {
  classId: string
  schoolYearId: string
}) {
  const db = getDb()

  return db
    .select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      matricule: students.matricule,
      photoUrl: students.photoUrl,
    })
    .from(students)
    .innerJoin(enrollments, eq(enrollments.studentId, students.id))
    .where(
      and(
        eq(enrollments.classId, params.classId),
        eq(enrollments.schoolYearId, params.schoolYearId),
        eq(enrollments.status, 'confirmed'),
      ),
    )
    .orderBy(asc(students.lastName), asc(students.firstName))
}

/**
 * Record participation grades for a session
 */
export async function upsertParticipationGrades(params: {
  classSessionId: string
  teacherId: string
  grades: Array<{
    studentId: string
    grade: number
    comment?: string
  }>
}) {
  const db = getDb()

  // Use transaction for atomicity
  return db.transaction(async (tx: PgTransaction<any, any, any>) => {
    for (const grade of params.grades) {
      await tx
        .insert(participationGrades)
        .values({
          id: nanoid(),
          studentId: grade.studentId,
          classSessionId: params.classSessionId,
          teacherId: params.teacherId,
          grade: grade.grade,
          comment: grade.comment,
        })
        .onConflictDoUpdate({
          target: [participationGrades.studentId, participationGrades.classSessionId],
          set: {
            grade: grade.grade,
            comment: grade.comment,
            updatedAt: new Date(),
          },
        })
    }

    // Note: participationRecorded column will be added in migration 0009
    // For now, we just return success after recording grades

    return { success: true }
  })
}

/**
 * Get participation grades for a session
 */
export async function getSessionParticipationGrades(classSessionId: string) {
  const db = getDb()

  return db
    .select({
      studentId: participationGrades.studentId,
      grade: participationGrades.grade,
      comment: participationGrades.comment,
    })
    .from(participationGrades)
    .where(eq(participationGrades.classSessionId, classSessionId))
}

// ============================================
// TEACHER CLASSES
// ============================================

/**
 * Get classes assigned to a teacher
 */
export async function getTeacherAssignedClasses(params: {
  teacherId: string
  schoolYearId: string
}) {
  const db = getDb()

  // Get class subjects for this teacher
  // Note: classSubjects doesn't have schoolYearId, so we filter by class's school year
  const result = await db
    .select({
      classId: classSubjects.classId,
      className: sql<string>`(SELECT g.name || ' ' || c.section FROM classes c JOIN grades g ON c.grade_id = g.id WHERE c.id = ${classSubjects.classId})`,
      subjectId: classSubjects.subjectId,
      subjectName: subjects.name,
      subjectShortName: subjects.shortName,
    })
    .from(classSubjects)
    .innerJoin(subjects, eq(classSubjects.subjectId, subjects.id))
    .innerJoin(classes, eq(classSubjects.classId, classes.id))
    .where(
      and(
        eq(classSubjects.teacherId, params.teacherId),
        eq(classes.schoolYearId, params.schoolYearId),
      ),
    )
    .orderBy(sql`(SELECT g.name || ' ' || c.section FROM classes c JOIN grades g ON c.grade_id = g.id WHERE c.id = ${classSubjects.classId})`)

  // Group by class
  const classMap = new Map<string, {
    id: string
    name: string
    subjects: Array<{ id: string, name: string, shortName: string | null }>
  }>()

  for (const row of result) {
    if (!classMap.has(row.classId)) {
      classMap.set(row.classId, {
        id: row.classId,
        name: row.className,
        subjects: [],
      })
    }
    classMap.get(row.classId)!.subjects.push({
      id: row.subjectId,
      name: row.subjectName,
      shortName: row.subjectShortName,
    })
  }

  return Array.from(classMap.values())
}
