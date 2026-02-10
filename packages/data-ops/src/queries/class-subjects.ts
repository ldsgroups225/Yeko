import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { grades, subjects } from '../drizzle/core-schema'
import {
  classes,
  classSubjects,
  teachers,
  teacherSubjects,
  users,
} from '../drizzle/school-schema'
import { DatabaseError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

export interface ClassSubjectFilters {
  classId?: string
  subjectId?: string
  teacherId?: string
  schoolId?: string
  schoolYearId?: string
}

export interface ClassSubjectWithDetails {
  classSubject: typeof classSubjects.$inferSelect
  class: typeof classes.$inferSelect
  subject: typeof subjects.$inferSelect
  teacher: {
    id: string
    name: string
  } | null
}

export async function getClassSubjects(filters: ClassSubjectFilters): R.ResultAsync<ClassSubjectWithDetails[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const conditions = []

        if (filters.classId) {
          conditions.push(eq(classSubjects.classId, filters.classId))
        }

        if (filters.subjectId) {
          conditions.push(eq(classSubjects.subjectId, filters.subjectId))
        }

        if (filters.teacherId) {
          conditions.push(eq(classSubjects.teacherId, filters.teacherId))
        }

        if (filters.schoolId) {
          conditions.push(eq(classes.schoolId, filters.schoolId))
        }

        if (filters.schoolYearId) {
          conditions.push(eq(classes.schoolYearId, filters.schoolYearId))
        }

        const results = await db
          .select({
            classSubject: classSubjects,
            class: classes,
            subject: subjects,
            teacherId: teachers.id,
            teacherName: users.name,
          })
          .from(classSubjects)
          .innerJoin(classes, eq(classSubjects.classId, classes.id))
          .innerJoin(subjects, eq(classSubjects.subjectId, subjects.id))
          .leftJoin(teachers, eq(classSubjects.teacherId, teachers.id))
          .leftJoin(users, eq(teachers.userId, users.id))
          .where(and(...conditions))
          .orderBy(subjects.name)

        return results.map(r => ({
          classSubject: r.classSubject,
          class: r.class,
          subject: r.subject,
          teacher: r.teacherId && r.teacherName
            ? {
                id: r.teacherId,
                name: r.teacherName,
              }
            : null,
        }))
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('classSubjects', 'fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { ...filters })),
  )
}

export interface AssignmentMatrixItem {
  classId: string
  className: string
  gradeOrder: number
  section: string
  subjectId: string | null
  subjectName: string | null
  teacherId: string | null
  teacherName: string | null
  coefficient: number | null
  hoursPerWeek: number | null
}

export async function getAssignmentMatrix(schoolId: string, schoolYearId: string): R.ResultAsync<AssignmentMatrixItem[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        return await db
          .select({
            classId: classes.id,
            className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
            gradeOrder: grades.order,
            section: classes.section,
            subjectId: subjects.id,
            subjectName: subjects.name,
            teacherId: teachers.id,
            teacherName: users.name,
            coefficient: classSubjects.coefficient,
            hoursPerWeek: classSubjects.hoursPerWeek,
          })
          .from(classes)
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .leftJoin(classSubjects, eq(classSubjects.classId, classes.id))
          .leftJoin(subjects, eq(classSubjects.subjectId, subjects.id))
          .leftJoin(teachers, eq(classSubjects.teacherId, teachers.id))
          .leftJoin(users, eq(teachers.userId, users.id))
          .where(and(eq(classes.schoolId, schoolId), eq(classes.schoolYearId, schoolYearId), eq(classes.status, 'active')))
          .orderBy(grades.order, classes.section, subjects.name)
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('classSubjects', 'fetchAssignmentMatrixFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, schoolYearId })),
  )
}

export async function assignTeacherToClassSubject(classId: string, subjectId: string, teacherId: string): R.ResultAsync<typeof classSubjects.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        // Validate teacher can teach this subject
        const [teacherSubject] = await db
          .select()
          .from(teacherSubjects)
          .where(and(eq(teacherSubjects.teacherId, teacherId), eq(teacherSubjects.subjectId, subjectId)))
          .limit(1)

        if (!teacherSubject) {
          throw new Error(getNestedErrorMessage('classSubjects', 'teacherNotQualified'))
        }

        // Check if assignment already exists
        const [existing] = await db
          .select()
          .from(classSubjects)
          .where(and(eq(classSubjects.classId, classId), eq(classSubjects.subjectId, subjectId)))
          .limit(1)

        if (existing) {
          // Update existing assignment
          const [updated] = await db
            .update(classSubjects)
            .set({ teacherId, updatedAt: new Date() })
            .where(eq(classSubjects.id, existing.id))
            .returning()
          if (!updated)
            throw new Error(getNestedErrorMessage('classSubjects', 'updateAssignmentFailed'))
          return updated
        }
        else {
          // Create new assignment
          const [created] = await db.insert(classSubjects).values({ id: crypto.randomUUID(), classId, subjectId, teacherId }).returning()
          if (!created)
            throw new Error(getNestedErrorMessage('classSubjects', 'createAssignmentFailed'))
          return created
        }
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('classSubjects', 'assignTeacherFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { classId, subjectId, teacherId })),
  )
}

