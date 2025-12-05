import { getDb } from '../database/setup'
import {
  classes,
  classrooms,
  teachers,
  users,
  classSubjects,
  enrollments,
  students,
  type ClassInsert,
} from '../drizzle/school-schema'
import { grades, series } from '../drizzle/core-schema'
import { eq, and, sql, ilike } from 'drizzle-orm'
import { checkClassroomAvailability } from './classrooms'

export interface ClassFilters {
  schoolId: string
  schoolYearId?: string
  gradeId?: string
  seriesId?: string
  status?: string
  search?: string
}

export async function getClasses(filters: ClassFilters) {
  const db = getDb()
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
    conditions.push(eq(classes.status, filters.status as any))
  }

  if (filters.search) {
    conditions.push(ilike(classes.section, `%${filters.search}%`))
  }

  return await db
    .select({
      class: classes,
      grade: grades,
      series: series,
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
      and(eq(enrollments.classId, classes.id), eq(enrollments.status, 'confirmed'))
    )
    .leftJoin(classSubjects, eq(classSubjects.classId, classes.id))
    .where(and(...conditions))
    .groupBy(classes.id, grades.id, series.id, classrooms.id, teachers.id, users.id)
    .orderBy(grades.order, classes.section)
}

export async function getClassById(id: string) {
  const db = getDb()
  const [classData] = await db
    .select({
      class: classes,
      grade: grades,
      series: series,
      classroom: classrooms,
      homeroomTeacher: {
        id: teachers.id,
        name: users.name,
        email: users.email,
      },
      studentsCount: sql<number>`COUNT(DISTINCT ${enrollments.id})`.as('students_count'),
      boysCount: sql<number>`COUNT(DISTINCT CASE WHEN ${students.gender} = 'M' THEN ${students.id} END)`.as(
        'boys_count'
      ),
      girlsCount: sql<number>`COUNT(DISTINCT CASE WHEN ${students.gender} = 'F' THEN ${students.id} END)`.as(
        'girls_count'
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
      and(eq(enrollments.classId, classes.id), eq(enrollments.status, 'confirmed'))
    )
    .leftJoin(students, eq(enrollments.studentId, students.id))
    .where(eq(classes.id, id))
    .groupBy(classes.id, grades.id, series.id, classrooms.id, teachers.id, users.id)

  return classData
}

export async function createClass(data: ClassInsert) {
  const db = getDb()
  // Validate unique constraint
  const existing = await db
    .select()
    .from(classes)
    .where(
      and(
        eq(classes.schoolYearId, data.schoolYearId),
        eq(classes.gradeId, data.gradeId),
        data.seriesId ? eq(classes.seriesId, data.seriesId) : sql`${classes.seriesId} IS NULL`,
        eq(classes.section, data.section)
      )
    )
    .limit(1)

  if (existing.length > 0) {
    throw new Error('Class with this grade, series, and section already exists for this school year')
  }

  // Validate classroom availability
  if (data.classroomId) {
    const availability = await checkClassroomAvailability(data.classroomId, data.schoolYearId)
    if (!availability.available) {
      throw new Error(`Classroom is already assigned to ${availability.assignedTo}`)
    }
  }

  const [newClass] = await db.insert(classes).values(data).returning()
  return newClass
}

export async function updateClass(id: string, data: Partial<ClassInsert>) {
  const db = getDb()
  const [updatedClass] = await db
    .update(classes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(classes.id, id))
    .returning()
  return updatedClass
}

export async function deleteClass(id: string) {
  const db = getDb()
  // Check if class has enrolled students
  const [enrollment] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.classId, id), eq(enrollments.status, 'confirmed')))
    .limit(1)

  if (enrollment) {
    throw new Error('Cannot delete class with enrolled students')
  }

  await db.delete(classes).where(eq(classes.id, id))
}
