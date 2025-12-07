import type {
  GradeStatus,
  StudentGradeInsert,
} from '../drizzle/school-schema'
import {
  and,
  asc,
  desc,
  eq,
  inArray,
  sql,
} from 'drizzle-orm'
import { getDb } from '../database/setup'
import {
  grades,
  subjects,
} from '../drizzle/core-schema'
import {
  classes,
  gradeValidations,
  studentGrades,
  teachers,
  users,
} from '../drizzle/school-schema'

export async function getGradesByClass(params: {
  classId: string
  subjectId: string
  termId: string
  teacherId?: string
}) {
  const db = getDb()
  return db.query.studentGrades.findMany({
    where: and(
      eq(studentGrades.classId, params.classId),
      eq(studentGrades.subjectId, params.subjectId),
      eq(studentGrades.termId, params.termId),
      params.teacherId ? eq(studentGrades.teacherId, params.teacherId) : undefined,
    ),
    with: {
      student: {
        columns: { id: true, firstName: true, lastName: true, matricule: true },
      },
    },
    orderBy: [asc(studentGrades.gradeDate)],
  })
}

export async function getPendingValidations(params: {
  schoolId: string
  termId?: string
  classId?: string
  subjectId?: string
}) {
  const db = getDb()

  const conditions = [
    eq(classes.schoolId, params.schoolId),
    eq(studentGrades.status, 'submitted'),
  ]

  if (params.termId)
    conditions.push(eq(studentGrades.termId, params.termId))
  if (params.classId)
    conditions.push(eq(studentGrades.classId, params.classId))
  if (params.subjectId)
    conditions.push(eq(studentGrades.subjectId, params.subjectId))

  return db.select({
    classId: studentGrades.classId,
    className: classes.section,
    gradeName: grades.name,
    subjectId: studentGrades.subjectId,
    subjectName: subjects.name,
    termId: studentGrades.termId,
    teacherId: studentGrades.teacherId,
    teacherName: users.name,
    pendingCount: sql<number>`count(*)`,
    submittedAt: sql<Date>`min(${studentGrades.submittedAt})`,
  })
    .from(studentGrades)
    .innerJoin(classes, eq(studentGrades.classId, classes.id))
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .innerJoin(subjects, eq(studentGrades.subjectId, subjects.id))
    .innerJoin(teachers, eq(studentGrades.teacherId, teachers.id))
    .innerJoin(users, eq(teachers.userId, users.id))
    .where(and(...conditions))
    .groupBy(
      studentGrades.classId,
      classes.section,
      grades.name,
      studentGrades.subjectId,
      subjects.name,
      studentGrades.termId,
      studentGrades.teacherId,
      users.name,
    )
    .orderBy(desc(sql`min(${studentGrades.submittedAt})`))
}

export async function getClassGradeStatistics(params: {
  classId: string
  termId: string
  subjectId?: string
}) {
  const db = getDb()
  return db.select({
    subjectId: studentGrades.subjectId,
    subjectName: subjects.name,
    gradeType: studentGrades.type,
    count: sql<number>`count(*)`,
    average: sql<number>`round(avg(${studentGrades.value}), 2)`,
    min: sql<number>`min(${studentGrades.value})`,
    max: sql<number>`max(${studentGrades.value})`,
    stdDev: sql<number>`round(stddev(${studentGrades.value}), 2)`,
    below10: sql<number>`count(*) filter (where ${studentGrades.value} < 10)`,
    above15: sql<number>`count(*) filter (where ${studentGrades.value} >= 15)`,
  })
    .from(studentGrades)
    .innerJoin(subjects, eq(studentGrades.subjectId, subjects.id))
    .where(and(
      eq(studentGrades.classId, params.classId),
      eq(studentGrades.termId, params.termId),
      eq(studentGrades.status, 'validated'),
      params.subjectId ? eq(studentGrades.subjectId, params.subjectId) : undefined,
    ))
    .groupBy(studentGrades.subjectId, subjects.name, studentGrades.type)
}

export async function createStudentGrade(data: StudentGradeInsert) {
  const db = getDb()
  const [grade] = await db.insert(studentGrades).values(data).returning()
  return grade
}

export async function updateStudentGrade(id: string, data: Partial<StudentGradeInsert>) {
  const db = getDb()
  const [updated] = await db.update(studentGrades)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(studentGrades.id, id))
    .returning()
  return updated
}

export async function getStudentGradeById(id: string) {
  const db = getDb()
  return db.query.studentGrades.findFirst({
    where: eq(studentGrades.id, id),
    with: {
      student: true,
      validations: {
        orderBy: desc(gradeValidations.createdAt),
      },
    },
  })
}

export async function updateGradesStatus(gradeIds: string[], status: GradeStatus, userId?: string, reason?: string) {
  const db = getDb()
  const now = new Date()

  // Convert to values object based on status
  const updates: any = { status, updatedAt: now }
  if (status === 'submitted')
    updates.submittedAt = now
  if (status === 'validated') {
    updates.validatedAt = now
    updates.validatedBy = userId
  }
  if (status === 'rejected')
    updates.rejectionReason = reason

  return db.update(studentGrades)
    .set(updates)
    .where(inArray(studentGrades.id, gradeIds))
    .returning()
}

export async function getGradeValidationHistory(gradeId: string) {
  const db = getDb()
  return db.query.gradeValidations.findMany({
    where: eq(gradeValidations.gradeId, gradeId),
    with: {
      validator: {
        columns: { id: true, name: true },
      },
    },
    orderBy: [desc(gradeValidations.createdAt)],
  })
}

export async function getSubmittedGradeIds(params: {
  classId: string
  subjectId: string
  termId: string
}) {
  const db = getDb()
  const results = await db.select({ id: studentGrades.id })
    .from(studentGrades)
    .where(and(
      eq(studentGrades.classId, params.classId),
      eq(studentGrades.subjectId, params.subjectId),
      eq(studentGrades.termId, params.termId),
      eq(studentGrades.status, 'submitted'),
    ))

  return results.map((r: { id: string }) => r.id)
}
