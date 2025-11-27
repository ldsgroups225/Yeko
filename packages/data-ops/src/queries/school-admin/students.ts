import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { getDb } from '@/database/setup'
import { students } from '@/drizzle/school-schema'
import { PAGINATION, SCHOOL_ERRORS, VALIDATION_RULES } from './constants'

export async function getStudentsBySchool(schoolId: string, options?: {
  search?: string
  status?: 'active' | 'graduated' | 'transferred' | 'withdrawn'
  limit?: number
  offset?: number
}) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const limit = Math.min(options?.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT)
  const offset = options?.offset || 0

  const conditions = [eq(students.schoolId, schoolId)]

  if (options?.status) {
    conditions.push(eq(students.status, options.status))
  }

  if (options?.search) {
    conditions.push(
      or(
        ilike(students.firstName, `%${options.search}%`),
        ilike(students.lastName, `%${options.search}%`),
        ilike(students.matricule, `%${options.search}%`),
      )!,
    )
  }

  const db = getDb()

  return db
    .select()
    .from(students)
    .where(and(...conditions))
    .orderBy(desc(students.createdAt))
    .limit(limit)
    .offset(offset)
}

export async function getStudentById(studentId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const result = await db
    .select()
    .from(students)
    .where(and(
      eq(students.id, studentId),
      eq(students.schoolId, schoolId),
    ))
    .limit(1)

  return result[0] || null
}

export async function createStudent(data: {
  schoolId: string
  firstName: string
  lastName: string
  dob: Date
  gender?: 'M' | 'F' | 'other'
  matricule: string
  photoUrl?: string
}) {
  if (!data.schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  // Validate matricule format
  if (!VALIDATION_RULES.matricule.pattern.test(data.matricule)) {
    throw new Error(`Invalid matricule format. Expected: ${VALIDATION_RULES.matricule.example}`)
  }

  const db = getDb()

  const [student] = await db.insert(students).values({
    id: crypto.randomUUID(),
    schoolId: data.schoolId,
    firstName: data.firstName,
    lastName: data.lastName,
    dob: data.dob,
    gender: data.gender,
    matricule: data.matricule,
    photoUrl: data.photoUrl,
    status: 'active',
  }).returning()

  return student
}

export async function updateStudent(studentId: string, schoolId: string, data: {
  firstName?: string
  lastName?: string
  dob?: Date
  gender?: 'M' | 'F' | 'other'
  photoUrl?: string
  status?: 'active' | 'graduated' | 'transferred' | 'withdrawn'
}) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  // Verify student belongs to school
  const student = await getStudentById(studentId, schoolId)
  if (!student) {
    throw new Error(SCHOOL_ERRORS.STUDENT_NOT_FOUND)
  }

  const db = getDb()

  const [updated] = await db
    .update(students)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(students.id, studentId))
    .returning()

  return updated
}

export async function deleteStudent(studentId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  // Verify student belongs to school
  const student = await getStudentById(studentId, schoolId)
  if (!student) {
    throw new Error(SCHOOL_ERRORS.STUDENT_NOT_FOUND)
  }

  const db = getDb()

  // Hard delete (cascade will handle related records)
  await db.delete(students).where(eq(students.id, studentId))

  return { success: true }
}

export async function searchStudents(schoolId: string, query: string, limit = 10) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // Full-text search using PostgreSQL
  return db
    .select()
    .from(students)
    .where(and(
      eq(students.schoolId, schoolId),
      sql`to_tsvector('french', ${students.firstName} || ' ' || ${students.lastName}) @@ plainto_tsquery('french', ${query})`,
    ))
    .limit(limit)
}

export async function getStudentCount(schoolId: string, status?: 'active' | 'graduated' | 'transferred' | 'withdrawn') {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const conditions = [eq(students.schoolId, schoolId)]

  if (status) {
    conditions.push(eq(students.status, status))
  }

  const db = getDb()

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(students)
    .where(and(...conditions))

  return result[0]?.count || 0
}
