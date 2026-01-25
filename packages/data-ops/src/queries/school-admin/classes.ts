import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '../../database/setup'
import { grades, series } from '../../drizzle/core-schema'
import { classes, classrooms, teachers } from '../../drizzle/school-schema'
import { PAGINATION, SCHOOL_ERRORS } from './constants'

export async function getClassesBySchoolYear(schoolYearId: string, schoolId: string, options?: {
  gradeId?: string
  seriesId?: string
  limit?: number
  offset?: number
}) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const limit = Math.min(options?.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT)
  const offset = options?.offset || 0

  const conditions = [
    eq(classes.schoolId, schoolId),
    eq(classes.schoolYearId, schoolYearId),
  ]

  if (options?.gradeId) {
    conditions.push(eq(classes.gradeId, options.gradeId))
  }

  if (options?.seriesId) {
    conditions.push(eq(classes.seriesId, options.seriesId))
  }

  const db = getDb()

  return db
    .select({
      id: classes.id,
      schoolId: classes.schoolId,
      schoolYearId: classes.schoolYearId,
      gradeId: classes.gradeId,
      seriesId: classes.seriesId,
      section: classes.section,
      classroomId: classes.classroomId,
      homeroomTeacherId: classes.homeroomTeacherId,
      createdAt: classes.createdAt,
      grade: {
        id: grades.id,
        name: grades.name,
        code: grades.code,
      },
      series: {
        id: series.id,
        name: series.name,
        code: series.code,
      },
      classroom: {
        id: classrooms.id,
        name: classrooms.name,
        code: classrooms.code,
      },
      homeroomTeacher: {
        id: teachers.id,
        userId: teachers.userId,
      },
    })
    .from(classes)
    .leftJoin(grades, eq(classes.gradeId, grades.id))
    .leftJoin(series, eq(classes.seriesId, series.id))
    .leftJoin(classrooms, eq(classes.classroomId, classrooms.id))
    .leftJoin(teachers, eq(classes.homeroomTeacherId, teachers.id))
    .where(and(...conditions))
    .orderBy(desc(classes.createdAt))
    .limit(limit)
    .offset(offset)
}

export async function getClassById(classId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const result = await db
    .select()
    .from(classes)
    .where(and(
      eq(classes.id, classId),
      eq(classes.schoolId, schoolId),
    ))
    .limit(1)

  return result[0] || null
}

export async function createClass(data: {
  schoolId: string
  schoolYearId: string
  gradeId: string
  seriesId?: string
  section: string
  classroomId?: string
  homeroomTeacherId?: string
}) {
  if (!data.schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const [newClass] = await db.insert(classes).values({
    id: crypto.randomUUID(),
    schoolId: data.schoolId,
    schoolYearId: data.schoolYearId,
    gradeId: data.gradeId,
    seriesId: data.seriesId,
    section: data.section,
    classroomId: data.classroomId,
    homeroomTeacherId: data.homeroomTeacherId,
  }).returning()

  return newClass
}

export async function updateClass(classId: string, schoolId: string, data: {
  section?: string
  classroomId?: string
  homeroomTeacherId?: string
}) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  // Verify class belongs to school
  const classInfo = await getClassById(classId, schoolId)
  if (!classInfo) {
    throw new Error(SCHOOL_ERRORS.CLASS_NOT_FOUND)
  }

  const db = getDb()

  const [updated] = await db
    .update(classes)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(classes.id, classId))
    .returning()

  return updated
}

export async function deleteClass(classId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  // Verify class belongs to school
  const classInfo = await getClassById(classId, schoolId)
  if (!classInfo) {
    throw new Error(SCHOOL_ERRORS.CLASS_NOT_FOUND)
  }

  const db = getDb()

  // Hard delete (cascade will handle enrollments)
  await db.delete(classes).where(eq(classes.id, classId))

  return { success: true }
}
