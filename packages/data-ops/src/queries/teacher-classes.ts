/**
 * Class Management Queries
 * Handles class CRUD operations and student enrollment
 */
import { and, asc, desc, eq, gte, lte, sql, inArray } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { getDb } from '../database/setup'
import { grades, subjects } from '../drizzle/core-schema'
import {
  classes,
  classSubjects,
  enrollments,
  schools,
  students,
  teachers,
  users,
} from '../drizzle/school-schema'

export interface ClassInfo {
  id: string
  name: string
  gradeId: number | null
  gradeName: string | null
  section: string | null
  schoolId: string | null
  schoolName: string | null
  studentCount: number
  subjectCount: number
  createdAt: Date | null
  updatedAt: Date | null
}

export interface ClassStudentInfo {
  studentId: string
  firstName: string
  lastName: string
  matricule: string | null
  photoUrl: string | null
  email: string | null
  enrollmentDate: Date
  status: string
}

// Get all classes for a teacher
export async function getTeacherClasses(params: {
  teacherId: string
  schoolYearId: string
  schoolId?: string
  includeInactive?: boolean
}) {
  const db = getDb()

  const conditions = [
    eq(classSubjects.teacherId, params.teacherId),
    eq(classes.schoolYearId, params.schoolYearId),
    eq(classes.status, 'active'),
  ]

  if (params.schoolId) {
    conditions.push(eq(classes.schoolId, params.schoolId))
  }

  if (!params.includeInactive) {
    conditions.push(eq(classes.status, 'active'))
  }

  const results = await db
    .select({
      id: classes.id,
      name: classes.name,
      gradeId: classes.gradeId,
      gradeName: grades.name,
      section: classes.section,
      schoolId: classes.schoolId,
      schoolName: schools.name,
      createdAt: classes.createdAt,
      updatedAt: classes.updatedAt,
    })
    .from(classSubjects)
    .innerJoin(classes, eq(classSubjects.classId, classes.id))
    .leftJoin(grades, eq(classes.gradeId, grades.id))
    .leftJoin(schools, eq(classes.schoolId, schools.id))
    .where(and(...conditions))
    .orderBy(asc(classes.name))
    .groupBy(classes.id)

  // Get student counts for each class
  const classIds = results.map((c) => c.id)
  const studentCounts = await db
    .select({
      classId: enrollments.classId,
      count: sql<number>`count(distinct ${enrollments.studentId})::int`,
    })
    .from(enrollments)
    .where(
      and(
        inArray(enrollments.classId, classIds),
        eq(enrollments.status, 'confirmed'),
        eq(enrollments.schoolYearId, params.schoolYearId)
      )
    )
    .groupBy(enrollments.classId)

  const countMap = new Map(studentCounts.map((c) => [c.classId, c.count]))

  return results.map((c) => ({
    ...c,
    studentCount: countMap.get(c.id) ?? 0,
  }))
}

// Get class details with students
export async function getClassDetails(params: {
  classId: string
  schoolYearId: string
}) {
  const db = getDb()

  const [classInfo] = await db
    .select({
      id: classes.id,
      name: classes.name,
      gradeId: classes.gradeId,
      gradeName: grades.name,
      section: classes.section,
      schoolId: classes.schoolId,
      schoolName: schools.name,
      createdAt: classes.createdAt,
      updatedAt: classes.updatedAt,
    })
    .from(classes)
    .leftJoin(grades, eq(classes.gradeId, grades.id))
    .leftJoin(schools, eq(classes.schoolId, schools.id))
    .where(eq(classes.id, params.classId))
    .limit(1)

  if (!classInfo) {
    return null
  }

  // Get enrolled students
  const studentsResult = await db
    .select({
      studentId: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      matricule: students.matricule,
      photoUrl: students.photoUrl,
      email: users.email,
      enrollmentDate: enrollments.enrollmentDate,
      status: enrollments.status,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .leftJoin(users, eq(students.userId, users.id))
    .where(
      and(
        eq(enrollments.classId, params.classId),
        eq(enrollments.schoolYearId, params.schoolYearId),
        eq(enrollments.status, 'confirmed')
      )
    )
    .orderBy(asc(students.lastName), asc(students.firstName))

  // Get subjects
  const subjectsResult = await db
    .select({
      id: subjects.id,
      name: subjects.name,
      shortName: subjects.shortName,
    })
    .from(classSubjects)
    .innerJoin(subjects, eq(classSubjects.subjectId, subjects.id))
    .where(eq(classSubjects.classId, params.classId))

  return {
    ...classInfo,
    students: studentsResult,
    subjects: subjectsResult,
    studentCount: studentsResult.length,
    subjectCount: subjectsResult.length,
  }
}

// Get students for a class (roster)
export async function getClassStudents(params: {
  classId: string
  schoolYearId: string
  searchQuery?: string
}) {
  const db = getDb()

  const conditions = [
    eq(enrollments.classId, params.classId),
    eq(enrollments.schoolYearId, params.schoolYearId),
    eq(enrollments.status, 'confirmed'),
  ]

  if (params.searchQuery) {
    conditions.push(
      sql`(${students.firstName} ILIKE ${`%${params.searchQuery}%`}) OR (${students.lastName} ILIKE ${`%${params.searchQuery}%`}) OR (${students.matricule} ILIKE ${`%${params.searchQuery}%`})`
    )
  }

  const results = await db
    .select({
      studentId: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      matricule: students.matricule,
      photoUrl: students.photoUrl,
      email: users.email,
      enrollmentDate: enrollments.enrollmentDate,
      status: enrollments.status,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .leftJoin(users, eq(students.userId, users.id))
    .where(and(...conditions))
    .orderBy(asc(students.lastName), asc(students.firstName))

  return results
}

// Add student to class
export async function addStudentToClass(params: {
  studentId: string
  classId: string
  schoolYearId: string
}) {
  const db = getDb()

  const [enrollment] = await db
    .insert(enrollments)
    .values({
      id: nanoid(),
      studentId: params.studentId,
      classId: params.classId,
      schoolYearId: params.schoolYearId,
      status: 'confirmed',
      enrollmentDate: new Date(),
    })
    .returning()

  return enrollment
}

// Remove student from class
export async function removeStudentFromClass(params: {
  studentId: string
  classId: string
  schoolYearId: string
}) {
  const db = getDb()

  await db
    .update(enrollments)
    .set({
      status: 'withdrawn',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(enrollments.studentId, params.studentId),
        eq(enrollments.classId, params.classId),
        eq(enrollments.schoolYearId, params.schoolYearId)
      )
    )
}

// Get class statistics
export async function getClassStats(params: {
  classId: string
  schoolYearId: string
}) {
  const db = getDb()

  const [stats] = await db
    .select({
      totalStudents: sql<number>`count(distinct ${enrollments.studentId})::int`,
      activeEnrollments: sql<number>`count(case when ${enrollments.status} = 'confirmed' then 1 end)::int`,
      totalSubjects: sql<number>`count(distinct ${classSubjects.subjectId})::int`,
    })
    .from(enrollments)
    .leftJoin(classSubjects, eq(classSubjects.classId, enrollments.classId))
    .where(
      and(
        eq(enrollments.classId, params.classId),
        eq(enrollments.schoolYearId, params.schoolYearId)
      )
    )

  return {
    totalStudents: Number(stats.totalStudents) ?? 0,
    activeEnrollments: Number(stats.activeEnrollments) ?? 0,
    totalSubjects: Number(stats.totalSubjects) ?? 0,
  }
}
