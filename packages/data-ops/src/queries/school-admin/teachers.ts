import { and, count, desc, eq, ilike, or } from 'drizzle-orm'
import { getDb } from '@/database/setup'
import { subjects } from '@/drizzle/core-schema'
import { teachers, teacherSubjects, users } from '@/drizzle/school-schema'
import { PAGINATION, SCHOOL_ERRORS } from './constants'

export async function getTeachersBySchool(
  schoolId: string,
  options?: {
    search?: string
    status?: 'active' | 'inactive' | 'on_leave'
    limit?: number
    offset?: number
  },
) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const limit = Math.min(options?.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT)
  const offset = options?.offset || 0

  const conditions = [eq(teachers.schoolId, schoolId)]

  if (options?.status) {
    conditions.push(eq(teachers.status, options.status))
  }

  if (options?.search) {
    conditions.push(or(ilike(users.name, `%${options.search}%`), ilike(users.email, `%${options.search}%`))!)
  }

  const teachersList = await db
    .select({
      id: teachers.id,
      userId: teachers.userId,
      schoolId: teachers.schoolId,
      specialization: teachers.specialization,
      hireDate: teachers.hireDate,
      status: teachers.status,
      createdAt: teachers.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(teachers.createdAt))
    .limit(limit)
    .offset(offset)

  // Fetch subjects for each teacher
  const teachersWithSubjects = await Promise.all(
    teachersList.map(async (teacher: typeof teachersList[0]) => {
      const subjectsList = await db
        .select({
          name: subjects.name,
          shortName: subjects.shortName,
        })
        .from(teacherSubjects)
        .innerJoin(subjects, eq(teacherSubjects.subjectId, subjects.id))
        .where(eq(teacherSubjects.teacherId, teacher.id))

      return {
        ...teacher,
        subjects: subjectsList.map((s: { name: string, shortName: string }) => s.shortName),
      }
    }),
  )

  return teachersWithSubjects
}

export async function getTeacherById(teacherId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const result = await db
    .select()
    .from(teachers)
    .where(and(eq(teachers.id, teacherId), eq(teachers.schoolId, schoolId)))
    .limit(1)

  return result[0] || null
}

export async function getTeacherWithSubjects(teacherId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const teacher = await getTeacherById(teacherId, schoolId)
  if (!teacher) {
    throw new Error(SCHOOL_ERRORS.TEACHER_NOT_FOUND)
  }

  const db = getDb()

  const teacherSubjectsList = await db
    .select({
      subjectId: subjects.id,
      subjectName: subjects.name,
      subjectShortName: subjects.shortName,
    })
    .from(teacherSubjects)
    .innerJoin(subjects, eq(teacherSubjects.subjectId, subjects.id))
    .where(eq(teacherSubjects.teacherId, teacherId))

  return {
    ...teacher,
    subjects: teacherSubjectsList,
  }
}

export async function createTeacher(data: {
  userId: string
  schoolId: string
  specialization?: string
  hireDate?: Date
  subjectIds?: string[]
}) {
  if (!data.schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // Create teacher
  const [teacher] = await db
    .insert(teachers)
    .values({
      id: crypto.randomUUID(),
      userId: data.userId,
      schoolId: data.schoolId,
      specialization: data.specialization,
      hireDate: data.hireDate,
      status: 'active',
    })
    .returning()

  // Assign subjects
  if (data.subjectIds && data.subjectIds.length > 0) {
    await db.insert(teacherSubjects).values(
      data.subjectIds.map(subjectId => ({
        id: crypto.randomUUID(),
        teacherId: teacher.id,
        subjectId,
      })),
    )
  }

  return teacher
}

export async function updateTeacher(
  teacherId: string,
  schoolId: string,
  data: {
    specialization?: string
    hireDate?: Date
    status?: 'active' | 'inactive' | 'on_leave'
  },
) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // Verify teacher belongs to school
  const teacher = await getTeacherById(teacherId, schoolId)
  if (!teacher) {
    throw new Error(SCHOOL_ERRORS.TEACHER_NOT_FOUND)
  }

  const [updated] = await db
    .update(teachers)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(teachers.id, teacherId))
    .returning()

  return updated
}

export async function deleteTeacher(teacherId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // Verify teacher belongs to school
  const teacher = await getTeacherById(teacherId, schoolId)
  if (!teacher) {
    throw new Error(SCHOOL_ERRORS.TEACHER_NOT_FOUND)
  }

  // Hard delete (cascade will handle teacher_subjects)
  await db.delete(teachers).where(eq(teachers.id, teacherId))

  return { success: true }
}

export async function assignSubjectsToTeacher(teacherId: string, schoolId: string, subjectIds: string[]) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // Verify teacher belongs to school
  const teacher = await getTeacherById(teacherId, schoolId)
  if (!teacher) {
    throw new Error(SCHOOL_ERRORS.TEACHER_NOT_FOUND)
  }

  // Remove existing subjects
  await db.delete(teacherSubjects).where(eq(teacherSubjects.teacherId, teacherId))

  // Add new subjects
  if (subjectIds.length > 0) {
    await db.insert(teacherSubjects).values(
      subjectIds.map(subjectId => ({
        id: crypto.randomUUID(),
        teacherId,
        subjectId,
      })),
    )
  }

  return getTeacherWithSubjects(teacherId, schoolId)
}

// Phase 11: Count teachers for pagination
export async function countTeachersBySchool(
  schoolId: string,
  options?: {
    search?: string
    status?: 'active' | 'inactive' | 'on_leave'
  },
) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const conditions = [eq(teachers.schoolId, schoolId)]

  if (options?.status) {
    conditions.push(eq(teachers.status, options.status))
  }

  if (options?.search) {
    conditions.push(or(ilike(users.name, `%${options.search}%`), ilike(users.email, `%${options.search}%`))!)
  }

  const [result] = await db
    .select({ count: count() })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id))
    .where(and(...conditions))

  return result?.count || 0
}

export async function getTeacherByUserId(userId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const result = await db
    .select()
    .from(teachers)
    .where(and(eq(teachers.userId, userId), eq(teachers.schoolId, schoolId)))
    .limit(1)

  return result[0] || null
}

/**
 * Get teacher by auth user ID (Better Auth user ID)
 * Used by teacher app to get teacher context from logged-in user
 */
export async function getTeacherByAuthUserId(authUserId: string) {
  if (!authUserId) {
    return null
  }

  const db = getDb()

  const result = await db
    .select({
      id: teachers.id,
      userId: teachers.userId,
      schoolId: teachers.schoolId,
      specialization: teachers.specialization,
      hireDate: teachers.hireDate,
      status: teachers.status,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id))
    .where(and(eq(users.authUserId, authUserId), eq(teachers.status, 'active')))
    .limit(1)

  return result[0] || null
}
