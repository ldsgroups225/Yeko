import type { Enrollment, EnrollmentInsert, EnrollmentStatus } from '../drizzle/school-schema'
import crypto from 'node:crypto'
import { and, desc, eq, inArray, ne, or, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { grades, series } from '../drizzle/core-schema'
import { classes, enrollments, schoolYears, students, users } from '../drizzle/school-schema'

const nanoid = () => crypto.randomUUID()
// ==================== Types ====================
export interface EnrollmentFilters {
  schoolId: string
  schoolYearId?: string
  classId?: string
  status?: EnrollmentStatus
  search?: string
  page?: number
  limit?: number
}
export interface CreateEnrollmentInput {
  studentId: string
  classId: string
  schoolYearId: string
  enrollmentDate?: string
  rollNumber?: number
}
export interface TransferInput {
  enrollmentId: string
  newClassId: string
  reason?: string
  effectiveDate?: string
}
// ==================== Queries ====================
export async function getEnrollments(filters: EnrollmentFilters) {
  const db = getDb()
  const { schoolId, schoolYearId, classId, status, search, page = 1, limit = 20 } = filters
  const conditions = []
  if (schoolYearId) {
    conditions.push(eq(enrollments.schoolYearId, schoolYearId))
  }
  if (classId) {
    conditions.push(eq(enrollments.classId, classId))
  }
  if (status) {
    conditions.push(eq(enrollments.status, status))
  }
  if (search) {
    conditions.push(
      or(
        sql`${students.firstName} ILIKE ${`%${search}%`}`,
        sql`${students.lastName} ILIKE ${`%${search}%`}`,
        sql`${students.matricule} ILIKE ${`%${search}%`}`,
      ),
    )
  }
  const query = db
    .select({
      enrollment: enrollments,
      student: {
        id: students.id,
        firstName: students.firstName,
        lastName: students.lastName,
        matricule: students.matricule,
        photoUrl: students.photoUrl,
        gender: students.gender,
      },
      class: {
        id: classes.id,
        section: classes.section,
        gradeName: grades.name,
        seriesName: series.name,
      },
      confirmedByUser: {
        id: users.id,
        name: users.name,
      },
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .leftJoin(series, eq(classes.seriesId, series.id))
    .leftJoin(users, eq(enrollments.confirmedBy, users.id))
    .where(and(eq(students.schoolId, schoolId), ...conditions))
    .orderBy(desc(enrollments.enrollmentDate))
  const offset = (page - 1) * limit
  const data = await query.limit(limit).offset(offset)
  // Get total count
  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .where(and(eq(students.schoolId, schoolId), ...conditions))
  return {
    data,
    total: Number(countResult[0]?.count || 0),
    page,
    totalPages: Math.ceil(Number(countResult[0]?.count || 0) / limit),
  }
}
export async function getEnrollmentById(id: string) {
  const db = getDb()
  const [enrollment] = await db
    .select({
      enrollment: enrollments,
      student: students,
      class: {
        id: classes.id,
        section: classes.section,
        gradeName: grades.name,
        seriesName: series.name,
        maxStudents: classes.maxStudents,
      },
      schoolYear: schoolYears,
      confirmedByUser: users,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .leftJoin(series, eq(classes.seriesId, series.id))
    .innerJoin(schoolYears, eq(enrollments.schoolYearId, schoolYears.id))
    .leftJoin(users, eq(enrollments.confirmedBy, users.id))
    .where(eq(enrollments.id, id))
  return enrollment
}
// ==================== CRUD Operations ====================
export async function createEnrollment(data: CreateEnrollmentInput): Promise<Enrollment> {
  const db = getDb()
  // Check if student already enrolled in this year
  const [existing] = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.studentId, data.studentId),
        eq(enrollments.schoolYearId, data.schoolYearId),
        ne(enrollments.status, 'cancelled'),
      ),
    )
  if (existing) {
    throw new Error('Student is already enrolled for this school year')
  }
  // Check class capacity
  const classCapacity = await db
    .select({
      maxStudents: classes.maxStudents,
      currentCount: sql<number>`COUNT(${enrollments.id})`.as('current_count'),
    })
    .from(classes)
    .leftJoin(enrollments, and(eq(enrollments.classId, classes.id), eq(enrollments.status, 'confirmed')))
    .where(eq(classes.id, data.classId))
    .groupBy(classes.id)
  if (classCapacity[0] && Number(classCapacity[0].currentCount) >= classCapacity[0].maxStudents) {
    throw new Error('Class has reached maximum capacity')
  }
  // Generate roll number
  let rollNumber = data.rollNumber
  if (!rollNumber) {
    const lastRoll = await db
      .select({ maxRoll: sql<number>`MAX(${enrollments.rollNumber})` })
      .from(enrollments)
      .where(and(eq(enrollments.classId, data.classId), eq(enrollments.status, 'confirmed')))
    rollNumber = (lastRoll[0]?.maxRoll || 0) + 1
  }
  const [enrollment] = await db
    .insert(enrollments)
    .values({
      id: nanoid(),
      ...data,
      enrollmentDate: data.enrollmentDate || new Date().toISOString().split('T')[0],
      rollNumber,
      status: 'pending',
    } as EnrollmentInsert)
    .returning()
  if (!enrollment) {
    throw new Error('Failed to create enrollment')
  }
  return enrollment
}
export async function confirmEnrollment(id: string, userId: string): Promise<Enrollment> {
  const db = getDb()
  const [enrollment] = await db
    .update(enrollments)
    .set({
      status: 'confirmed',
      confirmedAt: new Date(),
      confirmedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(enrollments.id, id))
    .returning()
  if (!enrollment) {
    throw new Error('Failed to confirm enrollment')
  }
  return enrollment
}
export async function cancelEnrollment(id: string, userId: string, reason?: string): Promise<Enrollment> {
  const db = getDb()
  const [enrollment] = await db
    .update(enrollments)
    .set({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: userId,
      cancellationReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(enrollments.id, id))
    .returning()
  if (!enrollment) {
    throw new Error('Failed to cancel enrollment')
  }
  return enrollment
}
export async function deleteEnrollment(id: string) {
  const db = getDb()
  // Only allow deletion of pending enrollments
  const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, id))
  if (enrollment?.status !== 'pending') {
    throw new Error('Can only delete pending enrollments. Use cancel for confirmed enrollments.')
  }
  await db.delete(enrollments).where(eq(enrollments.id, id))
}
// ==================== Transfer ====================
export async function transferStudent(data: TransferInput, userId: string): Promise<Enrollment> {
  const db = getDb()
  const { enrollmentId, newClassId, reason, effectiveDate } = data
  // Get current enrollment
  const [currentEnrollment] = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId))
  if (!currentEnrollment) {
    throw new Error('Enrollment not found')
  }
  if (currentEnrollment.status !== 'confirmed') {
    throw new Error('Can only transfer confirmed enrollments')
  }
  // Check new class capacity
  const classCapacity = await db
    .select({
      maxStudents: classes.maxStudents,
      currentCount: sql<number>`COUNT(${enrollments.id})`.as('current_count'),
    })
    .from(classes)
    .leftJoin(enrollments, and(eq(enrollments.classId, classes.id), eq(enrollments.status, 'confirmed')))
    .where(eq(classes.id, newClassId))
    .groupBy(classes.id)
  if (classCapacity[0] && Number(classCapacity[0].currentCount) >= classCapacity[0].maxStudents) {
    throw new Error('Target class has reached maximum capacity')
  }
  // Update current enrollment to transferred
  await db
    .update(enrollments)
    .set({
      status: 'transferred',
      transferredAt: new Date(),
      transferredTo: newClassId,
      transferReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(enrollments.id, enrollmentId))
  // Generate new roll number
  const lastRoll = await db
    .select({ maxRoll: sql<number>`MAX(${enrollments.rollNumber})` })
    .from(enrollments)
    .where(and(eq(enrollments.classId, newClassId), eq(enrollments.status, 'confirmed')))
  // Create new enrollment
  const [newEnrollment] = await db
    .insert(enrollments)
    .values({
      id: nanoid(),
      studentId: currentEnrollment.studentId,
      classId: newClassId,
      schoolYearId: currentEnrollment.schoolYearId,
      enrollmentDate: effectiveDate || new Date().toISOString().split('T[0]'),
      rollNumber: (lastRoll[0]?.maxRoll || 0) + 1,
      status: 'confirmed',
      confirmedAt: new Date(),
      confirmedBy: userId,
      previousEnrollmentId: enrollmentId,
    } as EnrollmentInsert)
    .returning()
  if (!newEnrollment) {
    throw new Error('Failed to create new enrollment for transfer')
  }
  return newEnrollment
}

// ==================== Re-enrollment ====================

export async function bulkReEnroll(
  schoolId: string,
  fromYearId: string,
  toYearId: string,
  options: {
    gradeMapping?: Record<string, string>
    autoConfirm?: boolean
  } = {},
): Promise<{ success: number, skipped: number, errors: Array<{ studentId: string, error: string }> }> {
  const db = getDb()
  const results = { success: 0, skipped: 0, errors: [] as Array<{ studentId: string, error: string }> }

  // 1. Get all confirmed enrollments from previous year
  const previousEnrollments = await db
    .select({
      enrollment: enrollments,
      student: students,
      class: classes,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .where(
      and(
        eq(students.schoolId, schoolId),
        eq(enrollments.schoolYearId, fromYearId),
        eq(enrollments.status, 'confirmed'),
        eq(students.status, 'active'),
      ),
    )

  if (previousEnrollments.length === 0) {
    return results
  }

  // 2. Pre-fetch existing enrollments in target year to avoid N+1 checks
  const studentIds = previousEnrollments.map(pe => pe.student.id)
  const existingInTarget = await db
    .select({ studentId: enrollments.studentId })
    .from(enrollments)
    .where(
      and(
        inArray(enrollments.studentId, studentIds),
        eq(enrollments.schoolYearId, toYearId),
        ne(enrollments.status, 'cancelled'),
      ),
    )

  const alreadyEnrolledIds = new Set(existingInTarget.map(e => e.studentId))

  // 3. Pre-fetch target classes in target year
  const targetClassesList = await db
    .select()
    .from(classes)
    .where(and(eq(classes.schoolId, schoolId), eq(classes.schoolYearId, toYearId), eq(classes.status, 'active')))

  // Map by gradeId and seriesId for fast lookup
  const classLookup = new Map<string, typeof targetClassesList[0]>()
  for (const c of targetClassesList) {
    const key = `${c.gradeId}-${c.seriesId || 'none'}`
    if (!classLookup.has(key))
      classLookup.set(key, c)
  }

  // 4. Pre-fetch current max roll numbers per class
  const rollResults = await db
    .select({
      classId: enrollments.classId,
      maxRoll: sql<number>`MAX(${enrollments.rollNumber})`,
    })
    .from(enrollments)
    .where(eq(enrollments.schoolYearId, toYearId))
    .groupBy(enrollments.classId)

  const rollMap = new Map<string, number>(rollResults.map(r => [r.classId, Number(r.maxRoll || 0)]))

  // 5. Prepare batch inserts
  const toInsert: EnrollmentInsert[] = []
  const today = new Date().toISOString().split('T')[0]

  for (const { enrollment, student, class: prevClass } of previousEnrollments) {
    if (alreadyEnrolledIds.has(student.id)) {
      results.skipped++
      continue
    }

    const targetGradeId = options.gradeMapping?.[prevClass.gradeId] || prevClass.gradeId
    const classKey = `${targetGradeId}-${prevClass.seriesId || 'none'}`
    const targetClass = classLookup.get(classKey)

    if (!targetClass) {
      results.errors.push({
        studentId: student.id,
        error: `No matching class found for grade ${targetGradeId}`,
      })
      continue
    }

    const currentRoll = rollMap.get(targetClass.id) || 0
    const nextRoll = currentRoll + 1
    rollMap.set(targetClass.id, nextRoll)

    toInsert.push({
      id: nanoid(),
      studentId: student.id,
      classId: targetClass.id,
      schoolYearId: toYearId,
      enrollmentDate: today,
      rollNumber: nextRoll,
      status: options.autoConfirm ? 'confirmed' : 'pending',
      confirmedAt: options.autoConfirm ? new Date() : null,
      previousEnrollmentId: enrollment.id,
    } as EnrollmentInsert)
  }

  // 6. Execute Batch Insert
  if (toInsert.length > 0) {
    try {
      await db.insert(enrollments).values(toInsert)
      results.success = toInsert.length
    }
    catch {
      // If batch fails, we fall back to individual inserts to handle specific errors
      for (const item of toInsert) {
        try {
          await db.insert(enrollments).values(item)
          results.success++
        }
        catch (e) {
          results.errors.push({
            studentId: item.studentId,
            error: e instanceof Error ? e.message : 'Batch insertion failed',
          })
        }
      }
    }
  }

  return results
}

// ==================== Statistics ====================

export async function getEnrollmentStatistics(schoolId: string, schoolYearId: string) {
  const db = getDb()

  // Enrollments by status
  const byStatus = await db
    .select({
      status: enrollments.status,
      count: sql<number>`COUNT(*)`.as('count'),
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .where(and(eq(students.schoolId, schoolId), eq(enrollments.schoolYearId, schoolYearId)))
    .groupBy(enrollments.status)

  // Enrollments by grade
  const byGrade = await db
    .select({
      gradeId: grades.id,
      gradeName: grades.name,
      gradeOrder: grades.order,
      count: sql<number>`COUNT(*)`.as('count'),
      boys: sql<number>`COUNT(CASE WHEN ${students.gender} = 'M' THEN 1 END)`.as('boys'),
      girls: sql<number>`COUNT(CASE WHEN ${students.gender} = 'F' THEN 1 END)`.as('girls'),
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .where(
      and(
        eq(students.schoolId, schoolId),
        eq(enrollments.schoolYearId, schoolYearId),
        eq(enrollments.status, 'confirmed'),
      ),
    )
    .groupBy(grades.id, grades.name, grades.order)
    .orderBy(grades.order)

  // Enrollments by class
  const byClass = await db
    .select({
      classId: classes.id,
      className: sql<string>`CONCAT(${grades.name}, ' ', ${classes.section})`.as('class_name'),
      maxStudents: classes.maxStudents,
      count: sql<number>`COUNT(*)`.as('count'),
      boys: sql<number>`COUNT(CASE WHEN ${students.gender} = 'M' THEN 1 END)`.as('boys'),
      girls: sql<number>`COUNT(CASE WHEN ${students.gender} = 'F' THEN 1 END)`.as('girls'),
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(grades, eq(classes.gradeId, grades.id))
    .where(
      and(
        eq(students.schoolId, schoolId),
        eq(enrollments.schoolYearId, schoolYearId),
        eq(enrollments.status, 'confirmed'),
      ),
    )
    .groupBy(classes.id, grades.name, classes.section, classes.maxStudents, grades.order)
    .orderBy(grades.order, classes.section)

  // Enrollment trends (last 30 days)
  const trends = await db
    .select({
      date: sql<string>`DATE(${enrollments.enrollmentDate})`.as('date'),
      count: sql<number>`COUNT(*)`.as('count'),
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .where(
      and(
        eq(students.schoolId, schoolId),
        eq(enrollments.schoolYearId, schoolYearId),
        sql`${enrollments.enrollmentDate} >= CURRENT_DATE - INTERVAL '30 days'`,
      ),
    )
    .groupBy(sql`DATE(${enrollments.enrollmentDate})`)
    .orderBy(sql`DATE(${enrollments.enrollmentDate})`)

  return {
    byStatus,
    byGrade,
    byClass,
    trends,
    total: byStatus.reduce((sum: number, s: { count: number }) => sum + Number(s.count), 0),
    confirmed: Number(byStatus.find((s: { status: string }) => s.status === 'confirmed')?.count || 0),
    pending: Number(byStatus.find((s: { status: string }) => s.status === 'pending')?.count || 0),
  }
}
