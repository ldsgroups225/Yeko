import type { SQL } from 'drizzle-orm'
import type { GradeStatus, GradeType, MessageCategory } from '../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { aliasedTable, and, asc, desc, eq, gte, lte, or, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { grades, programTemplateChapters, schools, subjects } from '../drizzle/core-schema'
import {
  chapterCompletions,
  classes,
  classSessions,
  classSubjects,
  curriculumProgress,
  enrollments,
  homework,
  homeworkSubmissions,
  messageTemplates,
  parents,
  participationGrades,
  studentAttendance,
  studentGrades,
  studentParents,
  students,
  teacherMessages,
  teachers,
  users,
  userSchools,
} from '../drizzle/school-schema'
import { DatabaseError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

// Aliased tables for messaging polymorphic names
const senderTeachers = aliasedTable(teachers, 'sender_teachers')
const senderUsers = aliasedTable(users, 'sender_users')
const senderParents = aliasedTable(parents, 'sender_parents')

const recipientTeachers = aliasedTable(teachers, 'recipient_teachers')
const recipientUsers = aliasedTable(users, 'recipient_users')
const recipientParents = aliasedTable(parents, 'recipient_parents')

// Type definitions for teacher app queries
export interface TeacherClassSession {
  id: string
  classId: string
  schoolId: string
  className: string
  schoolYearId: string
  subjectId: string
  subjectName: string
  teacherId: string
  date: string
  startTime: string
  endTime: string
  topic: string | null
  notes: string | null
  homework: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  studentsPresent: number | null
  studentsAbsent: number | null
  chapterId: string | null
  chapterName: string | null
  createdAt: Date
  completedAt: Date | null
}

export interface ParticipationGrade {
  studentId: string
  grade: number
  comment: string | null
}

export interface TeacherSchool {
  id: string
  name: string
  code: string
  address: string | null
  phone: string | null
  email: string | null
  logoUrl: string | null
  userId: string
}

export interface HomeworkDetails {
  id: string
  schoolId: string
  classId: string
  className: string
  subjectId: string
  subjectName: string
  teacherId: string
  classSessionId: string | null
  title: string
  description: string | null
  instructions: string | null
  dueDate: string
  dueTime: string | null
  maxPoints: number | null
  isGraded: boolean
  attachments: Array<{ name: string, url: string, type: string, size: number }> | null
  status: 'draft' | 'active' | 'closed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export type HomeworkDeleteResult
  = | { deleted: boolean }
    | HomeworkDetails

export interface MessageThread {
  id: string
  senderType: 'teacher' | 'parent'
  senderId: string
  senderName: string | null
  content: string
  createdAt: Date
}

export interface MessageDetails {
  id: string
  schoolId: string
  senderType: 'teacher' | 'parent'
  senderId: string
  senderName: string | null
  recipientType: 'teacher' | 'parent'
  recipientId: string
  recipientName: string | null
  studentId: string | null
  studentName: string | null
  classId: string | null
  className: string | null
  threadId: string
  subject: string
  content: string
  attachments: Array<{ name: string, url: string, type: string, size: number }> | null
  isRead: boolean
  readAt: Date | null
  createdAt: Date
  thread: MessageThread[]
}

export interface TimetableSession {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  class: { id: string, name: string, gradeName: string, section: string }
  subject: { id: string, name: string, shortName: string | null }
  classroom: { id: string | null, name: string | null, code: string | null } | null
}

export interface ParentSearchResult {
  id: string
  name: string
  phone: string
  studentName: string
  className: string
}

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
}): R.ResultAsync<typeof classSessions.$inferSelect, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        const [session] = await db
          .insert(classSessions)
          .values({
            id: crypto.randomUUID(),
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
        if (!session) {
          throw new Error('Failed to create class session')
        }
        return session
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'session.createFailed'), { code: 'CREATE_SESSION_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
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
}): R.ResultAsync<typeof classSessions.$inferSelect, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
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
        if (!updated) {
          throw new Error('Failed to complete class session')
        }
        return updated
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'session.completeFailed'), { code: 'COMPLETE_SESSION_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Get session details
 */
export async function getTeacherClassSessionById(sessionId: string): R.ResultAsync<TeacherClassSession | null, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        const result = await db
          .select({
            id: classSessions.id,
            classId: classSessions.classId,
            schoolId: classes.schoolId,
            className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
            schoolYearId: classes.schoolYearId,
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
            chapterName: programTemplateChapters.title,
            createdAt: classSessions.createdAt,
            completedAt: classSessions.completedAt,
          })
          .from(classSessions)
          .innerJoin(subjects, eq(classSessions.subjectId, subjects.id))
          .innerJoin(classes, eq(classSessions.classId, classes.id))
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .leftJoin(programTemplateChapters, eq(classSessions.chapterId, programTemplateChapters.id))
          .where(eq(classSessions.id, sessionId))
          .limit(1)

        return (result[0] ?? null) as TeacherClassSession | null
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'session.getFailed'), { code: 'GET_SESSION_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, { sessionId })),
  )
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
}): R.ResultAsync<{
  sessions: Array<{
    id: string
    className: string
    subjectName: string
    date: string
    startTime: string
    endTime: string | null
    status: 'scheduled' | 'completed' | 'cancelled'
    studentsPresent: number | null
    studentsAbsent: number | null
  }>
  total: number
  page: number
  pageSize: number
}, DatabaseError> {
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

  return R.pipe(
    R.try({
      try: async () => {
        const [sessions, countResult] = await Promise.all([
          db
            .select({
              id: classSessions.id,
              className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
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
            .innerJoin(classes, eq(classSessions.classId, classes.id))
            .innerJoin(grades, eq(classes.gradeId, grades.id))
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
          sessions: sessions.map(s => ({
            ...s,
            status: s.status as 'scheduled' | 'completed' | 'cancelled',
          })),
          total: countResult[0]?.count ?? 0,
          page,
          pageSize,
        }
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'session.historyFailed'), { code: 'GET_SESSION_HISTORY_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
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
}): R.ResultAsync<Array<{
  id: string
  firstName: string
  lastName: string
  matricule: string | null
  photoUrl: string | null
}>, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        return await db
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
      },
      catch: (e) => {
        return DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'students.getFailed'), { code: 'GET_CLASS_STUDENTS_FAILED' })
      },
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
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
}): R.ResultAsync<{ success: boolean }, DatabaseError> {
  const db = getDb()

  if (params.grades.length === 0) {
    return R.succeed({ success: true })
  }

  return R.pipe(
    R.try({
      try: async () => {
        await db
          .insert(participationGrades)
          .values(params.grades.map(grade => ({
            id: crypto.randomUUID(),
            studentId: grade.studentId,
            classSessionId: params.classSessionId,
            teacherId: params.teacherId,
            grade: grade.grade,
            comment: grade.comment,
          })))
          .onConflictDoUpdate({
            target: [participationGrades.studentId, participationGrades.classSessionId],
            set: {
              grade: sql`excluded.grade`,
              comment: sql`excluded.comment`,
              updatedAt: new Date(),
            },
          })
        return { success: true }
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'participation.upsertFailed'), { code: 'UPSERT_PARTICIPATION_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Get participation grades for a session
 */
export async function getSessionParticipationGrades(classSessionId: string): R.ResultAsync<ParticipationGrade[], DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        return await db
          .select({
            studentId: participationGrades.studentId,
            grade: participationGrades.grade,
            comment: participationGrades.comment,
          })
          .from(participationGrades)
          .where(eq(participationGrades.classSessionId, classSessionId))
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'participation.getFailed'), { code: 'GET_PARTICIPATION_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, { classSessionId })),
  )
}

// ============================================
// TEACHER CLASSES
// ============================================

/**
 * Get classes assigned to a teacher
 */
export async function getTeacherAssignedClasses(params: {
  teacherId: string
  schoolYearId?: string | null
}): R.ResultAsync<Array<{
  id: string
  name: string
  subjects: Array<{ id: string, name: string, shortName: string | null }>
}>, DatabaseError> {
  const db = getDb()

  if (!params.schoolYearId) {
    return R.succeed([])
  }

  return R.pipe(
    R.try({
      try: async () => {
        const result = await db
          .select({
            classId: classSubjects.classId,
            className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
            subjectId: classSubjects.subjectId,
            subjectName: subjects.name,
            subjectShortName: subjects.shortName,
          })
          .from(classSubjects)
          .innerJoin(subjects, eq(classSubjects.subjectId, subjects.id))
          .innerJoin(classes, eq(classSubjects.classId, classes.id))
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .where(
            and(
              eq(classSubjects.teacherId, params.teacherId),
              eq(classes.schoolYearId, params.schoolYearId!),
            ),
          )
          .orderBy(grades.name, classes.section)

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
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'classes.listFailed'), { code: 'GET_TEACHER_CLASSES_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Get schools that a teacher is linked to via userSchools
 */
export async function getTeacherSchools(userId: string): R.ResultAsync<TeacherSchool[], DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        return await db
          .select({
            id: schools.id,
            name: schools.name,
            code: schools.code,
            address: schools.address,
            phone: schools.phone,
            email: schools.email,
            logoUrl: schools.logoUrl,
            userId: userSchools.userId,
          })
          .from(userSchools)
          .innerJoin(schools, eq(userSchools.schoolId, schools.id))
          .where(eq(userSchools.userId, userId))
          .orderBy(asc(schools.name))
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'classes.schoolsFailed'), { code: 'GET_TEACHER_SCHOOLS_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, { userId })),
  )
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
}): R.ResultAsync<typeof homework.$inferSelect, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        const [created] = await db
          .insert(homework)
          .values({
            id: crypto.randomUUID(),
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
        if (!created) {
          throw new Error('Failed to create homework assignment')
        }
        return created
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'homework.createFailed'), { code: 'CREATE_HOMEWORK_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
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
}): R.ResultAsync<{
  homework: Array<{
    id: string
    className: string
    subjectName: string
    title: string
    dueDate: string
    status: 'draft' | 'active' | 'closed' | 'cancelled'
    submissionCount: number
  }>
  total: number
  page: number
  pageSize: number
}, DatabaseError> {
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

  return R.pipe(
    R.try({
      try: async () => {
        const [homeworkList, countResult] = await Promise.all([
          db
            .select({
              id: homework.id,
              title: homework.title,
              className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
              subjectName: subjects.name,
              dueDate: homework.dueDate,
              dueTime: homework.dueTime,
              status: homework.status,
              maxPoints: homework.maxPoints,
              isGraded: homework.isGraded,
              createdAt: homework.createdAt,
              submissionCount: sql<number>`count(${homeworkSubmissions.id})::int`,
            })
            .from(homework)
            .innerJoin(subjects, eq(homework.subjectId, subjects.id))
            .innerJoin(classes, eq(homework.classId, classes.id))
            .innerJoin(grades, eq(classes.gradeId, grades.id))
            .leftJoin(homeworkSubmissions, eq(homeworkSubmissions.homeworkId, homework.id))
            .where(and(...conditions))
            .groupBy(homework.id, subjects.id, classes.id, grades.id)
            .orderBy(desc(homework.dueDate))
            .limit(pageSize)
            .offset((page - 1) * pageSize),
          db
            .select({ count: sql<number>`count(*)::int` })
            .from(homework)
            .where(and(...conditions)),
        ])

        return {
          homework: homeworkList,
          total: countResult[0]?.count ?? 0,
          page,
          pageSize,
        }
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'homework.listFailed'), { code: 'GET_HOMEWORK_LIST_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Get homework details by ID
 */
export async function getHomeworkById(homeworkId: string): R.ResultAsync<HomeworkDetails | null, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        const result = await db
          .select({
            id: homework.id,
            schoolId: homework.schoolId,
            classId: homework.classId,
            className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
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
          .innerJoin(classes, eq(homework.classId, classes.id))
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .where(eq(homework.id, homeworkId))
          .limit(1)

        return (result[0] ?? null) as HomeworkDetails | null
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'homework.getFailed'), { code: 'GET_HOMEWORK_DETAILS_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, { homeworkId })),
  )
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
}): R.ResultAsync<typeof homework.$inferSelect, DatabaseError> {
  const db = getDb()

  const updateData: Record<string, unknown> = {}
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

  return R.pipe(
    R.try({
      try: async () => {
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
        if (!updated) {
          throw new Error('Failed to update homework assignment')
        }
        return updated
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'homework.updateFailed'), { code: 'UPDATE_HOMEWORK_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Delete homework (soft delete by setting status to cancelled, or hard delete if draft)
 */
export async function deleteHomeworkAssignment(params: {
  homeworkId: string
  teacherId: string
}): R.ResultAsync<HomeworkDeleteResult | null, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
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
          await db
            .delete(homework)
            .where(eq(homework.id, params.homeworkId))
          return { deleted: true }
        }
        else {
          await db
            .update(homework)
            .set({ status: 'cancelled' })
            .where(eq(homework.id, params.homeworkId))

          // Fetch the updated homework with all details
          const updatedHomework = await db
            .select({
              id: homework.id,
              schoolId: homework.schoolId,
              classId: homework.classId,
              className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
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
            .innerJoin(classes, eq(homework.classId, classes.id))
            .innerJoin(grades, eq(classes.gradeId, grades.id))
            .where(eq(homework.id, params.homeworkId))
            .limit(1)

          if (!updatedHomework[0]) {
            throw new Error('Failed to delete homework assignment')
          }
          return updatedHomework[0] as HomeworkDetails
        }
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'homework.deleteFailed'), { code: 'DELETE_HOMEWORK_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
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
}): R.ResultAsync<{
  messages: Array<{
    id: string
    senderType: 'teacher' | 'parent' | 'admin' | 'student'
    senderId: string
    senderName: string | null
    recipientType: 'teacher' | 'parent' | 'admin' | 'student'
    recipientId: string
    recipientName: string | null
    studentId: string | null
    studentName: string | null
    subject: string | null
    content: string
    preview: string
    isRead: boolean
    isStarred: boolean
    threadId: string | null
    createdAt: Date
  }>
  total: number
  page: number
  pageSize: number
}, DatabaseError> {
  const db = getDb()
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20

  const conditions: SQL[] = []

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

  return R.pipe(
    R.try({
      try: async () => {
        const [messages, countResult] = await Promise.all([
          db
            .select({
              id: teacherMessages.id,
              senderType: teacherMessages.senderType,
              senderId: teacherMessages.senderId,
              senderName: sql<string | null>`
                CASE 
                  WHEN ${teacherMessages.senderType} = 'teacher' THEN ${senderUsers.name}
                  WHEN ${teacherMessages.senderType} = 'parent' THEN ${senderParents.firstName} || ' ' || ${senderParents.lastName}
                  ELSE NULL
                END
              `,
              recipientType: teacherMessages.recipientType,
              recipientId: teacherMessages.recipientId,
              recipientName: sql<string | null>`
                CASE 
                  WHEN ${teacherMessages.recipientType} = 'teacher' THEN ${recipientUsers.name}
                  WHEN ${teacherMessages.recipientType} = 'parent' THEN ${recipientParents.firstName} || ' ' || ${recipientParents.lastName}
                  ELSE NULL
                END
              `,
              studentId: teacherMessages.studentId,
              studentName: sql<string | null>`${students.firstName} || ' ' || ${students.lastName}`,
              subject: teacherMessages.subject,
              content: teacherMessages.content,
              isRead: teacherMessages.isRead ?? false,
              isStarred: teacherMessages.isStarred,
              threadId: teacherMessages.threadId,
              createdAt: teacherMessages.createdAt,
            })
            .from(teacherMessages)
            .leftJoin(students, eq(teacherMessages.studentId, students.id))
            .leftJoin(senderTeachers, eq(teacherMessages.senderId, senderTeachers.id))
            .leftJoin(senderUsers, eq(senderTeachers.userId, senderUsers.id))
            .leftJoin(senderParents, eq(teacherMessages.senderId, senderParents.id))
            .leftJoin(recipientTeachers, eq(teacherMessages.recipientId, recipientTeachers.id))
            .leftJoin(recipientUsers, eq(recipientTeachers.userId, recipientUsers.id))
            .leftJoin(recipientParents, eq(teacherMessages.recipientId, recipientParents.id))
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
          messages: messages.map(m => ({
            ...m,
            isRead: m.isRead ?? false,
            isStarred: m.isStarred ?? false,
            preview: m.content.substring(0, 100) + (m.content.length > 100 ? '...' : ''),
          })),
          total: countResult[0]?.count ?? 0,
          page,
          pageSize,
        }
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'messaging.listFailed'), { code: 'GET_MESSAGES_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Get message details with thread
 */
export async function getMessageDetailsQuery(params: {
  messageId: string
  teacherId: string
}): R.ResultAsync<MessageDetails | null, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        const message = await db
          .select({
            id: teacherMessages.id,
            schoolId: teacherMessages.schoolId,
            senderType: teacherMessages.senderType,
            senderId: teacherMessages.senderId,
            senderName: sql<string | null>`
              CASE 
                WHEN ${teacherMessages.senderType} = 'teacher' THEN ${senderUsers.name}
                WHEN ${teacherMessages.senderType} = 'parent' THEN ${senderParents.firstName} || ' ' || ${senderParents.lastName}
                ELSE NULL
              END
            `,
            recipientType: teacherMessages.recipientType,
            recipientId: teacherMessages.recipientId,
            recipientName: sql<string | null>`
              CASE 
                WHEN ${teacherMessages.recipientType} = 'teacher' THEN ${recipientUsers.name}
                WHEN ${teacherMessages.recipientType} = 'parent' THEN ${recipientParents.firstName} || ' ' || ${recipientParents.lastName}
                ELSE NULL
              END
            `,
            studentId: teacherMessages.studentId,
            studentName: sql<string | null>`${students.firstName} || ' ' || ${students.lastName}`,
            classId: teacherMessages.classId,
            className: sql<string | null>`${grades.name} || ' ' || ${classes.section}`,
            threadId: teacherMessages.threadId,
            subject: teacherMessages.subject,
            content: teacherMessages.content,
            attachments: teacherMessages.attachments,
            isRead: teacherMessages.isRead,
            readAt: teacherMessages.readAt,
            createdAt: teacherMessages.createdAt,
          })
          .from(teacherMessages)
          .leftJoin(students, eq(teacherMessages.studentId, students.id))
          .leftJoin(classes, eq(teacherMessages.classId, classes.id))
          .leftJoin(grades, eq(classes.gradeId, grades.id))
          .leftJoin(senderTeachers, eq(teacherMessages.senderId, senderTeachers.id))
          .leftJoin(senderUsers, eq(senderTeachers.userId, senderUsers.id))
          .leftJoin(senderParents, eq(teacherMessages.senderId, senderParents.id))
          .leftJoin(recipientTeachers, eq(teacherMessages.recipientId, recipientTeachers.id))
          .leftJoin(recipientUsers, eq(recipientTeachers.userId, recipientUsers.id))
          .leftJoin(recipientParents, eq(teacherMessages.recipientId, recipientParents.id))
          .where(eq(teacherMessages.id, params.messageId))
          .limit(1)

        if (!message[0])
          return null

        const threadId = message[0].threadId ?? message[0].id
        const thread = await db
          .select({
            id: teacherMessages.id,
            senderType: teacherMessages.senderType,
            senderId: teacherMessages.senderId,
            senderName: sql<string | null>`
              CASE 
                WHEN ${teacherMessages.senderType} = 'teacher' THEN ${senderUsers.name}
                WHEN ${teacherMessages.senderType} = 'parent' THEN ${senderParents.firstName} || ' ' || ${senderParents.lastName}
                ELSE NULL
              END
            `,
            content: teacherMessages.content,
            createdAt: teacherMessages.createdAt,
          })
          .from(teacherMessages)
          .leftJoin(senderTeachers, eq(teacherMessages.senderId, senderTeachers.id))
          .leftJoin(senderUsers, eq(senderTeachers.userId, senderUsers.id))
          .leftJoin(senderParents, eq(teacherMessages.senderId, senderParents.id))
          .where(
            or(
              eq(teacherMessages.threadId, threadId!),
              eq(teacherMessages.id, threadId!),
            ),
          )
          .orderBy(asc(teacherMessages.createdAt))

        return {
          ...message[0],
          thread,
        } as MessageDetails
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'messaging.detailsFailed'), { code: 'GET_MESSAGE_DETAILS_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
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
}): R.ResultAsync<typeof teacherMessages.$inferSelect, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
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
            id: crypto.randomUUID(),
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
        if (!created) {
          throw new Error('Failed to send message')
        }
        return created
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'messaging.sendFailed'), { code: 'SEND_MESSAGE_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(params: {
  messageId: string
  teacherId: string
}): R.ResultAsync<typeof teacherMessages.$inferSelect, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
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
        if (!updated) {
          throw new Error('Failed to mark message as read')
        }
        return updated
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'messaging.markReadFailed'), { code: 'MARK_MESSAGE_READ_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Get message templates
 */
export async function getMessageTemplatesQuery(params: {
  schoolId: string
  category?: MessageCategory
}): R.ResultAsync<Array<{
  id: string
  name: string
  category: MessageCategory
  subject: string | null
  content: string
  placeholders: string[] | null
}>, DatabaseError> {
  const db = getDb()

  const conditions = [
    eq(messageTemplates.schoolId, params.schoolId),
    eq(messageTemplates.isActive, true),
  ]
  if (params.category) {
    conditions.push(eq(messageTemplates.category, params.category))
  }

  return R.pipe(
    R.try({
      try: async () => {
        return await db
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
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'messaging.templatesFailed'), { code: 'GET_TEMPLATES_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
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
}): R.ResultAsync<Array<{
  id: string
  name: string
  phone: string | null
  studentName: string
  className: string
}>, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        const conditions: SQL[] = [
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
            className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
            parentId: parents.id,
            parentName: sql<string>`${parents.firstName} || ' ' || ${parents.lastName}`,
            parentPhone: parents.phone,
          })
          .from(students)
          .innerJoin(enrollments, eq(enrollments.studentId, students.id))
          .innerJoin(classes, eq(enrollments.classId, classes.id))
          .innerJoin(grades, eq(classes.gradeId, grades.id))
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

        const parentMap = new Map<string, ParentSearchResult>()
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
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'parents.searchFailed'), { code: 'SEARCH_PARENTS_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

// ============================================
// STUDENT GRADES
// ============================================

/**
 * Submit student grades for a class/subject
 */
export async function submitStudentGrades(params: {
  teacherId: string
  schoolId: string
  classId: string
  subjectId: string
  termId: string
  grades: Array<{
    studentId: string
    grade: number
  }>
  status: GradeStatus
  gradeType?: GradeType
}): R.ResultAsync<{ success: boolean, count: number }, DatabaseError> {
  const db = getDb()

  const gradeType: GradeType = params.gradeType ?? 'test'
  const today = new Date().toISOString().split('T')[0]!

  if (params.grades.length === 0) {
    return R.succeed({ success: true, count: 0 })
  }

  return R.pipe(
    R.try({
      try: async () => {
        const results = await db
          .insert(studentGrades)
          .values(params.grades.map(grade => ({
            id: crypto.randomUUID(),
            studentId: grade.studentId,
            classId: params.classId,
            subjectId: params.subjectId,
            termId: params.termId,
            teacherId: params.teacherId,
            value: grade.grade.toFixed(2),
            type: gradeType,
            weight: 1,
            gradeDate: today,
            status: params.status,
            submittedAt: params.status === 'submitted' ? new Date() : null,
          })))
          .returning()

        return { success: true, count: results.length }
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'grades.submitFailed'), { code: 'SUBMIT_GRADES_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

// ============================================
// DASHBOARD QUERIES
// ============================================

/**
 * Get teacher's schedule for a specific day
 */
export function getTeacherDaySchedule(params: {
  teacherId: string
  schoolYearId: string
  dayOfWeek: number
}): R.ResultAsync<TimetableSession[], DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        const { timetableSessions, classrooms } = await import('../drizzle/school-schema')

        const result = await db
          .select({
            id: timetableSessions.id,
            dayOfWeek: timetableSessions.dayOfWeek,
            startTime: timetableSessions.startTime,
            endTime: timetableSessions.endTime,
            class: {
              id: classes.id,
              name: sql<string>`${grades.name} || ' ' || ${classes.section}`,
              gradeName: grades.name,
              section: classes.section,
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
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .innerJoin(subjects, eq(timetableSessions.subjectId, subjects.id))
          .leftJoin(classrooms, eq(timetableSessions.classroomId, classrooms.id))
          .where(
            and(
              eq(timetableSessions.teacherId, params.teacherId),
              eq(classes.schoolYearId, params.schoolYearId),
              eq(timetableSessions.dayOfWeek, params.dayOfWeek),
            ),
          )
          .orderBy(asc(timetableSessions.startTime))

        return result.map(session => ({
          ...session,
          classroom: session.classroom?.id ? session.classroom : null,
        }))
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'session.dayScheduleFailed'), { code: 'GET_SCHEDULE_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Get teacher's weekly schedule
 */
export function getTeacherWeeklySchedule(params: {
  teacherId: string
  schoolYearId: string
}): R.ResultAsync<TimetableSession[], DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        const { timetableSessions, classrooms } = await import('../drizzle/school-schema')

        const result = await db
          .select({
            id: timetableSessions.id,
            dayOfWeek: timetableSessions.dayOfWeek,
            startTime: timetableSessions.startTime,
            endTime: timetableSessions.endTime,
            class: {
              id: classes.id,
              name: sql<string>`${grades.name} || ' ' || ${classes.section}`,
              gradeName: grades.name,
              section: classes.section,
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
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .innerJoin(subjects, eq(timetableSessions.subjectId, subjects.id))
          .leftJoin(classrooms, eq(timetableSessions.classroomId, classrooms.id))
          .where(
            and(
              eq(timetableSessions.teacherId, params.teacherId),
              eq(classes.schoolYearId, params.schoolYearId),
            ),
          )
          .orderBy(asc(timetableSessions.dayOfWeek), asc(timetableSessions.startTime))

        return result.map(session => ({
          ...session,
          classroom: session.classroom?.id ? session.classroom : null,
        }))
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'session.weeklyScheduleFailed'), { code: 'GET_WEEKLY_SCHEDULE_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Get teacher's active session for today
 */
export function getTeacherActiveSession(params: {
  teacherId: string
  date: string
}): R.ResultAsync<{
  id: string
  classId: string
  className: string
  subjectName: string
  startTime: string
  startedAt: Date
} | null, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        const result = await db
          .select({
            id: classSessions.id,
            classId: classSessions.classId,
            className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
            subjectName: subjects.name,
            startTime: classSessions.startTime,
            startedAt: classSessions.createdAt,
          })
          .from(classSessions)
          .innerJoin(classes, eq(classSessions.classId, classes.id))
          .innerJoin(grades, eq(classes.gradeId, grades.id))
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
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'session.activeFailed'), { code: 'GET_ACTIVE_SESSION_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Get count of pending grades for teacher
 */
export async function getTeacherPendingGradesCount(teacherId: string): R.ResultAsync<number, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        const result = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(studentGrades)
          .where(
            and(
              eq(studentGrades.teacherId, teacherId),
              eq(studentGrades.status, 'draft'),
            ),
          )
        return result[0]?.count ?? 0
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'grades.pendingCountFailed'), { code: 'GET_PENDING_GRADES_COUNT_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, { teacherId })),
  )
}

/**
 * Get count of unread messages for teacher
 */
export async function getTeacherUnreadMessagesCount(teacherId: string): R.ResultAsync<number, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        const result = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(teacherMessages)
          .where(
            and(
              eq(teacherMessages.recipientType, 'teacher'),
              eq(teacherMessages.recipientId, teacherId),
              eq(teacherMessages.isRead, false),
              eq(teacherMessages.isArchived, false),
            ),
          )
        return result[0]?.count ?? 0
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'messaging.unreadCountFailed'), { code: 'GET_UNREAD_MESSAGES_COUNT_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, { teacherId })),
  )
}

/**
 * Get recent messages for teacher
 */
export function getTeacherRecentMessages(params: {
  teacherId: string
  limit?: number
}): R.ResultAsync<Array<{
  id: string
  senderType: 'teacher' | 'parent' | 'admin' | 'student'
  subject: string | null
  content: string
  isRead: boolean
  createdAt: Date
}>, DatabaseError> {
  const db = getDb()
  const limit = params.limit ?? 5

  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .select({
            id: teacherMessages.id,
            senderType: teacherMessages.senderType,
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
              eq(teacherMessages.isArchived, false),
            ),
          )
          .orderBy(desc(teacherMessages.createdAt))
          .limit(limit)
        return rows.map(r => ({
          ...r,
          isRead: r.isRead ?? false,
        }))
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'messaging.recentFailed'), { code: 'GET_RECENT_MESSAGES_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Get notifications for teacher
 */
export async function getTeacherNotificationsQuery(params: {
  teacherId: string
  unreadOnly?: boolean
  limit?: number
}): R.ResultAsync<Array<{
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  createdAt: Date
}>, DatabaseError> {
  const db = getDb()
  const limit = params.limit ?? 10

  return R.pipe(
    R.try({
      try: async () => {
        const { teacherNotifications } = await import('../drizzle/school-schema')

        const conditions = [
          eq(teacherNotifications.teacherId, params.teacherId),
        ]

        if (params.unreadOnly) {
          conditions.push(eq(teacherNotifications.isRead, false))
        }

        const rows = await db
          .select({
            id: teacherNotifications.id,
            type: teacherNotifications.type,
            title: teacherNotifications.title,
            body: teacherNotifications.body,
            isRead: teacherNotifications.isRead,
            createdAt: teacherNotifications.createdAt,
          })
          .from(teacherNotifications)
          .where(and(...conditions))
          .orderBy(desc(teacherNotifications.createdAt))
          .limit(limit)

        return rows.map(r => ({
          ...r,
          body: r.body ?? '',
          isRead: r.isRead ?? false,
          type: r.type, // Ensure type is passed through or cast if needed, though basic string match is usually fine
        }))
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'notifications.listFailed'), { code: 'GET_NOTIFICATIONS_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Get current term for a school year
 */
export async function getCurrentTermForSchoolYear(schoolYearId: string): R.ResultAsync<{
  id: string
  name: string
  startDate: string
  endDate: string
} | null, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        const { terms } = await import('../drizzle/school-schema')
        const { termTemplates } = await import('../drizzle/core-schema')

        const today = new Date().toISOString().split('T')[0]!

        const result = await db
          .select({
            id: terms.id,
            name: termTemplates.name,
            startDate: terms.startDate,
            endDate: terms.endDate,
          })
          .from(terms)
          .innerJoin(termTemplates, eq(terms.termTemplateId, termTemplates.id))
          .where(
            and(
              eq(terms.schoolYearId, schoolYearId),
              lte(terms.startDate, today),
              gte(terms.endDate, today),
            ),
          )
          .limit(1)

        return result[0] ?? null
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'session.termFailed'), { code: 'GET_CURRENT_TERM_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolYearId })),
  )
}

/**
 * Get class and subject info
 */
export async function getClassSubjectInfo(params: {
  classId: string
  subjectId: string
}): R.ResultAsync<{ className: string, subjectName: string } | null, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        const result = await db
          .select({
            className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
            subjectName: subjects.name,
          })
          .from(classes)
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .innerJoin(subjects, eq(sql`${params.subjectId}`, subjects.id)) // Workaround for simple select
          .where(eq(classes.id, params.classId))
          .limit(1)

        return result[0] ?? null
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'classes.infoFailed'), { code: 'GET_CLASS_UBJECT_INFO_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

// ============================================
// SESSION FINALIZATION HELPERS
// ============================================

/**
 * Upsert student attendance records
 */
export async function upsertStudentAttendance(params: {
  schoolId: string
  classId: string
  classSessionId: string
  teacherId: string // recordedBy
  date: string
  records: Array<{
    studentId: string
    status: 'present' | 'late' | 'absent' | 'excused'
  }>
}): R.ResultAsync<{ success: boolean, count: number }, DatabaseError> {
  const db = getDb()

  if (params.records.length === 0) {
    return R.succeed({ success: true, count: 0 })
  }

  return R.pipe(
    R.try({
      try: async () => {
        const results = await db
          .insert(studentAttendance)
          .values(params.records.map(r => ({
            id: crypto.randomUUID(),
            studentId: r.studentId,
            classId: params.classId,
            schoolId: params.schoolId,
            classSessionId: params.classSessionId,
            date: params.date,
            status: r.status,
            recordedBy: params.teacherId,
          })))
          .onConflictDoUpdate({
            target: [studentAttendance.studentId, studentAttendance.date, studentAttendance.classId, studentAttendance.classSessionId],
            set: {
              status: sql`excluded.status`,
              updatedAt: new Date(),
            },
          })
          .returning()

        return { success: true, count: results.length }
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'attendance.upsertFailed'), { code: 'UPSERT_ATTENDANCE_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Record chapter completion
 */
export async function recordChapterCompletion(params: {
  classId: string
  subjectId: string
  chapterId: string
  classSessionId: string
  teacherId: string
  notes?: string
}): R.ResultAsync<{ success: boolean }, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        await db
          .insert(chapterCompletions)
          .values({
            id: crypto.randomUUID(),
            classId: params.classId,
            subjectId: params.subjectId,
            chapterId: params.chapterId,
            classSessionId: params.classSessionId,
            teacherId: params.teacherId,
            notes: params.notes,
            completedAt: new Date(),
          })
          .onConflictDoNothing()
        return { success: true }
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'curriculum.completionFailed'), { code: 'RECORD_CHAPTER_COMPLETION_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}

/**
 * Update curriculum progress
 */
export async function updateCurriculumProgress(params: {
  classId: string
  subjectId: string
  termId?: string
}): R.ResultAsync<{ success: boolean }, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      try: async () => {
        // 1. Find the active progress record
        const conditions = [
          eq(curriculumProgress.classId, params.classId),
          eq(curriculumProgress.subjectId, params.subjectId),
        ]
        if (params.termId) {
          conditions.push(eq(curriculumProgress.termId, params.termId))
        }

        const progressRows = await db
          .select()
          .from(curriculumProgress)
          .where(and(...conditions))
          .limit(1)

        const progressRecord = progressRows[0]

        if (!progressRecord) {
          // If no record exists, we likely need to check if there is a program template and initialize one
          // For now, we return false or success: false to indicate no update made
          return { success: false }
        }

        // Check if we already incremented for this chapter/session?
        // Simpler approach: Just increment
        const newCompletedCount = progressRecord.completedChapters + 1
        // Cap at total
        const safeCompletedCount = Math.min(newCompletedCount, progressRecord.totalChapters)

        const percent = progressRecord.totalChapters > 0
          ? (safeCompletedCount / progressRecord.totalChapters) * 100
          : 0

        await db
          .update(curriculumProgress)
          .set({
            completedChapters: safeCompletedCount,
            progressPercentage: percent.toFixed(2),
            lastChapterCompletedAt: new Date(),
            calculatedAt: new Date(),
          })
          .where(eq(curriculumProgress.id, progressRecord.id))

        return { success: true }
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('teacherApp', 'curriculum.updateFailed'), { code: 'UPDATE_CURRICULUM_PROGRESS_FAILED' }),
    }),
    R.mapError(tapLogErr(databaseLogger, params)),
  )
}
