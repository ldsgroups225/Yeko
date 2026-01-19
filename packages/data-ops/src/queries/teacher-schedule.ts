/**
 * Teacher Schedule Queries
 * Enhanced schedule queries including substitutions and cancellations
 */
import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm'

import { getDb } from '../database/setup'
import { grades, subjects } from '../drizzle/core-schema'
import {
  classes,
  classSessions,
  classrooms,
  timetableSessions,
} from '../drizzle/school-schema'

// ============================================
// DETAILED SCHEDULE QUERIES
// ============================================

/**
 * Get detailed schedule for a teacher with date range
 * Includes substitutions and session status information
 */
export async function getTeacherDetailedSchedule(params: {
  teacherId: string
  schoolYearId: string
  startDate: string
  endDate: string
}) {
  const db = getDb()

  // Get regular timetable sessions
  const timetableResult = await db
    .select({
      id: timetableSessions.id,
      dayOfWeek: timetableSessions.dayOfWeek,
      startTime: timetableSessions.startTime,
      endTime: timetableSessions.endTime,
      class: {
        id: classes.id,
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

  // Get actual class sessions for the date range (for cancellations, substitutions)
  const sessionsResult = await db
    .select({
      id: classSessions.id,
      timetableSessionId: classSessions.timetableSessionId,
      classId: classSessions.classId,
      subjectId: classSessions.subjectId,
      teacherId: classSessions.teacherId,
      date: classSessions.date,
      startTime: classSessions.startTime,
      endTime: classSessions.endTime,
      status: classSessions.status,
      originalTeacherId: timetableSessions.teacherId,
      class: {
        id: classes.id,
        gradeName: grades.name,
        section: classes.section,
      },
      subject: {
        id: subjects.id,
        name: subjects.name,
        shortName: subjects.shortName,
      },
    })
    .from(classSessions)
    .innerJoin(classes, eq(classSessions.classId, classes.id))
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .innerJoin(subjects, eq(classSessions.subjectId, subjects.id))
    .leftJoin(
      timetableSessions,
      eq(classSessions.timetableSessionId, timetableSessions.id),
    )
    .where(
      and(
        eq(classSessions.teacherId, params.teacherId),
        gte(classSessions.date, params.startDate),
        lte(classSessions.date, params.endDate),
      ),
    )
    .orderBy(asc(classSessions.date), asc(classSessions.startTime))

  // Build substitution map (timetableSessionId -> classSession with different teacher)
  const substitutionMap = new Map<string, typeof sessionsResult[0]>()
  for (const session of sessionsResult) {
    if (session.timetableSessionId && session.originalTeacherId !== params.teacherId) {
      substitutionMap.set(session.timetableSessionId, session)
    }
  }

  // Build cancellation map (timetableSessionId -> cancelled session)
  const cancellationMap = new Map<string, typeof sessionsResult[0]>()
  for (const session of sessionsResult) {
    if (session.status === 'cancelled' && session.timetableSessionId) {
      cancellationMap.set(session.timetableSessionId, session)
    }
  }

  return {
    timetableSessions: timetableResult,
    classSessions: sessionsResult,
    substitutionMap: Object.fromEntries(substitutionMap),
    cancellationMap: Object.fromEntries(cancellationMap),
  }
}

/**
 * Get schedule summary for a specific day
 */
export async function getTeacherScheduleForDay(params: {
  teacherId: string
  schoolYearId: string
  date: string
  dayOfWeek: number
}) {
  const db = getDb()

  const result = await db
    .select({
      id: timetableSessions.id,
      startTime: timetableSessions.startTime,
      endTime: timetableSessions.endTime,
      class: {
        id: classes.id,
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

  return result
}

// ============================================
// SUBSTITUTION QUERIES
// ============================================

/**
 * Get substitution classes assigned to a teacher
 */
export async function getTeacherSubstitutions(params: {
  teacherId: string
  schoolYearId: string
  startDate: string
  endDate: string
}) {
  const db = getDb()

  // Find sessions where this teacher is substituting (teacherId differs from timetable)
  const substitutions = await db
    .select({
      id: classSessions.id,
      classSessionId: classSessions.id,
      timetableSessionId: classSessions.timetableSessionId,
      date: classSessions.date,
      startTime: classSessions.startTime,
      endTime: classSessions.endTime,
      status: classSessions.status,
      originalTeacherId: timetableSessions.teacherId,
      substitutingTeacherId: classSessions.teacherId,
      class: {
        id: classes.id,
        gradeName: grades.name,
        section: classes.section,
      },
      subject: {
        id: subjects.id,
        name: subjects.name,
        shortName: subjects.shortName,
      },
      reason: classSessions.notes,
    })
    .from(classSessions)
    .innerJoin(classes, eq(classSessions.classId, classes.id))
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .innerJoin(subjects, eq(classSessions.subjectId, subjects.id))
    .leftJoin(
      timetableSessions,
      eq(classSessions.timetableSessionId, timetableSessions.id),
    )
    .where(
      and(
        eq(classSessions.teacherId, params.teacherId),
        gte(classSessions.date, params.startDate),
        lte(classSessions.date, params.endDate),
        // Teacher differs from original timetable teacher
        sql`${classSessions.teacherId} != ${timetableSessions.teacherId}`,
        // Only scheduled or completed sessions
        sql`${classSessions.status} IN ('scheduled', 'completed')`,
      ),
    )
    .orderBy(asc(classSessions.date), asc(classSessions.startTime))

  return substitutions
}

/**
 * Get substitution history for a teacher (past substitutions)
 */
export async function getTeacherSubstitutionHistory(params: {
  teacherId: string
  schoolYearId: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}) {
  const db = getDb()
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20

  const conditions: any[] = [
    eq(classSessions.teacherId, params.teacherId),
    sql`${classSessions.teacherId} != ${timetableSessions.teacherId}`,
  ]

  if (params.startDate) {
    conditions.push(gte(classSessions.date, params.startDate))
  }
  if (params.endDate) {
    conditions.push(lte(classSessions.date, params.endDate))
  }

  const [substitutions, countResult] = await Promise.all([
    db
      .select({
        id: classSessions.id,
        date: classSessions.date,
        startTime: classSessions.startTime,
        endTime: classSessions.endTime,
        status: classSessions.status,
        className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
        subjectName: subjects.name,
      })
      .from(classSessions)
      .innerJoin(classes, eq(classSessions.classId, classes.id))
      .innerJoin(grades, eq(classes.gradeId, grades.id))
      .innerJoin(subjects, eq(classSessions.subjectId, subjects.id))
      .leftJoin(
        timetableSessions,
        eq(classSessions.timetableSessionId, timetableSessions.id),
      )
      .where(and(...conditions))
      .orderBy(desc(classSessions.date))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(classSessions)
      .leftJoin(
        timetableSessions,
        eq(classSessions.timetableSessionId, timetableSessions.id),
      )
      .where(
        and(
          eq(classSessions.teacherId, params.teacherId),
          sql`${classSessions.teacherId} != ${timetableSessions.teacherId}`,
        ),
      ),
  ])

  return {
    substitutions,
    total: countResult[0]?.count ?? 0,
    page,
    pageSize,
  }
}

// ============================================
// CANCELLATION QUERIES
// ============================================

/**
 * Get cancelled sessions for a teacher
 */
export async function getTeacherCancelledSessions(params: {
  teacherId: string
  schoolYearId: string
  startDate: string
  endDate: string
}) {
  const db = getDb()

  const cancellations = await db
    .select({
      id: classSessions.id,
      date: classSessions.date,
      startTime: classSessions.startTime,
      endTime: classSessions.endTime,
      reason: classSessions.notes,
      class: {
        id: classes.id,
        gradeName: grades.name,
        section: classes.section,
      },
      subject: {
        id: subjects.id,
        name: subjects.name,
        shortName: subjects.shortName,
      },
    })
    .from(classSessions)
    .innerJoin(classes, eq(classSessions.classId, classes.id))
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .innerJoin(subjects, eq(classSessions.subjectId, subjects.id))
    .where(
      and(
        eq(classSessions.teacherId, params.teacherId),
        eq(classSessions.status, 'cancelled'),
        gte(classSessions.date, params.startDate),
        lte(classSessions.date, params.endDate),
      ),
    )
    .orderBy(asc(classSessions.date), asc(classSessions.startTime))

  return cancellations
}

/**
 * Get all class sessions for a teacher in a date range
 */
export async function getTeacherClassSessions(params: {
  teacherId: string
  startDate: string
  endDate: string
}) {
  const db = getDb()

  const sessions = await db
    .select({
      id: classSessions.id,
      classId: classSessions.classId,
      subjectId: classSessions.subjectId,
      date: classSessions.date,
      startTime: classSessions.startTime,
      endTime: classSessions.endTime,
      status: classSessions.status,
      className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
      subjectName: subjects.name,
    })
    .from(classSessions)
    .innerJoin(classes, eq(classSessions.classId, classes.id))
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .innerJoin(subjects, eq(classSessions.subjectId, subjects.id))
    .where(
      and(
        eq(classSessions.teacherId, params.teacherId),
        gte(classSessions.date, params.startDate),
        lte(classSessions.date, params.endDate),
      ),
    )
    .orderBy(asc(classSessions.date), asc(classSessions.startTime))

  return sessions
}
