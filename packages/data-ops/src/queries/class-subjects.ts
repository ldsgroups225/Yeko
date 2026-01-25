import { and, eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb } from '../database/setup'
import { grades, subjects } from '../drizzle/core-schema'
import {
  classes,
  classSubjects,
  teachers,
  teacherSubjects,
  users,
} from '../drizzle/school-schema'

export interface ClassSubjectFilters {
  classId?: string
  subjectId?: string
  teacherId?: string
  schoolId?: string
  schoolYearId?: string
}

export async function getClassSubjects(filters: ClassSubjectFilters) {
  const db = getDb()
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

  return await db
    .select({
      classSubject: classSubjects,
      class: classes,
      subject: subjects,
      teacher: {
        id: teachers.id,
        name: users.name,
      },
    })
    .from(classSubjects)
    .innerJoin(classes, eq(classSubjects.classId, classes.id))
    .innerJoin(subjects, eq(classSubjects.subjectId, subjects.id))
    .leftJoin(teachers, eq(classSubjects.teacherId, teachers.id))
    .leftJoin(users, eq(teachers.userId, users.id))
    .where(and(...conditions))
    .orderBy(subjects.name)
}

export async function getAssignmentMatrix(schoolId: string, schoolYearId: string) {
  const db = getDb()
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
}

export async function assignTeacherToClassSubject(classId: string, subjectId: string, teacherId: string) {
  const db = getDb()
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
    return updated
  }
  else {
    // Create new assignment
    const [created] = await db.insert(classSubjects).values({ id: nanoid(), classId, subjectId, teacherId }).returning()
    return created
  }
}

export async function bulkAssignTeacher(
  assignments: Array<{ classId: string, subjectId: string, teacherId: string }>,
) {
  const db = getDb()
  return await db.transaction(async (tx: any) => {
    const results = []

    for (const assignment of assignments) {
      // Validate teacher qualification
      const [teacherSubject] = await tx
        .select()
        .from(teacherSubjects)
        .where(and(eq(teacherSubjects.teacherId, assignment.teacherId), eq(teacherSubjects.subjectId, assignment.subjectId)))
        .limit(1)

      if (!teacherSubject) {
        throw new Error(`Teacher not qualified for subject ${assignment.subjectId}`)
      }

      // Upsert assignment
      const [existing] = await tx
        .select()
        .from(classSubjects)
        .where(and(eq(classSubjects.classId, assignment.classId), eq(classSubjects.subjectId, assignment.subjectId)))
        .limit(1)

      if (existing) {
        const [updated] = await tx
          .update(classSubjects)
          .set({ teacherId: assignment.teacherId, updatedAt: new Date() })
          .where(eq(classSubjects.id, existing.id))
          .returning()
        results.push(updated)
      }
      else {
        const [created] = await tx.insert(classSubjects).values({ id: nanoid(), ...assignment }).returning()
        results.push(created)
      }
    }

    return results
  })
}

export async function removeTeacherFromClassSubject(classId: string, subjectId: string) {
  const db = getDb()
  const [updated] = await db
    .update(classSubjects)
    .set({ teacherId: null, updatedAt: new Date() })
    .where(and(eq(classSubjects.classId, classId), eq(classSubjects.subjectId, subjectId)))
    .returning()
  return updated
}

export async function removeSubjectFromClass(classId: string, subjectId: string) {
  const db = getDb()
  const [deleted] = await db
    .delete(classSubjects)
    .where(and(eq(classSubjects.classId, classId), eq(classSubjects.subjectId, subjectId)))
    .returning()
  return deleted
}

export async function detectTeacherConflicts(
  teacherId: string,
  schoolYearId: string,
): Promise<Array<{ classId: string, className: string, subjectName: string, hoursPerWeek: number }>> {
  const db = getDb()
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
  const totalHours = assignments.reduce((sum: number, a: any) => sum + a.hoursPerWeek, 0)

  // Flag if teacher has >30 hours/week (overloaded)
  if (totalHours > 30) {
    return assignments
  }

  return []
}

export async function addSubjectToClass(data: {
  classId: string
  subjectId: string
  teacherId?: string | null
  coefficient?: number
  hoursPerWeek?: number
}) {
  const db = getDb()
  const [created] = await db
    .insert(classSubjects)
    .values({
      id: nanoid(),
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
  return created
}

export async function updateClassSubjectDetails(
  id: string,
  data: {
    coefficient?: number
    hoursPerWeek?: number
    status?: 'active' | 'inactive'
  },
) {
  const db = getDb()
  const [updated] = await db
    .update(classSubjects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(classSubjects.id, id))
    .returning()
  return updated
}

export async function copyClassSubjects(
  sourceClassId: string,
  targetClassId: string,
  options: { overwrite?: boolean } = {},
) {
  const db = getDb()

  return await db.transaction(async (tx: any) => {
    // 1. Get source subjects
    const sourceSubjects = await tx
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
      const [existing] = await tx
        .select()
        .from(classSubjects)
        .where(and(eq(classSubjects.classId, targetClassId), eq(classSubjects.subjectId, subject.subjectId)))
        .limit(1)

      if (existing) {
        if (options.overwrite) {
          // Update existing with source configuration (coefficient, hours)
          // Keep the existing teacher assignment unless we decide to copy that too (usually not for new year/class)
          // For now, let's keep teacherId null or existing to avoid conflicts.
          // Let's copy coefficient and hours only.
          const [updated] = await tx
            .update(classSubjects)
            .set({
              coefficient: subject.coefficient,
              hoursPerWeek: subject.hoursPerWeek,
              updatedAt: new Date(),
            })
            .where(eq(classSubjects.id, existing.id))
            .returning()
          results.push(updated)
        }
        // If not overwrite, skip
      }
      else {
        // Create new assignment
        const [created] = await tx
          .insert(classSubjects)
          .values({
            id: nanoid(),
            classId: targetClassId,
            subjectId: subject.subjectId,
            teacherId: null, // Don't copy teacher assignment by default
            coefficient: subject.coefficient,
            hoursPerWeek: subject.hoursPerWeek,
            status: subject.status,
          })
          .returning()
        results.push(created)
      }
    }

    return results
  })
}
