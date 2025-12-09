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
  homework,
  homeworkSubmissions,
  messageTemplates,
  parents,
  participationGrades,
  studentGrades,
  studentParents,
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
      schoolYearId: sql<string>`(SELECT school_year_id FROM classes WHERE id = ${classSessions.classId})`,
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

/**
 * Create a homework assignment
 */
export async function createHomeworkAssignment(params: {
  schoolId: string
  classId: string
  subjectId: string
  teacherId: string
  classSessionId?: string
  title: string
  description?: string
  instructions?: string
  dueDate: string
  dueTime?: string
  maxPoints?: number
  isGraded?: boolean
  attachments?: Array<{ name: string, url: string, type: string, size: number }>
  status?: 'draft' | 'active' | 'closed' | 'cancelled'
}) {
  const db = getDb()

  const [created] = await db
    .insert(homework)
    .values({
      id: nanoid(),
      schoolId: params.schoolId,
      classId: params.classId,
      subjectId: params.subjectId,
      teacherId: params.teacherId,
      classSessionId: params.classSessionId,
      title: params.title,
      description: params.description,
      instructions: params.instructions,
      dueDate: params.dueDate,
      dueTime: params.dueTime,
      maxPoints: params.maxPoints,
      isGraded: params.isGraded ?? false,
      attachments: params.attachments ?? [],
      status: params.status ?? 'active',
    })
    .returning()

  return created
}

/**
 * Get homework list for teacher
 */
export async function getTeacherHomework(params: {
  teacherId: string
  classId?: string
  subjectId?: string
  status?: 'draft' | 'active' | 'closed' | 'cancelled'
  page?: number
  pageSize?: number
}) {
  const db = getDb()
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20

  const conditions = [eq(homework.teacherId, params.teacherId)]
  if (params.classId)
    conditions.push(eq(homework.classId, params.classId))
  if (params.subjectId)
    conditions.push(eq(homework.subjectId, params.subjectId))
  if (params.status)
    conditions.push(eq(homework.status, params.status))

  const [homeworkList, countResult] = await Promise.all([
    db
      .select({
        id: homework.id,
        title: homework.title,
        className: sql<string>`(SELECT g.name || ' ' || c.section FROM classes c JOIN grades g ON c.grade_id = g.id WHERE c.id = ${homework.classId})`,
        subjectName: subjects.name,
        dueDate: homework.dueDate,
        dueTime: homework.dueTime,
        status: homework.status,
        maxPoints: homework.maxPoints,
        isGraded: homework.isGraded,
        createdAt: homework.createdAt,
      })
      .from(homework)
      .innerJoin(subjects, eq(homework.subjectId, subjects.id))
      .where(and(...conditions))
      .orderBy(desc(homework.dueDate))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(homework)
      .where(and(...conditions)),
  ])

  // Get submission counts for each homework
  const homeworkIds = homeworkList.map((h: { id: string }) => h.id)
  const submissionCounts = homeworkIds.length > 0
    ? await db
      .select({
        homeworkId: homeworkSubmissions.homeworkId,
        count: sql<number>`count(*)::int`,
      })
      .from(homeworkSubmissions)
      .where(sql`${homeworkSubmissions.homeworkId} IN (${sql.join(homeworkIds.map((id: string) => sql`${id}`), sql`, `)})`)
      .groupBy(homeworkSubmissions.homeworkId)
    : []

  const submissionMap = new Map(submissionCounts.map((s: { homeworkId: string, count: number }) => [s.homeworkId, s.count]))

  return {
    homework: homeworkList.map((h: any) => ({
      ...h,
      submissionCount: submissionMap.get(h.id) ?? 0,
    })),
    total: countResult[0]?.count ?? 0,
    page,
    pageSize,
  }
}

/**
 * Get homework details by ID
 */
