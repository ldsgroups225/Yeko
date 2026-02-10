import type { ClassroomInsert, ClassroomStatus, ClassroomType } from '../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, ilike, or, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { grades, series } from '../drizzle/core-schema'
import { classes, classrooms } from '../drizzle/school-schema'
import { DatabaseError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

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

export function getClassrooms(filters: ClassroomFilters): R.ResultAsync<ClassroomWithDetails[], DatabaseError> {
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

  return R.pipe(
    R.try({
      immediate: true,
      try: () =>
        db
          .select({
            classroom: classrooms,
            assignedClassesCount: sql<number>`COUNT(DISTINCT ${classes.id})`.as('assigned_classes_count'),
          })
          .from(classrooms)
          .leftJoin(classes, eq(classes.classroomId, classrooms.id))
          .where(and(...conditions))
          .groupBy(classrooms.id)
          .orderBy(classrooms.name)
          .then(results => results.map(r => ({
            ...r.classroom,
            assignedClassesCount: Number(r.assignedClassesCount),
          }))),
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to get classrooms'),
    }),
    R.mapError(tapLogErr(databaseLogger, { ...filters })),
  )
}

export async function getClassroomById(id: string): R.ResultAsync<{ classroom: typeof classrooms.$inferSelect, assignedClasses: AssignedClassInfo[] } | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: () =>
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
          .limit(1)
          .then((results) => {
            if (!results[0])
              return null
            return {
              classroom: results[0].classroom,
              assignedClasses: results[0].assignedClasses,
            }
          }),
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to get classroom by id'),
    }),
    R.mapError(tapLogErr(databaseLogger, { id })),
  )
}

export function createClassroom(data: ClassroomInsert): R.ResultAsync<typeof classrooms.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: () =>
        db.insert(classrooms).values(data).returning().then((rows) => {
          if (!rows[0])
            throw new Error(getNestedErrorMessage('classes', 'createFailed'))
          return rows[0]
        }),
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to create classroom'),
    }),
    R.mapError(tapLogErr(databaseLogger, data)),
  )
}

export function updateClassroom(id: string, data: Partial<ClassroomInsert>): R.ResultAsync<typeof classrooms.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: () =>
        db
          .update(classrooms)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(classrooms.id, id))
          .returning()
          .then((rows) => {
            if (!rows[0])
              throw new DatabaseError('NOT_FOUND', getNestedErrorMessage('classes', 'notFound'))
            return rows[0]
          }),
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to update classroom'),
    }),
    R.mapError(tapLogErr(databaseLogger, { id, ...data })),
  )
}

export async function deleteClassroom(id: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const assignedClasses = await db
          .select()
          .from(classes)
          .where(and(eq(classes.classroomId, id), eq(classes.status, 'active')))
          .limit(1)

        if (assignedClasses.length > 0) {
          throw new DatabaseError('CONFLICT', getNestedErrorMessage('classes', 'deleteFailed'))
        }

        await db.delete(classrooms).where(eq(classrooms.id, id))
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to delete classroom'),
    }),
    R.mapError(tapLogErr(databaseLogger, { id })),
  )
}

export async function checkClassroomAvailability(
  classroomId: string,
  schoolYearId: string,
): R.ResultAsync<{ available: boolean, assignedTo?: string }, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: () =>
        db
          .select({
            classId: classes.id,
            className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
          })
          .from(classes)
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .where(and(eq(classes.classroomId, classroomId), eq(classes.schoolYearId, schoolYearId), eq(classes.status, 'active')))
          .limit(1)
          .then((results) => {
            if (results[0]) {
              return { available: false, assignedTo: results[0].className }
            }
            return { available: true }
          }),
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to check classroom availability'),
    }),
    R.mapError(tapLogErr(databaseLogger, { classroomId, schoolYearId })),
  )
}
