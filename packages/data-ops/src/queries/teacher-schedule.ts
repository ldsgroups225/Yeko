/**
 * Teacher Schedule Queries
 */
import { and, eq, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { grades, subjects } from '../drizzle/core-schema'
import {
  classes,
  classrooms,
  timetableSessions,
} from '../drizzle/school-schema'

/**
 * Get detailed schedule for a teacher
 */
export async function getTeacherDetailedSchedule(params: {
  teacherId: string
  schoolYearId: string
  startDate?: string
  endDate?: string
}) {
  const db = getDb()

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
    substitutionMap: {} as Record<string, any>,
    cancellationMap: {} as Record<string, any>,
  }
}