export async function getHomeworkById(homeworkId: string) {
  const db = getDb()

  const result = await db
    .select({
      id: homework.id,
      schoolId: homework.schoolId,
      classId: homework.classId,
      className: sql<string>`(SELECT g.name || ' ' || c.section FROM classes c JOIN grades g ON c.grade_id = g.id WHERE c.id = ${homework.classId})`,
      subjectId: homework.subjectId,
      subjectName: subjects.name,
      teacherId: homework.teacherId,
      classSessionId: homework.classSessionId,
      title: homework.title,
      description: homework.description,
      instructions: homework.instructions,
      dueDate: homework.dueDate,
      dueTime: homework.dueTime,
      maxPoints: homework.maxPoints,
      isGraded: homework.isGraded,
      attachments: homework.attachments,
      status: homework.status,
      createdAt: homework.createdAt,
      updatedAt: homework.updatedAt,
    })
    .from(homework)
    .innerJoin(subjects, eq(homework.subjectId, subjects.id))
    .where(eq(homework.id, homeworkId))
    .limit(1)

  return result[0] ?? null
}

/**
 * Update homework assignment
 */
export async function updateHomeworkAssignment(params: {
  homeworkId: string
  teacherId: string
  title?: string
  description?: string
  instructions?: string
  dueDate?: string
  dueTime?: string
  maxPoints?: number
  isGraded?: boolean
  attachments?: Array<{ name: string, url: string, type: string, size: number }>
  status?: 'draft' | 'active' | 'closed' | 'cancelled'
}) {
  const db = getDb()

  const updateData: Record<string, any> = {}
  if (params.title !== undefined)
    updateData.title = params.title
  if (params.description !== undefined)
    updateData.description = params.description
  if (params.instructions !== undefined)
    updateData.instructions = params.instructions
  if (params.dueDate !== undefined)
    updateData.dueDate = params.dueDate
  if (params.dueTime !== undefined)
    updateData.dueTime = params.dueTime
  if (params.maxPoints !== undefined)
    updateData.maxPoints = params.maxPoints
  if (params.isGraded !== undefined)
    updateData.isGraded = params.isGraded
  if (params.attachments !== undefined)
    updateData.attachments = params.attachments
  if (params.status !== undefined)
    updateData.status = params.status

  const [updated] = await db
    .update(homework)
    .set(updateData)
    .where(
      and(
        eq(homework.id, params.homeworkId),
        eq(homework.teacherId, params.teacherId),
      ),
    )
    .returning()

  return updated
}

/**
 * Delete homework (soft delete by setting status to cancelled, or hard delete if draft)
 */
export async function deleteHomeworkAssignment(params: {
  homeworkId: string
  teacherId: string
}) {
  const db = getDb()

  // Check if homework is draft
  const existing = await db
    .select({ status: homework.status })
    .from(homework)
    .where(
      and(
        eq(homework.id, params.homeworkId),
        eq(homework.teacherId, params.teacherId),
      ),
    )
    .limit(1)

  if (!existing[0])
    return null

  if (existing[0].status === 'draft') {
    // Hard delete for drafts
    await db
      .delete(homework)
      .where(eq(homework.id, params.homeworkId))
    return { deleted: true }
  }
  else {
    // Soft delete for active/closed
    const [updated] = await db
      .update(homework)
      .set({ status: 'cancelled' })
      .where(eq(homework.id, params.homeworkId))
      .returning()
    return updated
  }
}

// ============================================
// MESSAGING
// ============================================

/**
 * Get teacher messages (inbox, sent, or archived)
 */
