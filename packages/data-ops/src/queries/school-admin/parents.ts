import { and, desc, eq, ilike, or } from 'drizzle-orm'
import { getDb } from '@/database/setup'
import { parents, studentParents, students, users } from '@/drizzle/school-schema'
import { PAGINATION, SCHOOL_ERRORS } from './constants'

export async function getParentsBySchool(
  schoolId: string,
  options?: {
    search?: string
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

  const conditions = [eq(students.schoolId, schoolId)]

  if (options?.search) {
    conditions.push(or(ilike(users.name, `%${options.search}%`), ilike(parents.phone, `%${options.search}%`))!)
  }

  return db
    .select({
      id: parents.id,
      userId: parents.userId,
      phone: parents.phone,
      address: parents.address,
      createdAt: parents.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(parents)
    .innerJoin(users, eq(parents.userId, users.id))
    .innerJoin(studentParents, eq(parents.id, studentParents.parentId))
    .innerJoin(students, eq(studentParents.studentId, students.id))
    .where(and(...conditions))
    .orderBy(desc(parents.createdAt))
    .limit(limit)
    .offset(offset)
}

export async function getParentById(parentId: string) {
  const db = getDb()

  const result = await db.select().from(parents).where(eq(parents.id, parentId)).limit(1)

  return result[0] || null
}

export async function getParentWithChildren(parentId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const parent = await getParentById(parentId)
  if (!parent) {
    throw new Error(SCHOOL_ERRORS.PARENT_NOT_FOUND)
  }

  const db = getDb()

  const children = await db
    .select({
      studentId: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      matricule: students.matricule,
      relationship: studentParents.relationship,
      isPrimary: studentParents.isPrimary,
    })
    .from(studentParents)
    .innerJoin(students, and(eq(studentParents.studentId, students.id), eq(students.schoolId, schoolId)))
    .where(eq(studentParents.parentId, parentId))

  return {
    ...parent,
    children,
  }
}

export async function createParent(data: { userId: string, phone: string, address?: string }) {
  const db = getDb()

  const [user] = await db.select().from(users).where(eq(users.id, data.userId)).limit(1)
  if (!user) {
    throw new Error('User not found')
  }
  const nameParts = user.name?.split(' ') || []
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ')

  const [parent] = await db
    .insert(parents)
    .values({
      id: crypto.randomUUID(),
      userId: data.userId,
      phone: data.phone,
      address: data.address,
      firstName,
      lastName,
    })
    .returning()
  if (!parent) {
    throw new Error('Failed to create parent')
  }
  return parent
}

export async function updateParent(
  parentId: string,
  data: {
    phone?: string
    address?: string
  },
) {
  const db = getDb()

  // Verify parent exists
  const parent = await getParentById(parentId)
  if (!parent) {
    throw new Error(SCHOOL_ERRORS.PARENT_NOT_FOUND)
  }

  const [updated] = await db
    .update(parents)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(parents.id, parentId))
    .returning()

  return updated
}

export async function deleteParent(parentId: string) {
  const db = getDb()

  // Verify parent exists
  const parent = await getParentById(parentId)
  if (!parent) {
    throw new Error(SCHOOL_ERRORS.PARENT_NOT_FOUND)
  }

  // Hard delete (cascade will handle student_parents)
  await db.delete(parents).where(eq(parents.id, parentId))

  return { success: true }
}

export async function linkParentToStudent(data: {
  parentId: string
  studentId: string
  schoolId: string
  relationship: 'father' | 'mother' | 'guardian'
  isPrimary?: boolean
}) {
  if (!data.schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  return db.transaction(async (tx: any) => {
    // Verify student belongs to school
    const student = await tx.query.students.findFirst({
      where: and(eq(students.id, data.studentId), eq(students.schoolId, data.schoolId)),
    })
    if (!student) {
      throw new Error(SCHOOL_ERRORS.STUDENT_NOT_FOUND)
    }

    // Verify parent exists
    const parent = await tx.query.parents.findFirst({
      where: eq(parents.id, data.parentId),
    })
    if (!parent) {
      throw new Error(SCHOOL_ERRORS.PARENT_NOT_FOUND)
    }

    // Create link
    const [link] = await tx
      .insert(studentParents)
      .values({
        id: crypto.randomUUID(),
        studentId: data.studentId,
        parentId: data.parentId,
        relationship: data.relationship,
        isPrimary: data.isPrimary || false,
      })
      .returning()

    return link
  })
}

export async function unlinkParentFromStudent(studentId: string, parentId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // Verify student belongs to school
  const student = await db.query.students.findFirst({
    where: and(eq(students.id, studentId), eq(students.schoolId, schoolId)),
  })
  if (!student) {
    throw new Error(SCHOOL_ERRORS.STUDENT_NOT_FOUND)
  }

  await db.delete(studentParents).where(and(eq(studentParents.studentId, studentId), eq(studentParents.parentId, parentId)))

  return { success: true }
}
