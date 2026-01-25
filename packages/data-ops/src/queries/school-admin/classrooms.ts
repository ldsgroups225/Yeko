import { nanoid } from "nanoid"
import { getDb } from '../../database/setup'
import { classrooms } from '../../drizzle/school-schema'
import { and, desc, eq, ilike } from 'drizzle-orm'
import { PAGINATION, SCHOOL_ERRORS } from './constants'

export async function getClassroomsBySchool(
  schoolId: string,
  options?: {
    search?: string
    type?: 'regular' | 'lab' | 'gym' | 'library'
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

  const conditions = [eq(classrooms.schoolId, schoolId)]

  if (options?.type) {
    conditions.push(eq(classrooms.type, options.type))
  }

  if (options?.search) {
    conditions.push(ilike(classrooms.name, `%${options.search}%`))
  }

  return db.select().from(classrooms).where(and(...conditions)).orderBy(desc(classrooms.createdAt)).limit(limit).offset(offset)
}

export async function getClassroomById(classroomId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const result = await db
    .select()
    .from(classrooms)
    .where(and(eq(classrooms.id, classroomId), eq(classrooms.schoolId, schoolId)))
    .limit(1)

  return result[0] || null
}

export async function createClassroom(data: {
  schoolId: string
  name: string
  code: string
  type?: 'regular' | 'lab' | 'gym' | 'library'
  capacity?: number
  equipment?: Record<string, any>
}) {
  if (!data.schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  const [classroom] = await db
    .insert(classrooms)
    .values({
      id: nanoid(),
      schoolId: data.schoolId,
      name: data.name,
      code: data.code,
      type: data.type || 'regular',
      capacity: data.capacity,
      equipment: data.equipment || {},
    })
    .returning()

  return classroom
}

export async function updateClassroom(
  classroomId: string,
  schoolId: string,
  data: {
    name?: string
    code?: string
    type?: 'regular' | 'lab' | 'gym' | 'library'
    capacity?: number
    equipment?: Record<string, any>
  },
) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // Verify classroom belongs to school
  const classroom = await getClassroomById(classroomId, schoolId)
  if (!classroom) {
    throw new Error(SCHOOL_ERRORS.CLASSROOM_NOT_FOUND)
  }

  const [updated] = await db
    .update(classrooms)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(classrooms.id, classroomId))
    .returning()

  return updated
}

export async function deleteClassroom(classroomId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // Verify classroom belongs to school
  const classroom = await getClassroomById(classroomId, schoolId)
  if (!classroom) {
    throw new Error(SCHOOL_ERRORS.CLASSROOM_NOT_FOUND)
  }

  // Hard delete
  await db.delete(classrooms).where(eq(classrooms.id, classroomId))

  return { success: true }
}
