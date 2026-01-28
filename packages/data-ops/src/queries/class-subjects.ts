import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, sql } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
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

export function getClassSubjects(filters: ClassSubjectFilters): ResultAsync<ClassSubjectWithDetails[], DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise((async () => {
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
  })(), e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to fetch class subjects')).mapErr(tapLogErr(databaseLogger, { ...filters }))
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

export function getAssignmentMatrix(schoolId: string, schoolYearId: string): ResultAsync<AssignmentMatrixItem[], DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise((async () => {
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
  })(), e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to fetch assignment matrix')).mapErr(tapLogErr(databaseLogger, { schoolId, schoolYearId }))
}

export function assignTeacherToClassSubject(classId: string, subjectId: string, teacherId: string): ResultAsync<typeof classSubjects.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise((async () => {
    // Validate teacher can teach this subject
    const [teacherSubject] = await db
      .select()
      .from(teacherSubjects)
      .where(and(eq(teacherSubjects.teacherId, teacherId), eq(teacherSubjects.subjectId, subjectId)))
      .limit(1)

    if (!teacherSubject) {
      throw new Error('Teacher is not qualified to teach this subject')
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
        throw new Error('Failed to update assignment')
      return updated
    }
    else {
      // Create new assignment
      const [created] = await db.insert(classSubjects).values({ id: crypto.randomUUID(), classId, subjectId, teacherId }).returning()
      if (!created)
        throw new Error('Failed to create assignment')
      return created
    }
  })(), e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to assign teacher')).mapErr(tapLogErr(databaseLogger, { classId, subjectId, teacherId }))
}

export function bulkAssignTeacher(
  assignments: Array<{ classId: string, subjectId: string, teacherId: string }>,
): ResultAsync<typeof classSubjects.$inferSelect[], DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise((async () => {
    const results = []

    for (const assignment of assignments) {
      // Validate teacher qualification
      const [teacherSubject] = await db
        .select()
        .from(teacherSubjects)
        .where(and(eq(teacherSubjects.teacherId, assignment.teacherId), eq(teacherSubjects.subjectId, assignment.subjectId)))
        .limit(1)

      if (!teacherSubject) {
        throw new Error(`Teacher not qualified for subject ${assignment.subjectId}`)
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
  })(), e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to bulk assign teachers')).mapErr(tapLogErr(databaseLogger, { assignmentsCount: assignments.length }))
}

export function removeTeacherFromClassSubject(classId: string, subjectId: string): ResultAsync<typeof classSubjects.$inferSelect | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise((async () => {
    const [updated] = await db
      .update(classSubjects)
      .set({ teacherId: null, updatedAt: new Date() })
      .where(and(eq(classSubjects.classId, classId), eq(classSubjects.subjectId, subjectId)))
      .returning()
    return updated
  })(), e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to remove teacher from class subject')).mapErr(tapLogErr(databaseLogger, { classId, subjectId }))
}

export function removeSubjectFromClass(classId: string, subjectId: string): ResultAsync<typeof classSubjects.$inferSelect | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise((async () => {
    const [deleted] = await db
      .delete(classSubjects)
      .where(and(eq(classSubjects.classId, classId), eq(classSubjects.subjectId, subjectId)))
      .returning()
    return deleted
  })(), e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to remove subject from class')).mapErr(tapLogErr(databaseLogger, { classId, subjectId }))
}

export function detectTeacherConflicts(
  teacherId: string,
  schoolYearId: string,
): ResultAsync<Array<{ classId: string, className: string, subjectName: string, hoursPerWeek: number }>, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise((async () => {
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
  })(), e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to detect teacher conflicts')).mapErr(tapLogErr(databaseLogger, { teacherId, schoolYearId }))
}

export function addSubjectToClass(data: {
  classId: string
  subjectId: string
  teacherId?: string | null
  coefficient?: number
  hoursPerWeek?: number
}): ResultAsync<typeof classSubjects.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise((async () => {
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
      throw new Error('Failed to add subject to class')
    return created
  })(), e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to add subject to class')).mapErr(tapLogErr(databaseLogger, data))
}

export function updateClassSubjectDetails(
  id: string,
  data: {
    coefficient?: number
    hoursPerWeek?: number
    status?: 'active' | 'inactive'
  },
): ResultAsync<typeof classSubjects.$inferSelect, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise((async () => {
    const [updated] = await db
      .update(classSubjects)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(classSubjects.id, id))
      .returning()
    if (!updated)
      throw new Error('Failed to update class subject details')
    return updated
  })(), e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to update class subject details')).mapErr(tapLogErr(databaseLogger, { id, ...data }))
}

export function copyClassSubjects(
  sourceClassId: string,
  targetClassId: string,
  options: { overwrite?: boolean } = {},
): ResultAsync<typeof classSubjects.$inferSelect[], DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise((async () => {
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
  })(), e => DatabaseError.from(e, 'INTERNAL_ERROR', 'Failed to copy class subjects')).mapErr(tapLogErr(databaseLogger, { sourceClassId, targetClassId, ...options }))
}