export async function bulkAssignTeacher(
  assignments: Array<{ classId: string, subjectId: string, teacherId: string }>,
): R.ResultAsync<typeof classSubjects.$inferSelect[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const results = []

        for (const assignment of assignments) {
          // Validate teacher qualification
          const [teacherSubject] = await db
            .select()
            .from(teacherSubjects)
            .where(and(eq(teacherSubjects.teacherId, assignment.teacherId), eq(teacherSubjects.subjectId, assignment.subjectId)))
            .limit(1)

          if (!teacherSubject) {
            throw new Error(getNestedErrorMessage('classSubjects', 'teacherNotQualifiedWithId', { subjectId: assignment.subjectId }))
          }

          // Upsert assignment
          const [existing] = await db
            .select()
            .from(classSubjects)
            .where(and(eq(classSubjects.classId, assignment.classId), eq(classSubjects.subjectId, assignment.subjectId)))
            .limit(1)

          if (existing) {
            const [updated] = await db
              .update(classSubjects)
              .set({ teacherId: assignment.teacherId, updatedAt: new Date() })
              .where(eq(classSubjects.id, existing.id))
              .returning()
            if (updated)
              results.push(updated)
          }
          else {
            const [created] = await db.insert(classSubjects).values({ id: crypto.randomUUID(), ...assignment }).returning()
            if (created)
              results.push(created)
          }
        }

        return results
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('classSubjects', 'bulkAssignFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { assignmentsCount: assignments.length })),
  )
}

export async function removeTeacherFromClassSubject(classId: string, subjectId: string): R.ResultAsync<typeof classSubjects.$inferSelect | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [updated] = await db
          .update(classSubjects)
          .set({ teacherId: null, updatedAt: new Date() })
          .where(and(eq(classSubjects.classId, classId), eq(classSubjects.subjectId, subjectId)))
          .returning()
        return updated
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('classSubjects', 'removeTeacherFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { classId, subjectId })),
  )
}

export async function removeSubjectFromClass(classId: string, subjectId: string): R.ResultAsync<typeof classSubjects.$inferSelect | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [deleted] = await db
          .delete(classSubjects)
          .where(and(eq(classSubjects.classId, classId), eq(classSubjects.subjectId, subjectId)))
          .returning()
        return deleted
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('classSubjects', 'removeSubjectFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { classId, subjectId })),
  )
}

