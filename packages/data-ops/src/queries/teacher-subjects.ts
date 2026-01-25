import { and, eq, inArray } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { subjects } from '../drizzle/core-schema'
import { teachers, teacherSubjects } from '../drizzle/school-schema'

export async function getTeacherSubjects(teacherId: string) {
  return getDb()
    .select({
      id: teacherSubjects.id,
      teacherId: teacherSubjects.teacherId,
      subjectId: teacherSubjects.subjectId,
      subject: {
        id: subjects.id,
        name: subjects.name,
        shortName: subjects.shortName,
        category: subjects.category,
      },
      createdAt: teacherSubjects.createdAt,
    })
    .from(teacherSubjects)
    .innerJoin(subjects, eq(teacherSubjects.subjectId, subjects.id))
    .where(eq(teacherSubjects.teacherId, teacherId))
}

export async function assignSubjectsToTeacher(teacherId: string, subjectIds: string[]) {
  if (subjectIds.length === 0)
    return []

  const values = subjectIds.map(subjectId => ({
    id: crypto.randomUUID(),
    teacherId,
    subjectId,
  }))

  return getDb()
    .insert(teacherSubjects)
    .values(values)
    .onConflictDoNothing({
      target: [teacherSubjects.teacherId, teacherSubjects.subjectId],
    })
    .returning()
}

export async function removeSubjectsFromTeacher(teacherId: string, subjectIds: string[]) {
  if (subjectIds.length === 0)
    return []

  return getDb()
    .delete(teacherSubjects)
    .where(
      and(
        eq(teacherSubjects.teacherId, teacherId),
        inArray(teacherSubjects.subjectId, subjectIds),
      ),
    )
    .returning()
}

export async function getTeachersForSubject(subjectId: string, schoolId: string) {
  return getDb()
    .select({
      id: teachers.id,
      userId: teachers.userId,
      specialization: teachers.specialization,
      status: teachers.status,
    })
    .from(teachers)
    .innerJoin(teacherSubjects, eq(teachers.id, teacherSubjects.teacherId))
    .where(
      and(
        eq(teacherSubjects.subjectId, subjectId),
        eq(teachers.schoolId, schoolId),
        eq(teachers.status, 'active'),
      ),
    )
}
