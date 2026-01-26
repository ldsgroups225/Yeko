import { and, count, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { getDb } from '../../database/setup'
import { auth_user } from '../../drizzle/auth-schema'
import { grades, series, subjects } from '../../drizzle/core-schema'
import {
  classes,
  classrooms,
  classSubjects,
  teachers,
  teacherSubjects,
  users,
  userSchools,
} from '../../drizzle/school-schema'
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
        subjects: subjectsList.map(s => s.shortName).filter(Boolean) as string[],
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
    .select({
      id: teachers.id,
      userId: teachers.userId,
      schoolId: teachers.schoolId,
      specialization: teachers.specialization,
      hireDate: teachers.hireDate,
      status: teachers.status,
      createdAt: teachers.createdAt,
      updatedAt: teachers.updatedAt,
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
      hireDate: data.hireDate?.toISOString(),
      status: 'active',
    })
    .returning()

  if (!teacher) {
    throw new Error('Failed to create teacher')
  }

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
  const { hireDate, ...rest } = data
  const [updated] = await db
    .update(teachers)
    .set({
      ...rest,
      ...(hireDate && { hireDate: hireDate.toISOString() }),
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

export async function getTeacherClasses(teacherId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const result = await db
    .select({
      id: classes.id,
      section: classes.section,
      gradeName: grades.name,
      seriesName: series.name,
      classroomName: classrooms.name,
      isHomeroom: sql<boolean>`${classes.homeroomTeacherId} = ${teacherId}`,
      subjects: sql<string[]>`COALESCE(json_agg(DISTINCT ${subjects.shortName}) FILTER (WHERE ${subjects.shortName} IS NOT NULL), '[]')`,
    })
    .from(classes)
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .leftJoin(series, eq(classes.seriesId, series.id))
    .leftJoin(classrooms, eq(classes.classroomId, classrooms.id))
    .leftJoin(classSubjects, eq(classSubjects.classId, classes.id))
    .leftJoin(subjects, eq(classSubjects.subjectId, subjects.id))
    .where(
      and(
        eq(classes.schoolId, schoolId),
        or(
          eq(classes.homeroomTeacherId, teacherId),
          eq(classSubjects.teacherId, teacherId),
        ),
      ),
    )
    .groupBy(classes.id, grades.id, series.id, classrooms.id)
    .orderBy(grades.order, classes.section)

  return result
}

export async function linkTeacherByEmail(email: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // Find user by email
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      authUserId: users.authUserId,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  if (user.authUserId) {
    // If user is already linked, just check if they are a teacher in this school
    const [existingTeacher] = await db
      .select({ id: teachers.id })
      .from(teachers)
      .where(and(eq(teachers.userId, user.id), eq(teachers.schoolId, schoolId)))
      .limit(1)

    if (existingTeacher) {
      return { success: false, message: 'User is already a teacher in this school' }
    }

    // Create teacher record
    await createTeacher({
      userId: user.id,
      schoolId,
    })

    return { success: true, count: 1 }
  }

  // Find auth user with same email
  const [authUser] = await db
    .select({ id: auth_user.id })
    .from(auth_user)
    .where(eq(auth_user.email, email))
    .limit(1)

  if (!authUser) {
    throw new Error('Auth user not found')
  }

  // Link them
  await db
    .update(users)
    .set({ authUserId: authUser.id })
    .where(eq(users.id, user.id))

  // Create teacher record if not exists
  const [existingTeacher] = await db
    .select({ id: teachers.id })
    .from(teachers)
    .where(and(eq(teachers.userId, user.id), eq(teachers.schoolId, schoolId)))
    .limit(1)

  if (!existingTeacher) {
    await createTeacher({
      userId: user.id,
      schoolId,
    })
  }

  return { success: true, count: 1 }
}

export async function getTeacherSchoolsCount(userId: string): Promise<number> {
  const db = getDb()

  const result = await db
    .select({ count: count(sql`DISTINCT ${teachers.schoolId}`) })
    .from(teachers)
    .where(eq(teachers.userId, userId))

  return result[0]?.count ?? 0
}