export async function detectTeacherConflicts(
  teacherId: string,
  schoolYearId: string,
): R.ResultAsync<Array<{ classId: string, className: string, subjectName: string, hoursPerWeek: number }>, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const assignments = await db
          .select({
            classId: classes.id,
            className: sql<string>`${grades.name} || ' ' || ${classes.section}`,
            subjectName: subjects.name,
            hoursPerWeek: classSubjects.hoursPerWeek,
          })
          .from(classSubjects)
          .innerJoin(classes, eq(classSubjects.classId, classes.id))
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .innerJoin(subjects, eq(classSubjects.subjectId, subjects.id))
          .where(
            and(
              eq(classSubjects.teacherId, teacherId),
              eq(classes.schoolYearId, schoolYearId),
              eq(classes.status, 'active'),
            ),
          )

        // Calculate total hours
        const totalHours = assignments.reduce((sum: number, a) => sum + (a.hoursPerWeek || 0), 0)

        // Flag if teacher has >30 hours/week (overloaded)
        if (totalHours > 30) {
          return assignments
        }

        return []
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('classSubjects', 'detectConflictsFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { teacherId, schoolYearId })),
  )
}

export async function addSubjectToClass(data: {
  classId: string
  subjectId: string
  teacherId?: string | null
  coefficient?: number
  hoursPerWeek?: number
}): R.ResultAsync<typeof classSubjects.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [created] = await db
          .insert(classSubjects)
          .values({
            id: crypto.randomUUID(),
            classId: data.classId,
            subjectId: data.subjectId,
            teacherId: data.teacherId || null,
            coefficient: data.coefficient || 1,
            hoursPerWeek: data.hoursPerWeek || 2,
          })
          .onConflictDoUpdate({
            target: [classSubjects.classId, classSubjects.subjectId],
            set: {
              teacherId: data.teacherId === undefined ? undefined : data.teacherId, // Undefined means don't touch
              coefficient: data.coefficient,
              hoursPerWeek: data.hoursPerWeek,
              status: 'active',
            },
          })
          .returning()
        if (!created)
          throw new Error(getNestedErrorMessage('classSubjects', 'addSubjectFailed'))
        return created
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('classSubjects', 'addSubjectFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, data)),
  )
}

export async function updateClassSubjectDetails(
  id: string,
  data: {
    coefficient?: number
    hoursPerWeek?: number
    status?: 'active' | 'inactive'
  },
): R.ResultAsync<typeof classSubjects.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [updated] = await db
          .update(classSubjects)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(classSubjects.id, id))
          .returning()
        if (!updated)
          throw new Error(getNestedErrorMessage('classSubjects', 'updateDetailsFailed'))
        return updated
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('classSubjects', 'updateDetailsFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { id, ...data })),
  )
}

export async function copyClassSubjects(
  sourceClassId: string,
  targetClassId: string,
  options: { overwrite?: boolean } = {},
): R.ResultAsync<typeof classSubjects.$inferSelect[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        // 1. Get source subjects
        const sourceSubjects = await db
          .select()
          .from(classSubjects)
          .where(eq(classSubjects.classId, sourceClassId))

        if (sourceSubjects.length === 0) {
          return []
        }

        const results = []

        // 2. Process each subject
        for (const subject of sourceSubjects) {
          // Check if target already has this subject
          const [existing] = await db
            .select()
            .from(classSubjects)
            .where(and(eq(classSubjects.classId, targetClassId), eq(classSubjects.subjectId, subject.subjectId)))
            .limit(1)

          if (existing) {
            if (options.overwrite) {
              const [updated] = await db
                .update(classSubjects)
                .set({
                  coefficient: subject.coefficient,
                  hoursPerWeek: subject.hoursPerWeek,
                  updatedAt: new Date(),
                })
                .where(eq(classSubjects.id, existing.id))
                .returning()
              if (updated)
                results.push(updated)
            }
          }
          else {
            // Create new assignment
            const [created] = await db
              .insert(classSubjects)
              .values({
                id: crypto.randomUUID(),
                classId: targetClassId,
                subjectId: subject.subjectId,
                teacherId: null, // Don't copy teacher assignment by default
                coefficient: subject.coefficient,
                hoursPerWeek: subject.hoursPerWeek,
                status: subject.status,
              })
              .returning()
            if (created)
              results.push(created)
          }
        }

        return results
      },
      catch: e => DatabaseError.from(e, 'INTERNAL_ERROR', getNestedErrorMessage('classSubjects', 'copyFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { sourceClassId, targetClassId, ...options })),
  )
}
