import { and, desc, eq, ne } from 'drizzle-orm'
import { getDb } from '../../database/setup'
import { classes, enrollments, students } from '../../drizzle/school-schema'
import { PAGINATION, SCHOOL_ERRORS } from './constants'

export async function getEnrollmentsBySchoolYear(schoolYearId: string, schoolId: string, options?: {
  status?: 'pending' | 'confirmed' | 'cancelled'
  limit?: number
  offset?: number
}) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const limit = Math.min(options?.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT)
  const offset = options?.offset || 0

  const conditions = [eq(enrollments.schoolYearId, schoolYearId)]

  if (options?.status) {
    conditions.push(eq(enrollments.status, options.status))
  }

  const db = getDb()

  return db
    .select({
      id: enrollments.id,
      studentId: enrollments.studentId,
      classId: enrollments.classId,
      schoolYearId: enrollments.schoolYearId,
      status: enrollments.status,
      enrollmentDate: enrollments.enrollmentDate,
      createdAt: enrollments.createdAt,
      student: {
        id: students.id,
        firstName: students.firstName,
        lastName: students.lastName,
        matricule: students.matricule,
      },
    })
    .from(enrollments)
    .innerJoin(students, and(
      eq(enrollments.studentId, students.id),
      eq(students.schoolId, schoolId),
    ))
    .where(and(...conditions))
    .orderBy(desc(enrollments.createdAt))
    .limit(limit)
    .offset(offset)
}

export async function getEnrollmentsByStudent(studentId: string, schoolId: string) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  return db
    .select()
    .from(enrollments)
    .innerJoin(students, and(
      eq(enrollments.studentId, students.id),
      eq(students.schoolId, schoolId),
    ))
    .where(eq(enrollments.studentId, studentId))
    .orderBy(desc(enrollments.createdAt))
}

export async function enrollStudent(data: {
  studentId: string
  classId: string
  schoolYearId: string
  schoolId: string
  enrollmentDate: Date
}) {
  if (!data.schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // 1. Verify student exists and belongs to school
  const student = await db.query.students.findFirst({
    where: and(
      eq(students.id, data.studentId),
      eq(students.schoolId, data.schoolId),
    ),
  })
  if (!student) {
    throw new Error(SCHOOL_ERRORS.STUDENT_NOT_FOUND)
  }

  // 2. Verify class exists and belongs to school
  const classInfo = await db.query.classes.findFirst({
    where: and(
      eq(classes.id, data.classId),
      eq(classes.schoolId, data.schoolId),
    ),
  })
  if (!classInfo) {
    throw new Error(SCHOOL_ERRORS.CLASS_NOT_FOUND)
  }

  // 3. Check for duplicate enrollment
  const existing = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.studentId, data.studentId),
      eq(enrollments.schoolYearId, data.schoolYearId),
      ne(enrollments.status, 'cancelled'),
    ),
  })
  if (existing) {
    throw new Error(SCHOOL_ERRORS.ALREADY_ENROLLED)
  }

  // 4. Create enrollment
  const [enrollment] = await db.insert(enrollments).values({
    id: crypto.randomUUID(),
    studentId: data.studentId,
    classId: data.classId,
    schoolYearId: data.schoolYearId,
    enrollmentDate: data.enrollmentDate.toISOString().split('T')[0]!,
    status: 'pending',
  }).returning()

  return enrollment
}

export async function updateEnrollmentStatus(
  enrollmentId: string,
  schoolId: string,
  status: 'pending' | 'confirmed' | 'cancelled',
) {
  if (!schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // Verify enrollment belongs to school
  const enrollment = await db.query.enrollments.findFirst({
    where: eq(enrollments.id, enrollmentId),
    with: {
      student: true,
    },
  })

  if (!enrollment || enrollment.student.schoolId !== schoolId) {
    throw new Error(SCHOOL_ERRORS.STUDENT_NOT_FOUND)
  }

  const [updated] = await db
    .update(enrollments)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(enrollments.id, enrollmentId))
    .returning()

  return updated
}

export async function transferStudent(data: {
  enrollmentId: string
  newClassId: string
  schoolId: string
  transferDate: Date
}) {
  if (!data.schoolId) {
    throw new Error(SCHOOL_ERRORS.NO_SCHOOL_CONTEXT)
  }

  const db = getDb()

  // 1. Get current enrollment
  const enrollment = await db.query.enrollments.findFirst({
    where: eq(enrollments.id, data.enrollmentId),
    with: {
      student: true,
    },
  })

  if (!enrollment || enrollment.student.schoolId !== data.schoolId) {
    throw new Error(SCHOOL_ERRORS.STUDENT_NOT_FOUND)
  }

  // 2. Verify new class exists
  const newClass = await db.query.classes.findFirst({
    where: and(
      eq(classes.id, data.newClassId),
      eq(classes.schoolId, data.schoolId),
    ),
  })
  if (!newClass) {
    throw new Error(SCHOOL_ERRORS.CLASS_NOT_FOUND)
  }

  // 3. Update enrollment
  const [updated] = await db
    .update(enrollments)
    .set({
      classId: data.newClassId,
      updatedAt: new Date(),
    })
    .where(eq(enrollments.id, data.enrollmentId))
    .returning()

  return updated
}
