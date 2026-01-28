import type { ClassroomInsert, ClassroomStatus, ClassroomType } from '../drizzle/school-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, ilike, or, sql } from 'drizzle-orm'
import { err, ok, ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { grades, series } from '../drizzle/core-schema'
import { classes, classrooms } from '../drizzle/school-schema'
import { DatabaseError } from '../errors'

// ... (Types remain same)

export interface ClassroomFilters {
  schoolId: string
  type?: ClassroomType
  status?: ClassroomStatus
  search?: string
}

export type ClassroomWithDetails = typeof classrooms.$inferSelect & {
  assignedClassesCount: number
}

export interface AssignedClassInfo {
  id: string
  section: string
  gradeName: string
  seriesName: string | null
}

export function getClassrooms(filters: ClassroomFilters): ResultAsync<ClassroomWithDetails[], DatabaseError> {
  const db = getDb()
  const conditions = [eq(classrooms.schoolId, filters.schoolId)]

  if (filters.type) {
    conditions.push(eq(classrooms.type, filters.type))
  }

  if (filters.status) {
    conditions.push(eq(classrooms.status, filters.status))
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(classrooms.name, `%${filters.search}%`),
        ilike(classrooms.code, `%${filters.search}%`),
      )!,
    )
  }

  return ResultAsync.fromPromise(
    db
      .select({
        classroom: classrooms,
        assignedClassesCount: sql<number>`COUNT(DISTINCT ${classes.id})`.as('assigned_classes_count'),
      })
      .from(classrooms)
      .leftJoin(classes, eq(classes.classroomId, classrooms.id))
      .where(and(...conditions))
      .groupBy(classrooms.id)
      .orderBy(classrooms.name),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to get classrooms'),
  )
    .map(results => results.map(r => ({
      ...r.classroom,
      assignedClassesCount: Number(r.assignedClassesCount),
    })))
    .mapErr(tapLogErr(databaseLogger, { ...filters }))
}

export function getClassroomById(id: string): ResultAsync<{ classroom: typeof classrooms.$inferSelect, assignedClasses: AssignedClassInfo[] } | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select({
        classroom: classrooms,
        assignedClasses: sql<AssignedClassInfo[]>`
            COALESCE(
              json_agg(
                json_build_object(
                  'id', ${classes.id},
                  'section', ${classes.section},
                  'gradeName', ${grades.name},
                  'seriesName', ${series.name}
                )
              ) FILTER (WHERE ${classes.id} IS NOT NULL),
              '[]'
            )
          `.as('assigned_classes'),
      })
      .from(classrooms)
      .leftJoin(classes, eq(classes.classroomId, classrooms.id))
      .leftJoin(grades, eq(classes.gradeId, grades.id))
      .leftJoin(series, eq(classes.seriesId, series.id))
      .where(eq(classrooms.id, id))
      .groupBy(classrooms.id)
      .limit(1),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to get classroom by id'),
  )
    .map((results) => {
      if (!results[0])
        return null
      return {
        classroom: results[0].classroom,
        assignedClasses: results[0].assignedClasses,
      }
    })
    .mapErr(tapLogErr(databaseLogger, { id }))
}

export function createClassroom(data: ClassroomInsert): ResultAsync<typeof classrooms.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.insert(classrooms).values(data).returning(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to create classroom'),
  )
    .andThen((rows) => {
      if (!rows[0])
        return err(new DatabaseError('INTERNAL_ERROR', 'Failed to create classroom'))
      return ok(rows[0])
    })
    .mapErr(tapLogErr(databaseLogger, data))
}

export function updateClassroom(id: string, data: Partial<ClassroomInsert>): ResultAsync<typeof classrooms.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .update(classrooms)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(classrooms.id, id))
      .returning(),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to update classroom'),
  )
    .andThen((rows) => {
      if (!rows[0])
        return err(new DatabaseError('NOT_FOUND', `Classroom with id ${id} not found`))
      return ok(rows[0])
    })
    .mapErr(tapLogErr(databaseLogger, { id, ...data }))
}

export function deleteClassroom(id: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(classes)
      .where(and(eq(classes.classroomId, id), eq(classes.status, 'active')))
      .limit(1),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to check classroom usage'),
  )
    .andThen((assignedClasses) => {
      if (assignedClasses.length > 0) {
        return err(new DatabaseError('CONFLICT', 'Cannot delete classroom assigned to active classes'))
      }
      return ResultAsync.fromPromise(
        (async () => {
          await db.delete(classrooms).where(eq(classrooms.id, id))
        })(),
        e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to delete classroom'),
      )
    })
    .mapErr(tapLogErr(databaseLogger, { id }))
}

export function checkClassroomAvailability(
  classroomId: string,
  schoolYearId: string,
): ResultAsync<{ available: boolean, assignedTo?: string }, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select({
        classId: classes.id,
        className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
      })
      .from(classes)
      .innerJoin(grades, eq(classes.gradeId, grades.id))
      .where(and(eq(classes.classroomId, classroomId), eq(classes.schoolYearId, schoolYearId), eq(classes.status, 'active')))
      .limit(1),
    e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to check classroom availability'),
  )
    .map((results) => {
      if (results[0]) {
        return { available: false, assignedTo: results[0].className }
      }
      return { available: true }
    })
    .mapErr(tapLogErr(databaseLogger, { classroomId, schoolYearId }))
}
