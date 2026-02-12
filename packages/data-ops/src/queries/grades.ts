import type {
  GradeStatus,
  GradeType,
  StudentGradeInsert,
} from '../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
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
import { DatabaseError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

export async function getGradesByClass(params: {
  schoolId: string
  classId: string
  subjectId: string
  termId: string
  teacherId?: string
}): R.ResultAsync<any[], DatabaseError> { // Using any[] here as type wasn't explicitly provided but keeping existing logic
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        // Verify class belongs to school
        const classExists = await db.query.classes.findFirst({
          where: and(eq(classes.id, params.classId), eq(classes.schoolId, params.schoolId)),
          columns: { id: true },
        })
        if (!classExists) {
          throw new DatabaseError('PERMISSION_DENIED', getNestedErrorMessage('auth', 'noSchoolContext'))
        }

        return await db.query.studentGrades.findMany({
          where: and(
            eq(studentGrades.classId, params.classId),
            eq(studentGrades.subjectId, params.subjectId),
            eq(studentGrades.termId, params.termId),
            params.teacherId ? eq(studentGrades.teacherId, params.teacherId) : undefined,
          ),
          columns: {
            id: true,
            value: true,
            type: true,
            gradeDate: true,
            studentId: true,
            status: true,
          },
          with: {
            student: {
              columns: { id: true, firstName: true, lastName: true, matricule: true },
            },
          },
          orderBy: [asc(studentGrades.gradeDate)],
        })
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { ...params, action: 'Getting grades by class' })),
  )
}

export interface PendingValidation {
  classId: string
  className: string
  gradeName: string
  subjectId: string
  subjectName: string
  termId: string
  teacherId: string | null
  teacherName: string
  pendingCount: number
  submittedAt: Date | null
  average: number
  maxGrade: number
  coefficient: number
}

export async function getPendingValidations(params: {
  schoolId: string
  termId?: string
  classId?: string
  subjectId?: string
}): R.ResultAsync<PendingValidation[], DatabaseError> {
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

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        return await db.select({
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
          average: sql<number>`round(avg(${studentGrades.value}), 2)`,
          maxGrade: sql<number>`20`,
          coefficient: sql<number>`1`,
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
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { ...params, action: 'Getting pending validations' })),
  )
}

export async function getClassGradeStatistics(params: {
  schoolId: string
  classId: string
  termId: string
  subjectId?: string
}): R.ResultAsync<any[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        return await db.select({
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
          .groupBy(studentGrades.subjectId, subjects.name, studentGrades.type)
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { ...params, action: 'Getting class grade statistics' })),
  )
}

export async function createStudentGrade(schoolId: string, data: StudentGradeInsert): R.ResultAsync<typeof studentGrades.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        // Validation: Class must belong to school
        const classExists = await db.query.classes.findFirst({
          where: and(eq(classes.id, data.classId), eq(classes.schoolId, schoolId)),
          columns: { id: true },
        })
        if (!classExists) {
          throw new DatabaseError('PERMISSION_DENIED', getNestedErrorMessage('auth', 'noSchoolContext'))
        }

        const [grade] = await db.insert(studentGrades).values(data).returning()
        return grade!
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, data, action: 'Creating student grade' })),
  )
}

export async function updateStudentGrade(schoolId: string, id: string, data: Partial<StudentGradeInsert>): R.ResultAsync<typeof studentGrades.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        // Verify grade belongs to school (via class)
        const [grade] = await db.select({ id: studentGrades.id })
          .from(studentGrades)
          .innerJoin(classes, eq(studentGrades.classId, classes.id))
          .where(and(eq(studentGrades.id, id), eq(classes.schoolId, schoolId)))
          .limit(1)

        if (!grade) {
          throw new DatabaseError('NOT_FOUND', getNestedErrorMessage('grades', 'notFound'))
        }

        const [updated] = await db.update(studentGrades)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(studentGrades.id, id))
          .returning()
        return updated!
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, id, data, action: 'Updating student grade' })),
  )
}

export async function getStudentGradeById(schoolId: string, id: string): R.ResultAsync<any, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
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

        if (!grade)
          return undefined

        const [check] = await db.select({ id: studentGrades.id })
          .from(studentGrades)
          .innerJoin(classes, eq(studentGrades.classId, classes.id))
          .where(and(eq(studentGrades.id, id), eq(classes.schoolId, schoolId)))
          .limit(1)

        if (!check)
          return undefined // Not found or no access

        return grade
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, id, action: 'Getting student grade by ID' })),
  )
}

export async function updateGradesStatus(schoolId: string, gradeIds: string[], status: GradeStatus, userId?: string, reason?: string): R.ResultAsync<typeof studentGrades.$inferSelect[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const now = new Date()

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

        return await db.update(studentGrades)
          .set(updates)
          .where(and(
            inArray(studentGrades.id, gradeIds),
            inArray(
              studentGrades.classId,
              db.select({ id: classes.id }).from(classes).where(eq(classes.schoolId, schoolId)),
            ),
          ))
          .returning()
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, gradeIds, status, action: 'Updating grades status' })),
  )
}

export async function deleteDraftGrades(params: {
  schoolId: string
  classId: string
  subjectId: string
  termId: string
  type: GradeType
  gradeDate: string
  description?: string
}): R.ResultAsync<typeof studentGrades.$inferSelect[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        // Verify class belongs to school
        const classValid = await db.query.classes.findFirst({
          where: and(eq(classes.id, params.classId), eq(classes.schoolId, params.schoolId)),
          columns: { id: true },
        })
        if (!classValid) {
          throw new DatabaseError('PERMISSION_DENIED', getNestedErrorMessage('auth', 'noSchoolContext'))
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

        return await db.delete(studentGrades)
          .where(and(...conditions))
          .returning()
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { ...params, action: 'Deleting draft grades' })),
  )
}

export async function getGradeValidationHistory(gradeId: string): R.ResultAsync<any[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        return await db.query.gradeValidations.findMany({
          where: eq(gradeValidations.gradeId, gradeId),
          with: {
            validator: {
              columns: { id: true, name: true },
            },
          },
          orderBy: [desc(gradeValidations.createdAt)],
        })
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { gradeId, action: 'Getting grade validation history' })),
  )
}

export async function getSubmittedGradeIds(params: {
  schoolId: string
  classId: string
  subjectId: string
  termId: string
}): R.ResultAsync<string[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const classValid = await db.query.classes.findFirst({
          where: and(eq(classes.id, params.classId), eq(classes.schoolId, params.schoolId)),
          columns: { id: true },
        })
        if (!classValid) {
          throw new DatabaseError('PERMISSION_DENIED', getNestedErrorMessage('auth', 'noSchoolContext'))
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
      },
      catch: e => DatabaseError.from(e),
    }),
    R.mapError(tapLogErr(databaseLogger, { ...params, action: 'Getting submitted grade IDs' })),
  )
}
