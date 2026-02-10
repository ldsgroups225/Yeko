import type { FeeStatus, StudentFee, StudentFeeInsert } from '../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq, gt, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { grades } from '../drizzle/core-schema'
import { classes, enrollments, feeStructures, feeTypes, studentFees, students } from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'

export interface GetStudentFeesParams {
  studentId?: string
  enrollmentId?: string
  status?: FeeStatus
}

export async function getStudentFees(params: GetStudentFeesParams): R.ResultAsync<StudentFee[], DatabaseError> {
  const db = getDb()
  const { studentId, enrollmentId, status } = params

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const conditions = []
        if (studentId)
          conditions.push(eq(studentFees.studentId, studentId))
        if (enrollmentId)
          conditions.push(eq(studentFees.enrollmentId, enrollmentId))
        if (status)
          conditions.push(eq(studentFees.status, status))

        if (conditions.length === 0)
          return []

        return await db.select().from(studentFees).where(and(...conditions))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch student fees'),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId, enrollmentId })),
  )
}

export async function getStudentFeeById(studentFeeId: string): R.ResultAsync<StudentFee | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db
          .select()
          .from(studentFees)
          .where(eq(studentFees.id, studentFeeId))
          .limit(1)
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch student fee by ID'),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentFeeId })),
  )
}

export interface StudentFeeWithDetails {
  studentFee: StudentFee
  feeTypeName: string
  feeTypeCode: string
  feeTypeCategory: string
}

export async function getStudentFeesWithDetails(
  studentId: string,
  schoolYearId: string,
): R.ResultAsync<StudentFeeWithDetails[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const result = await db
          .select({
            studentFee: studentFees,
            feeTypeName: feeTypes.name,
            feeTypeCode: feeTypes.code,
            feeTypeCategory: feeTypes.category,
          })
          .from(studentFees)
          .innerJoin(feeStructures, eq(studentFees.feeStructureId, feeStructures.id))
          .innerJoin(feeTypes, eq(feeStructures.feeTypeId, feeTypes.id))
          .innerJoin(enrollments, eq(studentFees.enrollmentId, enrollments.id))
          .where(and(eq(studentFees.studentId, studentId), eq(enrollments.schoolYearId, schoolYearId)))

        return result as StudentFeeWithDetails[]
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch student fees with details'),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId, schoolYearId })),
  )
}

export interface StudentFeeSummary {
  totalFees: number
  totalDiscounts: number
  totalPaid: number
  totalBalance: number
  feeCount: number
}

export async function getStudentFeeSummary(
  studentId: string,
  schoolYearId: string,
): R.ResultAsync<StudentFeeSummary, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db
          .select({
            totalFees: sql<string>`COALESCE(SUM(${studentFees.finalAmount}), 0)`,
            totalDiscounts: sql<string>`COALESCE(SUM(${studentFees.discountAmount}), 0)`,
            totalPaid: sql<string>`COALESCE(SUM(${studentFees.paidAmount}), 0)`,
            totalBalance: sql<string>`COALESCE(SUM(${studentFees.balance}), 0)`,
            feeCount: sql<number>`COUNT(${studentFees.id})::int`,
          })
          .from(studentFees)
          .innerJoin(enrollments, eq(studentFees.enrollmentId, enrollments.id))
          .where(and(eq(studentFees.studentId, studentId), eq(enrollments.schoolYearId, schoolYearId)))

        const result = rows[0]
        return {
          totalFees: Number.parseFloat(result?.totalFees ?? '0'),
          totalDiscounts: Number.parseFloat(result?.totalDiscounts ?? '0'),
          totalPaid: Number.parseFloat(result?.totalPaid ?? '0'),
          totalBalance: Number.parseFloat(result?.totalBalance ?? '0'),
          feeCount: result?.feeCount ?? 0,
        }
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch student fee summary'),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId, schoolYearId })),
  )
}

export type CreateStudentFeeData = Omit<StudentFeeInsert, 'id' | 'createdAt' | 'updatedAt'>

export async function createStudentFee(data: CreateStudentFeeData): R.ResultAsync<StudentFee, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [studentFee] = await db
          .insert(studentFees)
          .values({ id: crypto.randomUUID(), ...data })
          .returning()

        if (!studentFee) {
          throw dbError('INTERNAL_ERROR', 'Failed to create student fee')
        }
        return studentFee
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create student fee'),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentId: data.studentId })),
  )
}

export async function createStudentFeesBulk(dataList: CreateStudentFeeData[]): R.ResultAsync<StudentFee[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        if (dataList.length === 0)
          return []

        const values = dataList.map(data => ({ id: crypto.randomUUID(), ...data }))
        return await db.insert(studentFees).values(values).returning()
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create student fees bulk'),
    }),
    R.mapError(tapLogErr(databaseLogger, { count: dataList.length })),
  )
}

export async function waiveStudentFee(
  studentFeeId: string,
  waivedBy: string,
  reason: string,
): R.ResultAsync<StudentFee | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [studentFee] = await db
          .update(studentFees)
          .set({ status: 'waived', waivedAt: new Date(), waivedBy, waiverReason: reason, balance: '0', updatedAt: new Date() })
          .where(eq(studentFees.id, studentFeeId))
          .returning()
        return studentFee
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to waive student fee'),
    }),
    R.mapError(tapLogErr(databaseLogger, { studentFeeId, waivedBy })),
  )
}

export interface OutstandingBalanceEntry {
  studentId: string
  firstName: string
  lastName: string
  matricule: string
  className: string
  totalBalance: string
}

export async function getStudentsWithOutstandingBalance(
  _schoolId: string,
  schoolYearId: string,
): R.ResultAsync<OutstandingBalanceEntry[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const result = await db
          .select({
            studentId: studentFees.studentId,
            firstName: students.firstName,
            lastName: students.lastName,
            matricule: students.matricule,
            className: sql<string>`concat(${grades.name}, ' ', ${classes.section})`,
            totalBalance: sql<string>`SUM(${studentFees.balance})`,
          })
          .from(studentFees)
          .innerJoin(enrollments, eq(studentFees.enrollmentId, enrollments.id))
          .innerJoin(students, eq(studentFees.studentId, students.id))
          .innerJoin(classes, eq(enrollments.classId, classes.id))
          .innerJoin(grades, eq(classes.gradeId, grades.id))
          .where(and(eq(enrollments.schoolYearId, schoolYearId), gt(studentFees.balance, '0')))
          .groupBy(studentFees.studentId, students.firstName, students.lastName, students.matricule, grades.name, classes.section)

        return result as OutstandingBalanceEntry[]
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch students with outstanding balance'),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolYearId })),
  )
}
