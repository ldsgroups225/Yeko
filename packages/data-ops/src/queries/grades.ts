import type {
  GradeStatus,
  GradeType,
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
import { ResultAsync } from 'neverthrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { DatabaseError, dbError } from '../errors'
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

export function getGradesByClass(params: {
  schoolId: string
  classId: string
  subjectId: string
  termId: string
  teacherId?: string
}) {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      // Verify class belongs to school
      const classExists = await db.query.classes.findFirst({
        where: and(eq(classes.id, params.classId), eq(classes.schoolId, params.schoolId)),
        columns: { id: true },
      })
      if (!classExists) {
        throw new DatabaseError('PERMISSION_DENIED', 'Class does not belong to this school')
      }

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
    })(),
    (e) => DatabaseError.from(e),
  ).mapErr(tapLogErr(databaseLogger, { ...params, action: 'Getting grades by class' }))
}

export function getPendingValidations(params: {
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

  return ResultAsync.fromPromise(
    db.select({
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
      .orderBy(desc(sql`min(${studentGrades.submittedAt})`)),
    (e) => DatabaseError.from(e),
  ).mapErr(tapLogErr(databaseLogger, { ...params, action: 'Getting pending validations' }))
}

export function getClassGradeStatistics(params: {
  schoolId: string
  classId: string
  termId: string
  subjectId?: string
}) {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.select({
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
      .innerJoin(classes, eq(studentGrades.classId, classes.id)) 
      .innerJoin(subjects, eq(studentGrades.subjectId, subjects.id))
      .where(and(
        eq(studentGrades.classId, params.classId),
        eq(classes.schoolId, params.schoolId),
        eq(studentGrades.termId, params.termId),
        eq(studentGrades.status, 'validated'),
        params.subjectId ? eq(studentGrades.subjectId, params.subjectId) : undefined,
      ))
      .groupBy(studentGrades.subjectId, subjects.name, studentGrades.type),
    (e) => DatabaseError.from(e),
  ).mapErr(tapLogErr(databaseLogger, { ...params, action: 'Getting class grade statistics' }))
}

export function createStudentGrade(schoolId: string, data: StudentGradeInsert) {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      // Validation: Class must belong to school
      const classExists = await db.query.classes.findFirst({
        where: and(eq(classes.id, data.classId), eq(classes.schoolId, schoolId)),
        columns: { id: true },
      })
      if (!classExists) {
        throw new DatabaseError('PERMISSION_DENIED', 'Class does not belong to this school')
      }

      const [grade] = await db.insert(studentGrades).values(data).returning()
      return grade
    })(),
    (e) => DatabaseError.from(e),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, data, action: 'Creating student grade' }))
}

export function updateStudentGrade(schoolId: string, id: string, data: Partial<StudentGradeInsert>) {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      // Verify grade belongs to school (via class)
      const [grade] = await db.select({ id: studentGrades.id })
        .from(studentGrades)
        .innerJoin(classes, eq(studentGrades.classId, classes.id))
        .where(and(eq(studentGrades.id, id), eq(classes.schoolId, schoolId)))
        .limit(1)

      if (!grade) {
        throw new DatabaseError('NOT_FOUND', 'Grade not found or access denied')
      }

      const [updated] = await db.update(studentGrades)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(studentGrades.id, id))
        .returning()
      return updated
    })(),
    (e) => DatabaseError.from(e),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, id, data, action: 'Updating student grade' }))
}

export function getStudentGradeById(schoolId: string, id: string) {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      // First verify access via standard query properties if possible, but Drizzle query API is limited for deep filtering.
      // So fetching it and then checking is easier, but slightly less efficient.
      // OR use findFirst and check result manually.
      const grade = await db.query.studentGrades.findFirst({
        where: eq(studentGrades.id, id),
        with: {
          student: true,
          validations: {
            orderBy: desc(gradeValidations.createdAt),
          },
          class: { // Fetch class to check schoolId
            columns: { schoolId: true },
          },
        },
      })
      
      // Since studentGrades->class relation is likely defined but Typescript might complain if not defined in schema imports above.
      // Assuming 'class' relation exists on studentGrades (it has class_id).
      // If not, we fall back to manual check or 2 queries.
      // Let's check relation definitions in schema file first?
      // Based on schema `studentGrades` has `classId` but I didn't see explicit relations definition for `studentGrades` in the shown snippet of `school-schema.ts`.
      // Wait, I saw `studentGrades` table definition but I missed `studentGradesRelations`?
      // Ah, I saw `gradeValidations` and `studentGrades` table defs, but I probably missed relations at the bottom.
      // Assuming relation exists. If not, I'll error.
      // Better: Use `getGradesByClass` approach or manual verification.
      
      if (!grade) return undefined
      
      // Manual verification of schoolId logic if relation isn't easily accessible or trusted 
      // (Actually, if I fetch `class` relation, I can check properties. But type safety relies on Drizzle types).
      
      // Let's do a separate check for safety and type simplicity if relation isn't clear from snippet.
      // Better: join check.
      
       const [check] = await db.select({ id: studentGrades.id })
        .from(studentGrades)
        .innerJoin(classes, eq(studentGrades.classId, classes.id))
        .where(and(eq(studentGrades.id, id), eq(classes.schoolId, schoolId)))
        .limit(1)
        
       if (!check) return undefined // Not found or no access

       return grade
    })(),
    (e) => DatabaseError.from(e),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, id, action: 'Getting student grade by ID' }))
}

