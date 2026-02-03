import type {
  subjects,
} from '../drizzle/core-schema'
import type { classrooms, teachers, TimetableSessionInsert } from '../drizzle/school-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, asc, eq, ne, sql } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import {
  classes,
  timetableSessions,
} from '../drizzle/school-schema'
import { DatabaseError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

// ============================================
// TIMETABLE SESSIONS
// ============================================

export function getTimetableByClass(params: {
  classId: string
  schoolYearId: string
}): ResultAsync<Array<typeof timetableSessions.$inferSelect & {
  subject: { id: string, name: string, shortName: string | null, category: string | null } | null
  teacher: { user: { id: string, name: string | null } } | null
  classroom: { id: string, name: string, code: string | null } | null
}>, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.query.timetableSessions.findMany({
      where: and(
        eq(timetableSessions.classId, params.classId),
        eq(timetableSessions.schoolYearId, params.schoolYearId),
      ),
      with: {
        subject: { columns: { id: true, name: true, shortName: true, category: true } },
        teacher: {
          with: { user: { columns: { id: true, name: true } } },
        },
        classroom: { columns: { id: true, name: true, code: true } },
      },
      orderBy: [asc(timetableSessions.dayOfWeek), asc(timetableSessions.startTime)],
    }),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('timetables', 'fetchByClassFailed')),
  ).mapErr(tapLogErr(databaseLogger, params))
}

export function getTimetableByTeacher(params: {
  teacherId: string
  schoolYearId: string
}): ResultAsync<Array<typeof timetableSessions.$inferSelect & {
  class: { id: string, section: string, grade: { name: string, code: string } | null, series: { name: string, code: string | null } | null } | null
  subject: { id: string, name: string, shortName: string | null } | null
  classroom: { id: string, name: string, code: string | null } | null
}>, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.query.timetableSessions.findMany({
      where: and(
        eq(timetableSessions.teacherId, params.teacherId),
        eq(timetableSessions.schoolYearId, params.schoolYearId),
      ),
      with: {
        class: {
          with: {
            grade: { columns: { name: true, code: true } },
            series: { columns: { name: true, code: true } },
          },
          columns: { id: true, section: true },
        },
        subject: { columns: { id: true, name: true, shortName: true } },
        classroom: { columns: { id: true, name: true, code: true } },
      },
      orderBy: [asc(timetableSessions.dayOfWeek), asc(timetableSessions.startTime)],
    }),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('timetables', 'fetchByTeacherFailed')),
  ).mapErr(tapLogErr(databaseLogger, params))
}

export function getTimetableByClassroom(params: {
  classroomId: string
  schoolYearId: string
}): ResultAsync<Array<typeof timetableSessions.$inferSelect & {
  class: { id: string, section: string, grade: { name: string } | null, series: { name: string } | null } | null
  subject: { id: string, name: string, shortName: string | null } | null
  teacher: { user: { name: string | null } } | null
}>, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.query.timetableSessions.findMany({
      where: and(
        eq(timetableSessions.classroomId, params.classroomId),
        eq(timetableSessions.schoolYearId, params.schoolYearId),
      ),
      with: {
        class: {
          with: {
            grade: { columns: { name: true } },
            series: { columns: { name: true } },
          },
          columns: { id: true, section: true },
        },
        subject: { columns: { id: true, name: true, shortName: true } },
        teacher: {
          with: { user: { columns: { name: true } } },
        },
      },
      orderBy: [asc(timetableSessions.dayOfWeek), asc(timetableSessions.startTime)],
    }),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('timetables', 'fetchByClassroomFailed')),
  ).mapErr(tapLogErr(databaseLogger, params))
}

export function getTimetableSessionById(id: string): ResultAsync<(typeof timetableSessions.$inferSelect & {
  class: (typeof classes.$inferSelect & {
    grade: { name: string, code: string } | null
    series: { name: string, code: string | null } | null
  }) | null
  subject: typeof subjects.$inferSelect | null
  teacher: (typeof teachers.$inferSelect & { user: { name: string | null } }) | null
  classroom: typeof classrooms.$inferSelect | null
}) | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.query.timetableSessions.findFirst({
      where: eq(timetableSessions.id, id),
      with: {
        class: {
          with: { grade: true, series: true },
        },
        subject: true,
        teacher: {
          with: { user: { columns: { name: true } } },
        },
        classroom: true,
      },
    }),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('timetables', 'fetchByIdFailed')),
  ).map(res => res ?? null).mapErr(tapLogErr(databaseLogger, { id }))
}

export function createTimetableSession(data: TimetableSessionInsert): ResultAsync<typeof timetableSessions.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [session] = await db.insert(timetableSessions).values(data).returning()
      if (!session)
        throw new Error('Failed to create session')
      return session
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('timetables', 'createFailed')),
  ).mapErr(tapLogErr(databaseLogger, data))
}

export function updateTimetableSession(
  id: string,
  data: Partial<Omit<TimetableSessionInsert, 'id' | 'schoolId' | 'schoolYearId'>>,
): ResultAsync<typeof timetableSessions.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [updated] = await db
        .update(timetableSessions)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(timetableSessions.id, id))
        .returning()
      if (!updated)
        throw new Error(`Session with id ${id} not found`)
      return updated
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('timetables', 'updateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id, ...data }))
}

