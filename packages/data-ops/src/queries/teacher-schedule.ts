import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, sql } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { grades, subjects } from '../drizzle/core-schema'
import {
  classes,
  classrooms,
  timetableSessions,
} from '../drizzle/school-schema'
import { DatabaseError } from '../errors'

/**
 * Get detailed schedule for a teacher
 */
export function getTeacherDetailedSchedule(params: {
  teacherId: string
  schoolYearId: string
  startDate?: string
  endDate?: string
}): ResultAsync<{
  timetableSessions: Array<{
    id: string
    dayOfWeek: number
    startTime: string
    endTime: string
    class: {
      id: string
      name: string
    }
    subject: {
      id: string
      name: string
      shortName: string | null
    }
    classroom: {
      id: string | null
      name: string | null
      code: string | null
    } | null
  }>
  substitutionMap: Record<string, unknown>
  cancellationMap: Record<string, unknown>
}, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    (async () => {
      const sessions = await db
        .select({
          id: timetableSessions.id,
          dayOfWeek: timetableSessions.dayOfWeek,
          startTime: timetableSessions.startTime,
          endTime: timetableSessions.endTime,
          class: {
            id: timetableSessions.classId,
            name: sql<string>`${grades.name} || ' ' || ${classes.section}`,
          },
          subject: {
            id: timetableSessions.subjectId,
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
        .orderBy(timetableSessions.dayOfWeek, timetableSessions.startTime)

      return {
        timetableSessions: sessions,
        substitutionMap: {},
        cancellationMap: {},
      }
    })(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to get teacher detailed schedule'),
  ).mapErr(tapLogErr(databaseLogger, params))
}