export function updateGradesStatus(schoolId: string, gradeIds: string[], status: GradeStatus, userId?: string, reason?: string) {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const now = new Date()

      // Convert to values object based on status
      const updates: {
        status: GradeStatus
        updatedAt: Date
        submittedAt?: Date
        validatedAt?: Date
        validatedBy?: string
        rejectionReason?: string
      } = { status, updatedAt: now }

      if (status === 'submitted')
        updates.submittedAt = now
      if (status === 'validated') {
        updates.validatedAt = now
        updates.validatedBy = userId
      }
      if (status === 'rejected')
        updates.rejectionReason = reason

      // Ensure we only update grades belonging to the school
      // Subquery or join logic:
      // UPDATE student_grades SET ... WHERE id IN (...) AND class_id IN (SELECT id FROM classes WHERE school_id = ...)
      
      return db.update(studentGrades)
        .set(updates)
        .where(and(
          inArray(studentGrades.id, gradeIds),
          inArray(
            studentGrades.classId,
            db.select({ id: classes.id }).from(classes).where(eq(classes.schoolId, schoolId))
          )
        ))
        .returning()
    })(),
    (e) => DatabaseError.from(e),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, gradeIds, status, action: 'Updating grades status' }))
}

export function deleteDraftGrades(params: {
  schoolId: string
  classId: string
  subjectId: string
  termId: string
  type: GradeType
  gradeDate: string
  description?: string
}) {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      // Verify class belongs to school
      const classValid = await db.query.classes.findFirst({
        where: and(eq(classes.id, params.classId), eq(classes.schoolId, params.schoolId)),
        columns: { id: true },
      })
      if (!classValid) {
        throw new DatabaseError('PERMISSION_DENIED', 'Class does not belong to this school')
      }

      const conditions = [
        eq(studentGrades.classId, params.classId),
        eq(studentGrades.subjectId, params.subjectId),
        eq(studentGrades.termId, params.termId),
        eq(studentGrades.type, params.type),
        eq(studentGrades.gradeDate, params.gradeDate),
        eq(studentGrades.status, 'draft'),
      ]

      if (params.description) {
        conditions.push(eq(studentGrades.description, params.description))
      }

      const deleted = await db.delete(studentGrades)
        .where(and(...conditions))
        .returning()

      return deleted
    })(),
    (e) => DatabaseError.from(e),
  ).mapErr(tapLogErr(databaseLogger, { ...params, action: 'Deleting draft grades' }))
}

export function getGradeValidationHistory(gradeId: string) {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.query.gradeValidations.findMany({
      where: eq(gradeValidations.gradeId, gradeId),
      with: {
        validator: {
          columns: { id: true, name: true },
        },
      },
      orderBy: [desc(gradeValidations.createdAt)],
    }),
    (e) => DatabaseError.from(e),
  ).mapErr(tapLogErr(databaseLogger, { gradeId, action: 'Getting grade validation history' }))
}

export function getSubmittedGradeIds(params: {
  schoolId: string
  classId: string
  subjectId: string
  termId: string
}) {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      // Verify class/school scope implicitly via join or explicit check.
      // Explicit check is safer.
      const classValid = await db.query.classes.findFirst({
        where: and(eq(classes.id, params.classId), eq(classes.schoolId, params.schoolId)),
        columns: { id: true },
      })
      if (!classValid) {
        throw new DatabaseError('PERMISSION_DENIED', 'Class does not belong to this school')
      }

      const results = await db.select({ id: studentGrades.id })
        .from(studentGrades)
        .where(and(
          eq(studentGrades.classId, params.classId),
          eq(studentGrades.subjectId, params.subjectId),
          eq(studentGrades.termId, params.termId),
          eq(studentGrades.status, 'submitted'),
        ))

      return results.map((r: { id: string }) => r.id)
    })(),
    (e) => DatabaseError.from(e),
  ).mapErr(tapLogErr(databaseLogger, { ...params, action: 'Getting submitted grade IDs' }))
}