export async function getTeacherMessagesQuery(params: {
  teacherId: string
  folder: 'inbox' | 'sent' | 'archived'
  isRead?: boolean
  page?: number
  pageSize?: number
}) {
  const db = getDb()
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20

  const conditions: any[] = []

  if (params.folder === 'inbox') {
    conditions.push(eq(teacherMessages.recipientType, 'teacher'))
    conditions.push(eq(teacherMessages.recipientId, params.teacherId))
    conditions.push(eq(teacherMessages.isArchived, false))
  }
  else if (params.folder === 'sent') {
    conditions.push(eq(teacherMessages.senderType, 'teacher'))
    conditions.push(eq(teacherMessages.senderId, params.teacherId))
  }
  else if (params.folder === 'archived') {
    conditions.push(eq(teacherMessages.recipientType, 'teacher'))
    conditions.push(eq(teacherMessages.recipientId, params.teacherId))
    conditions.push(eq(teacherMessages.isArchived, true))
  }

  if (params.isRead !== undefined) {
    conditions.push(eq(teacherMessages.isRead, params.isRead))
  }

  const [messages, countResult] = await Promise.all([
    db
      .select({
        id: teacherMessages.id,
        senderType: teacherMessages.senderType,
        senderId: teacherMessages.senderId,
        recipientType: teacherMessages.recipientType,
        recipientId: teacherMessages.recipientId,
        studentId: teacherMessages.studentId,
        studentName: sql<string | null>`(SELECT first_name || ' ' || last_name FROM students WHERE id = ${teacherMessages.studentId})`,
        subject: teacherMessages.subject,
        content: teacherMessages.content,
        isRead: teacherMessages.isRead,
        isStarred: teacherMessages.isStarred,
        threadId: teacherMessages.threadId,
        createdAt: teacherMessages.createdAt,
      })
      .from(teacherMessages)
      .where(and(...conditions))
      .orderBy(desc(teacherMessages.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(teacherMessages)
      .where(and(...conditions)),
  ])

  return {
    messages: messages.map((m: any) => ({
      ...m,
      preview: m.content.substring(0, 100) + (m.content.length > 100 ? '...' : ''),
    })),
    total: countResult[0]?.count ?? 0,
    page,
    pageSize,
  }
}

/**
 * Get message details with thread
 */
export async function getMessageDetailsQuery(params: {
  messageId: string
  teacherId: string
}) {
  const db = getDb()

  const message = await db
    .select({
      id: teacherMessages.id,
      schoolId: teacherMessages.schoolId,
      senderType: teacherMessages.senderType,
      senderId: teacherMessages.senderId,
      recipientType: teacherMessages.recipientType,
      recipientId: teacherMessages.recipientId,
      studentId: teacherMessages.studentId,
      studentName: sql<string | null>`(SELECT first_name || ' ' || last_name FROM students WHERE id = ${teacherMessages.studentId})`,
      classId: teacherMessages.classId,
      className: sql<string | null>`(SELECT g.name || ' ' || c.section FROM classes c JOIN grades g ON c.grade_id = g.id WHERE c.id = ${teacherMessages.classId})`,
      threadId: teacherMessages.threadId,
      subject: teacherMessages.subject,
      content: teacherMessages.content,
      attachments: teacherMessages.attachments,
      isRead: teacherMessages.isRead,
      readAt: teacherMessages.readAt,
      createdAt: teacherMessages.createdAt,
    })
    .from(teacherMessages)
    .where(eq(teacherMessages.id, params.messageId))
    .limit(1)

  if (!message[0])
    return null

  // Get thread messages if this is part of a thread
  let thread: any[] = []
  const threadId = message[0].threadId ?? message[0].id
  if (threadId) {
    thread = await db
      .select({
        id: teacherMessages.id,
        senderType: teacherMessages.senderType,
        senderId: teacherMessages.senderId,
        content: teacherMessages.content,
        createdAt: teacherMessages.createdAt,
      })
      .from(teacherMessages)
      .where(eq(teacherMessages.threadId, threadId))
      .orderBy(asc(teacherMessages.createdAt))
  }

  return {
    ...message[0],
    thread,
  }
}

/**
 * Send a message
 */
export async function sendTeacherMessage(params: {
  schoolId: string
  teacherId: string
  recipientId: string
  studentId?: string
  classId?: string
  subject?: string
  content: string
  replyToId?: string
  attachments?: Array<{ name: string, url: string, type: string, size: number }>
}) {
  const db = getDb()

  // Determine thread ID
  let threadId = null
  if (params.replyToId) {
    const original = await db
      .select({ threadId: teacherMessages.threadId, id: teacherMessages.id })
      .from(teacherMessages)
      .where(eq(teacherMessages.id, params.replyToId))
      .limit(1)
    threadId = original[0]?.threadId ?? original[0]?.id
  }

  const [created] = await db
    .insert(teacherMessages)
    .values({
      id: nanoid(),
      schoolId: params.schoolId,
      senderType: 'teacher',
      senderId: params.teacherId,
      recipientType: 'parent',
      recipientId: params.recipientId,
      studentId: params.studentId,
      classId: params.classId,
      threadId,
      replyToId: params.replyToId,
      subject: params.subject,
      content: params.content,
      attachments: params.attachments ?? [],
    })
    .returning()

  return created
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(params: {
  messageId: string
  teacherId: string
}) {
  const db = getDb()

  const [updated] = await db
    .update(teacherMessages)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(
      and(
        eq(teacherMessages.id, params.messageId),
        eq(teacherMessages.recipientType, 'teacher'),
        eq(teacherMessages.recipientId, params.teacherId),
      ),
    )
    .returning()

  return updated
}

/**
 * Get message templates
 */
export async function getMessageTemplatesQuery(params: {
  schoolId: string
  category?: string
}) {
  const db = getDb()

  const conditions = [
    eq(messageTemplates.schoolId, params.schoolId),
    eq(messageTemplates.isActive, true),
  ]
  if (params.category) {
    conditions.push(eq(messageTemplates.category, params.category as any))
  }

  return db
    .select({
      id: messageTemplates.id,
      name: messageTemplates.name,
      category: messageTemplates.category,
      subject: messageTemplates.subject,
      content: messageTemplates.content,
      placeholders: messageTemplates.placeholders,
    })
    .from(messageTemplates)
    .where(and(...conditions))
    .orderBy(asc(messageTemplates.name))
}

/**
 * Search parents that teacher can message (parents of students in teacher's classes)
 */
export async function searchParentsForTeacher(params: {
  teacherId: string
  schoolId: string
  schoolYearId: string
  query: string
  classId?: string
}) {
  const db = getDb()

  // Find parents of students in classes the teacher teaches using studentParents junction table
  const conditions: any[] = [
    eq(students.schoolId, params.schoolId),
    sql`(${students.firstName} || ' ' || ${students.lastName}) ILIKE ${`%${params.query}%`}`,
  ]

  if (params.classId) {
    conditions.push(eq(enrollments.classId, params.classId))
  }

  const results = await db
    .select({
      studentId: students.id,
      studentName: sql<string>`${students.firstName} || ' ' || ${students.lastName}`,
      className: sql<string>`(SELECT g.name || ' ' || c.section FROM classes c JOIN grades g ON c.grade_id = g.id WHERE c.id = ${enrollments.classId})`,
      parentId: parents.id,
      parentName: sql<string>`${parents.firstName} || ' ' || ${parents.lastName}`,
      parentPhone: parents.phone,
    })
    .from(students)
    .innerJoin(enrollments, eq(enrollments.studentId, students.id))
    .innerJoin(classSubjects, eq(classSubjects.classId, enrollments.classId))
    .innerJoin(studentParents, eq(studentParents.studentId, students.id))
    .innerJoin(parents, eq(studentParents.parentId, parents.id))
    .where(
      and(
        ...conditions,
        eq(classSubjects.teacherId, params.teacherId),
        eq(enrollments.schoolYearId, params.schoolYearId),
        eq(enrollments.status, 'confirmed'),
      ),
    )
    .limit(50)

  // Dedupe by parent
  const parentMap = new Map<string, any>()
  for (const r of results) {
    if (!parentMap.has(r.parentId)) {
      parentMap.set(r.parentId, {
        id: r.parentId,
        name: r.parentName,
        phone: r.parentPhone,
        studentName: r.studentName,
        className: r.className,
      })
    }
  }

  return Array.from(parentMap.values())
}