export function deleteTimetableSession(id: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      await db.delete(timetableSessions).where(eq(timetableSessions.id, id))
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('timetables', 'deleteFailed')),
  ).mapErr(tapLogErr(databaseLogger, { id }))
}

export function bulkCreateTimetableSessions(sessions: TimetableSessionInsert[]): ResultAsync<Array<typeof timetableSessions.$inferSelect>, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.insert(timetableSessions).values(sessions).returning(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('timetables', 'bulkCreateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { count: sessions.length }))
}

export function deleteClassTimetable(classId: string, schoolYearId: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      await db
        .delete(timetableSessions)
        .where(
          and(
            eq(timetableSessions.classId, classId),
            eq(timetableSessions.schoolYearId, schoolYearId),
          ),
        )
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('timetables', 'deleteClassTimetableFailed')),
  ).mapErr(tapLogErr(databaseLogger, { classId, schoolYearId }))
}

// ============================================
// CONFLICT DETECTION
// ============================================

export type ConflictType = 'teacher' | 'classroom' | 'class'

export interface TimetableConflict {
  type: ConflictType
  session1Id: string
  session2Id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  message: string
}

export function detectConflicts(params: {
  schoolId: string
  schoolYearId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  teacherId?: string
  classroomId?: string
  classId?: string
  excludeSessionId?: string
}): ResultAsync<TimetableConflict[], DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const conflicts: TimetableConflict[] = []

      // Base conditions for time overlap
      const baseConditions = [
        eq(timetableSessions.schoolId, params.schoolId),
        eq(timetableSessions.schoolYearId, params.schoolYearId),
        eq(timetableSessions.dayOfWeek, params.dayOfWeek),
        // Time overlap: (start1 < end2) AND (start2 < end1)
        sql`${timetableSessions.startTime} < ${params.endTime}`,
        sql`${params.startTime} < ${timetableSessions.endTime}`,
      ]

      if (params.excludeSessionId) {
        baseConditions.push(ne(timetableSessions.id, params.excludeSessionId))
      }

      // Check teacher conflicts
      if (params.teacherId) {
        const teacherConflicts = await db
          .select({
            id: timetableSessions.id,
            dayOfWeek: timetableSessions.dayOfWeek,
            startTime: timetableSessions.startTime,
            endTime: timetableSessions.endTime,
          })
          .from(timetableSessions)
          .where(and(...baseConditions, eq(timetableSessions.teacherId, params.teacherId)))

        for (const session of teacherConflicts) {
          conflicts.push({
            type: 'teacher',
            session1Id: params.excludeSessionId ?? '',
            session2Id: session.id,
            dayOfWeek: session.dayOfWeek,
            startTime: session.startTime,
            endTime: session.endTime,
            message: getNestedErrorMessage('timetables', 'teacherConflict'),
          })
        }
      }

      // Check classroom conflicts
      if (params.classroomId) {
        const classroomConflicts = await db
          .select({
            id: timetableSessions.id,
            dayOfWeek: timetableSessions.dayOfWeek,
            startTime: timetableSessions.startTime,
            endTime: timetableSessions.endTime,
          })
          .from(timetableSessions)
          .where(and(...baseConditions, eq(timetableSessions.classroomId, params.classroomId)))

        for (const session of classroomConflicts) {
          conflicts.push({
            type: 'classroom',
            session1Id: params.excludeSessionId ?? '',
            session2Id: session.id,
            dayOfWeek: session.dayOfWeek,
            startTime: session.startTime,
            endTime: session.endTime,
            message: getNestedErrorMessage('timetables', 'classroomConflict'),
          })
        }
      }

      // Check class conflicts
      if (params.classId) {
        const classConflicts = await db
          .select({
            id: timetableSessions.id,
            dayOfWeek: timetableSessions.dayOfWeek,
            startTime: timetableSessions.startTime,
            endTime: timetableSessions.endTime,
          })
          .from(timetableSessions)
          .where(and(...baseConditions, eq(timetableSessions.classId, params.classId)))

        for (const session of classConflicts) {
          conflicts.push({
            type: 'class',
            session1Id: params.excludeSessionId ?? '',
            session2Id: session.id,
            dayOfWeek: session.dayOfWeek,
            startTime: session.startTime,
            endTime: session.endTime,
            message: getNestedErrorMessage('timetables', 'conflict'),
          })
        }
      }

      return conflicts
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('timetables', 'detectConflictsFailed')),
  ).mapErr(tapLogErr(databaseLogger, params))
}

