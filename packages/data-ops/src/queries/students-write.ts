import type { StudentInsert, StudentStatus } from '../drizzle/school-schema'
import type { CreateStudentInput } from './students-types'
import crypto from 'node:crypto'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { schools } from '../drizzle/core-schema'
import {
  enrollments,
  matriculeSequences,
  schoolYears,
  students,
} from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

function calculateAge(dob: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()))
    age--
  return age
}

export async function generateMatricule(schoolId: string, schoolYearId: string): R.ResultAsync<string, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [updatedSequence] = await db.update(matriculeSequences).set({ lastNumber: sql`${matriculeSequences.lastNumber} + 1`, updatedAt: new Date() }).where(and(eq(matriculeSequences.schoolId, schoolId), eq(matriculeSequences.schoolYearId, schoolYearId))).returning()

        if (updatedSequence) {
          const paddedNumber = updatedSequence.lastNumber.toString().padStart(4, '0')
          const year = updatedSequence.format.match(/\d{2}/)?.[0] || new Date().getFullYear().toString().slice(-2)
          return `${updatedSequence.prefix}${year}${paddedNumber}`
        }

        const [[school], [schoolYear]] = await Promise.all([
          db.select().from(schools).where(eq(schools.id, schoolId)),
          db.select().from(schoolYears).where(eq(schoolYears.id, schoolYearId)),
        ])
        const prefix = school?.code?.substring(0, 2).toUpperCase() || 'XX'
        const year = new Date(schoolYear?.startDate || new Date()).getFullYear().toString().slice(-2)
        const format = `${prefix}${year}{sequence:4}`

        try {
          await db.insert(matriculeSequences).values({ id: crypto.randomUUID(), schoolId, schoolYearId, prefix, lastNumber: 1, format })
          return `${prefix}${year}0001`
        }
        catch (insertError: any) {
          if (insertError?.code === '23505') {
            const [retrySequence] = await db.update(matriculeSequences).set({ lastNumber: sql`${matriculeSequences.lastNumber} + 1`, updatedAt: new Date() }).where(and(eq(matriculeSequences.schoolId, schoolId), eq(matriculeSequences.schoolYearId, schoolYearId))).returning()
            if (retrySequence)
              return `${retrySequence.prefix}${retrySequence.format.match(/\d{2}/)?.[0] || new Date().getFullYear().toString().slice(-2)}${retrySequence.lastNumber.toString().padStart(4, '0')}`
          }
          throw insertError
        }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('students', 'generateMatriculeFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, schoolYearId })),
  )
}

export async function createStudent(data: CreateStudentInput): R.ResultAsync<typeof students.$inferSelect, DatabaseError> {
  const db = getDb()
  const { schoolId, schoolYearId, ...studentData } = data
  return R.pipe(
    R.try({
      try: async () => {
        let matricule = data.matricule
        if (!matricule) {
          let yearId: string = schoolYearId || ''
          if (!yearId) {
            const [activeYear] = await db.select().from(schoolYears).where(and(eq(schoolYears.schoolId, schoolId), eq(schoolYears.isActive, true)))
            if (!activeYear)
              throw dbError('VALIDATION_ERROR', getNestedErrorMessage('students', 'noActiveSchoolYear'))
            yearId = activeYear.id
          }
          const res = await generateMatricule(schoolId, yearId)
          if (R.isFailure(res))
            throw res.error
          matricule = res.value
        }
        const [existing] = await db.select().from(students).where(and(eq(students.schoolId, schoolId), eq(students.matricule, matricule)))
        if (existing)
          throw dbError('CONFLICT', getNestedErrorMessage('students', 'matriculeExistsWithId', { matricule }))
        if (data.dob && (calculateAge(new Date(data.dob)) < 3 || calculateAge(new Date(data.dob)) > 30))
          throw dbError('VALIDATION_ERROR', getNestedErrorMessage('students', 'invalidAgeRange'))

        const [student] = await db.insert(students).values({ id: crypto.randomUUID(), schoolId, ...studentData, matricule, admissionDate: data.admissionDate || new Date().toISOString().split('T')[0] } as StudentInsert).returning()
        if (!student)
          throw new DatabaseError('INTERNAL_ERROR', getNestedErrorMessage('students', 'createFailed'))
        return student
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('students', 'createFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId: data.schoolId })),
  )
}

export async function updateStudent(id: string, data: Partial<CreateStudentInput>): R.ResultAsync<typeof students.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [student] = await db.update(students).set({ ...data, updatedAt: new Date() }).where(eq(students.id, id)).returning()
        if (!student)
          throw new DatabaseError('NOT_FOUND', getNestedErrorMessage('students', 'notFound'))
        if (data.status && data.status !== 'active')
          await db.update(enrollments).set({ status: 'cancelled', cancelledAt: new Date(), cancellationReason: `Student ${data.status}`, updatedAt: new Date() }).where(and(eq(enrollments.studentId, id), eq(enrollments.status, 'confirmed')))
        return student
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('students', 'updateFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId: id })),
  )
}

export async function updateStudentStatus(id: string, status: StudentStatus, reason?: string): R.ResultAsync<typeof students.$inferSelect, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [student] = await db.update(students).set({ status, withdrawalReason: reason, withdrawalDate: status === 'withdrawn' ? new Date().toISOString().split('T')[0] : null, updatedAt: new Date() }).where(eq(students.id, id)).returning()
        if (!student)
          throw new DatabaseError('NOT_FOUND', getNestedErrorMessage('students', 'notFound'))
        if (status !== 'active')
          await db.update(enrollments).set({ status: 'cancelled', cancelledAt: new Date(), cancellationReason: reason || `Student ${status}`, updatedAt: new Date() }).where(and(eq(enrollments.studentId, id), eq(enrollments.status, 'confirmed')))
        return student
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('students', 'updateStatusFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId: id, status })),
  )
}

export async function deleteStudent(id: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(R.try({ try: async () => {
    const [s] = await db.select().from(students).where(eq(students.id, id))
    if (!s)
      throw new DatabaseError('NOT_FOUND', getNestedErrorMessage('students', 'notFound'))
    await db.delete(students).where(eq(students.id, id))
  }, catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('students', 'deleteFailed')) }), R.mapError(tapLogErr(databaseLogger, { studentId: id })))
}
