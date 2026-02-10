import type { ClassInsert, ClassStatus } from '../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, ilike, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { grades, series } from '../drizzle/core-schema'
import {
  classes,

  classrooms,
  classSubjects,
  enrollments,
  students,
  teachers,
  users,
} from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'
import { getNestedErrorMessage } from '../i18n'
import { checkClassroomAvailability } from './classrooms'

export type { ClassInsert, ClassStatus }

export interface ClassFilters {
  schoolId: string
  schoolYearId?: string
  gradeId?: string
  seriesId?: string
  status?: ClassStatus
  search?: string
}

export async function getClasses(filters: ClassFilters) {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const conditions = [eq(classes.schoolId, filters.schoolId)]

        if (filters.schoolYearId) {
          conditions.push(eq(classes.schoolYearId, filters.schoolYearId))
        }

        if (filters.gradeId) {
          conditions.push(eq(classes.gradeId, filters.gradeId))
        }

        if (filters.seriesId) {
          conditions.push(eq(classes.seriesId, filters.seriesId))
        }

        if (filters.status) {
          conditions.push(eq(classes.status, filters.status))
        }

        if (filters.search) {
          conditions.push(ilike(classes.section, `%${filters.search}%`))
        }

        return await db
          .select({
            class: classes,
            grade: grades,
            series,
            classroom: classrooms,
            homeroomTeacher: {
              id: teachers.id,
              name: users.name,
            },
            studentsCount: sql<number>`COUNT(DISTINCT ${enrollments.id})`.as('students_count'),
            subjectsCount: sql<number>`COUNT(DISTINCT ${classSubjects.id})`.as('subjects_count'),
          })
          .from(classes)
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .leftJoin(series, eq(classes.seriesId, series.id))
          .leftJoin(classrooms, eq(classes.classroomId, classrooms.id))
          .leftJoin(teachers, eq(classes.homeroomTeacherId, teachers.id))
          .leftJoin(users, eq(teachers.userId, users.id))
          .leftJoin(
            enrollments,
            and(eq(enrollments.classId, classes.id), eq(enrollments.status, 'confirmed')),
          )
          .leftJoin(classSubjects, eq(classSubjects.classId, classes.id))
          .where(and(...conditions))
          .groupBy(classes.id, grades.id, series.id, classrooms.id, teachers.id, users.id)
          .orderBy(grades.order, classes.section)
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { ...filters, action: 'Getting classes' })),
  )
}

export async function getClassById(schoolId: string, id: string) {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [classData] = await db
          .select({
            class: classes,
            grade: grades,
            series,
            classroom: classrooms,
            homeroomTeacher: {
              id: teachers.id,
              name: users.name,
              email: users.email,
            },
            studentsCount: sql<number>`COUNT(DISTINCT ${enrollments.id})`.as('students_count'),
            boysCount: sql<number>`COUNT(DISTINCT CASE WHEN ${students.gender} = 'M' THEN ${students.id} END)`.as(
              'boys_count',
            ),
            girlsCount: sql<number>`COUNT(DISTINCT CASE WHEN ${students.gender} = 'F' THEN ${students.id} END)`.as(
              'girls_count',
            ),
          })
          .from(classes)
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .leftJoin(series, eq(classes.seriesId, series.id))
          .leftJoin(classrooms, eq(classes.classroomId, classrooms.id))
          .leftJoin(teachers, eq(classes.homeroomTeacherId, teachers.id))
          .leftJoin(users, eq(teachers.userId, users.id))
          .leftJoin(
            enrollments,
            and(eq(enrollments.classId, classes.id), eq(enrollments.status, 'confirmed')),
          )
          .leftJoin(students, eq(enrollments.studentId, students.id))
          .where(and(eq(classes.id, id), eq(classes.schoolId, schoolId)))
          .groupBy(classes.id, grades.id, series.id, classrooms.id, teachers.id, users.id)

        if (!classData) {
          throw dbError('NOT_FOUND', getNestedErrorMessage('classes', 'notFound'))
        }

        return classData
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, id, action: 'Getting class by ID' })),
  )
}

export async function createClass(schoolId: string, data: ClassInsert) {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        if (data.schoolId !== schoolId) {
          throw dbError('PERMISSION_DENIED', getNestedErrorMessage('classes', 'differentSchool'))
        }

        // Validate unique constraint
        const existing = await db
          .select()
          .from(classes)
          .where(
            and(
              eq(classes.schoolYearId, data.schoolYearId),
              eq(classes.gradeId, data.gradeId),
              data.seriesId ? eq(classes.seriesId, data.seriesId) : sql`${classes.seriesId} IS NULL`,
              eq(classes.section, data.section),
              eq(classes.schoolId, schoolId),
            ),
          )
          .limit(1)

        if (existing.length > 0) {
          throw dbError('CONFLICT', getNestedErrorMessage('classes', 'alreadyExistsVerbose'))
        }

        // Validate classroom availability
        if (data.classroomId) {
          const availabilityResult = await checkClassroomAvailability(data.classroomId, data.schoolYearId)
          if (R.isFailure(availabilityResult)) {
            throw availabilityResult.error
          }
          const availability = availabilityResult.value
          if (!availability.available) {
            throw dbError('VALIDATION_ERROR', getNestedErrorMessage('classes', 'classroomConflict', { assignedTo: availability.assignedTo || '' }))
          }
        }

        const [newClass] = await db.insert(classes).values(data).returning()
        return newClass
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, data, action: 'Creating class' })),
  )
}

export async function updateClass(schoolId: string, id: string, data: Partial<ClassInsert>) {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        // Allow implicit security by adding schoolId to where clause
        const [updatedClass] = await db
          .update(classes)
          .set({ ...data, updatedAt: new Date() })
          .where(and(eq(classes.id, id), eq(classes.schoolId, schoolId)))
          .returning()

        if (!updatedClass) {
          throw dbError('NOT_FOUND', getNestedErrorMessage('classes', 'notFoundOrPermission'))
        }

        return updatedClass
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, id, data, action: 'Updating class' })),
  )
}

export async function deleteClass(schoolId: string, id: string) {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        // Check if class has enrolled students
        const [enrollment] = await db
          .select()
          .from(enrollments)
          .where(and(eq(enrollments.classId, id), eq(enrollments.status, 'confirmed')))
          .limit(1)

        if (enrollment) {
          throw dbError('VALIDATION_ERROR', getNestedErrorMessage('classes', 'notEmpty'))
        }

        const [deleted] = await db.delete(classes)
          .where(and(eq(classes.id, id), eq(classes.schoolId, schoolId)))
          .returning()

        if (!deleted) {
          throw dbError('NOT_FOUND', getNestedErrorMessage('classes', 'notFoundOrPermission'))
        }
        return deleted
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, id, action: 'Deleting class' })),
  )
}