export function getAllConflictsForSchool(schoolId: string, schoolYearId: string): ResultAsync<TimetableConflict[], DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    (async () => {
      // Get all sessions grouped by day
      const sessions = await db.query.timetableSessions.findMany({
        where: and(
          eq(timetableSessions.schoolId, schoolId),
          eq(timetableSessions.schoolYearId, schoolYearId),
        ),
        with: {
          teacher: { with: { user: { columns: { name: true } } } },
          classroom: { columns: { name: true } },
          class: { columns: { section: true }, with: { grade: { columns: { name: true } } } },
        },
        orderBy: [asc(timetableSessions.dayOfWeek), asc(timetableSessions.startTime)],
      })

      const conflicts: TimetableConflict[] = []

      // Check each pair of sessions on the same day
      for (let i = 0; i < sessions.length; i++) {
        for (let j = i + 1; j < sessions.length; j++) {
          const s1 = sessions[i]
          const s2 = sessions[j]

          if (!s1 || !s2)
            continue
          if (s1.dayOfWeek !== s2.dayOfWeek)
            continue

          // Check time overlap
          if (!(s1.startTime < s2.endTime && s2.startTime < s1.endTime))
            continue

          // Check for conflicts
          if (s1.teacherId === s2.teacherId) {
            conflicts.push({
              type: 'teacher',
              session1Id: s1.id,
              session2Id: s2.id,
              dayOfWeek: s1.dayOfWeek,
              startTime: s1.startTime,
              endTime: s1.endTime,
              message: `${getNestedErrorMessage('timetables', 'teacherConflict')}: ${s1.teacher?.user?.name}`,
            })
          }

          if (s1.classroomId && s1.classroomId === s2.classroomId) {
            conflicts.push({
              type: 'classroom',
              session1Id: s1.id,
              session2Id: s2.id,
              dayOfWeek: s1.dayOfWeek,
              startTime: s1.startTime,
              endTime: s1.endTime,
              message: `${getNestedErrorMessage('timetables', 'classroomConflict')}: ${s1.classroom?.name}`,
            })
          }

          if (s1.classId === s2.classId) {
            conflicts.push({
              type: 'class',
              session1Id: s1.id,
              session2Id: s2.id,
              dayOfWeek: s1.dayOfWeek,
              startTime: s1.startTime,
              endTime: s1.endTime,
              message: `${getNestedErrorMessage('timetables', 'conflict')}: ${s1.class?.grade?.name} ${s1.class?.section}`,
            })
          }
        }
      }

      return conflicts
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('timetables', 'fetchAllConflictsFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, schoolYearId }))
}

// ============================================
// TEACHER WORKLOAD
// ============================================

export function getTeacherWeeklyHours(teacherId: string, schoolYearId: string): ResultAsync<{ totalHours: number, totalMinutes: number, sessionCount: number }, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    (async () => {
      const sessions = await db.query.timetableSessions.findMany({
        where: and(
          eq(timetableSessions.teacherId, teacherId),
          eq(timetableSessions.schoolYearId, schoolYearId),
        ),
      })

      let totalMinutes = 0
      for (const session of sessions) {
        const [startH, startM] = session.startTime.split(':').map(Number)
        const [endH, endM] = session.endTime.split(':').map(Number)
        const startMinutes = (startH ?? 0) * 60 + (startM ?? 0)
        const endMinutes = (endH ?? 0) * 60 + (endM ?? 0)
        totalMinutes += endMinutes - startMinutes
      }

      return {
        totalHours: Math.floor(totalMinutes / 60),
        totalMinutes: totalMinutes % 60,
        sessionCount: sessions.length,
      }
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('timetables', 'fetchTeacherWeeklyHoursFailed')),
  ).mapErr(tapLogErr(databaseLogger, { teacherId, schoolYearId }))
}

// ============================================
// AVAILABILITY
// ============================================

export function getTeacherAvailability(params: {
  teacherId: string
  schoolYearId: string
  dayOfWeek: number
}): ResultAsync<Array<{ startTime: string, endTime: string }>, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db
      .select({
        startTime: timetableSessions.startTime,
        endTime: timetableSessions.endTime,
      })
      .from(timetableSessions)
      .where(
        and(
          eq(timetableSessions.teacherId, params.teacherId),
          eq(timetableSessions.schoolYearId, params.schoolYearId),
          eq(timetableSessions.dayOfWeek, params.dayOfWeek),
        ),
      )
      .orderBy(asc(timetableSessions.startTime)),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('timetables', 'fetchTeacherAvailabilityFailed')),
  ).mapErr(tapLogErr(databaseLogger, params))
}

export function getClassroomAvailability(params: {
  classroomId: string
  schoolYearId: string
  dayOfWeek: number
}): ResultAsync<Array<{ startTime: string, endTime: string, className: string }>, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db
      .select({
        startTime: timetableSessions.startTime,
        endTime: timetableSessions.endTime,
        className: classes.section,
      })
      .from(timetableSessions)
      .innerJoin(classes, eq(timetableSessions.classId, classes.id))
      .where(
        and(
          eq(timetableSessions.classroomId, params.classroomId),
          eq(timetableSessions.schoolYearId, params.schoolYearId),
          eq(timetableSessions.dayOfWeek, params.dayOfWeek),
        ),
      )
      .orderBy(asc(timetableSessions.startTime)),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('timetables', 'fetchClassroomAvailabilityFailed')),
  ).mapErr(tapLogErr(databaseLogger, params))
}
