import type { Enrollment, EnrollmentInsert } from '../../drizzle/school-schema'
import type { CreateEnrollmentInput, TransferInput } from './types'
import crypto from 'node:crypto'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, ne, sql } from 'drizzle-orm'
import { getDb } from '../../database/setup'
import { classes, enrollments } from '../../drizzle/school-schema'
import { DatabaseError, dbError } from '../../errors'

// ==================== CRUD Operations ====================
export async function createEnrollment(data: CreateEnrollmentInput): R.ResultAsync<Enrollment, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
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
          throw dbError('CONFLICT', 'Student is already enrolled for this school year')
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
          throw dbError('VALIDATION_ERROR', 'Class has reached maximum capacity')
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
            id: crypto.randomUUID(),
            ...data,
            enrollmentDate: data.enrollmentDate || new Date().toISOString().split('T')[0],
            rollNumber,
            status: 'pending',
          } as EnrollmentInsert)
          .returning()
        if (!enrollment) {
          throw dbError('INTERNAL_ERROR', 'Failed to create enrollment')
        }
        return enrollment
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create enrollment'),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId: data.studentId, classId: data.classId })),
  )
}

export async function confirmEnrollment(id: string, userId: string): R.ResultAsync<Enrollment, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
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
          throw dbError('NOT_FOUND', `Enrollment with ID ${id} not found`)
        }
        return enrollment
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to confirm enrollment'),
    }),
    R.mapError(tapLogErr(databaseLogger, { enrollmentId: id, userId })),
  )
}

export async function cancelEnrollment(id: string, userId: string, reason?: string): R.ResultAsync<Enrollment, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
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
          throw dbError('NOT_FOUND', `Enrollment with ID ${id} not found`)
        }
        return enrollment
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to cancel enrollment'),
    }),
    R.mapError(tapLogErr(databaseLogger, { enrollmentId: id, userId })),
  )
}

export async function deleteEnrollment(id: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        // Only allow deletion of pending enrollments
        const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, id))
        if (!enrollment) {
          throw dbError('NOT_FOUND', `Enrollment with ID ${id} not found`)
        }
        if (enrollment.status !== 'pending') {
          throw dbError('VALIDATION_ERROR', 'Can only delete pending enrollments. Use cancel for confirmed enrollments.')
        }
        await db.delete(enrollments).where(eq(enrollments.id, id))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete enrollment'),
    }),
    R.mapError(tapLogErr(databaseLogger, { enrollmentId: id })),
  )
}

// ==================== Transfer ====================
export async function transferStudent(data: TransferInput, userId: string): R.ResultAsync<Enrollment, DatabaseError> {
  const db = getDb()
  const { enrollmentId, newClassId, reason, effectiveDate } = data
  return R.pipe(
    R.try({
      try: async () => {
        // Get current enrollment
        const [currentEnrollment] = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId))
        if (!currentEnrollment) {
          throw dbError('NOT_FOUND', 'Enrollment not found')
        }
        if (currentEnrollment.status !== 'confirmed') {
          throw dbError('VALIDATION_ERROR', 'Can only transfer confirmed enrollments')
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
          throw dbError('VALIDATION_ERROR', 'Target class has reached maximum capacity')
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
            id: crypto.randomUUID(),
            studentId: currentEnrollment.studentId,
            classId: newClassId,
            schoolYearId: currentEnrollment.schoolYearId,
            enrollmentDate: effectiveDate || new Date().toISOString().split('T')[0],
            rollNumber: (lastRoll[0]?.maxRoll || 0) + 1,
            status: 'confirmed',
            confirmedAt: new Date(),
            confirmedBy: userId,
            previousEnrollmentId: enrollmentId,
          } as EnrollmentInsert)
          .returning()
        if (!newEnrollment) {
          throw dbError('INTERNAL_ERROR', 'Failed to create new enrollment for transfer')
        }
        return newEnrollment
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to transfer student'),
    }),
    R.mapError(tapLogErr(databaseLogger, { enrollmentId: data.enrollmentId, newClassId: data.newClassId, userId })),
  )
}
