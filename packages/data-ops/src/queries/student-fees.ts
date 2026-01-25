import type { FeeStatus, StudentFee, StudentFeeInsert } from '../drizzle/school-schema'
import { and, eq, gt, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { enrollments, feeStructures, feeTypes, studentFees } from '../drizzle/school-schema'

export interface GetStudentFeesParams {
  studentId?: string
  enrollmentId?: string
  status?: FeeStatus
}

export async function getStudentFees(params: GetStudentFeesParams): Promise<StudentFee[]> {
  const db = getDb()
  const { studentId, enrollmentId, status } = params
  const conditions = []
  if (studentId)
    conditions.push(eq(studentFees.studentId, studentId))
  if (enrollmentId)
    conditions.push(eq(studentFees.enrollmentId, enrollmentId))
  if (status)
    conditions.push(eq(studentFees.status, status))

  if (conditions.length === 0)
    return []
  return db.select().from(studentFees).where(and(...conditions))
}

export async function getStudentFeeById(studentFeeId: string): Promise<StudentFee | null> {
  const db = getDb()
  const [studentFee] = await db.select().from(studentFees).where(eq(studentFees.id, studentFeeId)).limit(1)
  return studentFee ?? null
}

export async function getStudentFeesWithDetails(studentId: string, schoolYearId: string) {
  const db = getDb()
  return db
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
}

export interface StudentFeeSummary {
  totalFees: number
  totalDiscounts: number
  totalPaid: number
  totalBalance: number
  feeCount: number
}

export async function getStudentFeeSummary(studentId: string, schoolYearId: string): Promise<StudentFeeSummary> {
  const db = getDb()
  const [result] = await db
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

  return {
    totalFees: Number.parseFloat(result?.totalFees ?? '0'),
    totalDiscounts: Number.parseFloat(result?.totalDiscounts ?? '0'),
    totalPaid: Number.parseFloat(result?.totalPaid ?? '0'),
    totalBalance: Number.parseFloat(result?.totalBalance ?? '0'),
    feeCount: result?.feeCount ?? 0,
  }
}

export type CreateStudentFeeData = Omit<StudentFeeInsert, 'id' | 'createdAt' | 'updatedAt'>

export async function createStudentFee(data: CreateStudentFeeData): Promise<StudentFee> {
  const db = getDb()
  const [studentFee] = await db.insert(studentFees).values({ id: crypto.randomUUID(), ...data }).returning()
  if (!studentFee) {
    throw new Error('Failed to create student fee')
  }
  return studentFee
}

export async function createStudentFeesBulk(dataList: CreateStudentFeeData[]): Promise<StudentFee[]> {
  const db = getDb()
  if (dataList.length === 0)
    return []
  const values = dataList.map(data => ({ id: crypto.randomUUID(), ...data }))
  return db.insert(studentFees).values(values).returning()
}

export async function waiveStudentFee(
  studentFeeId: string,
  waivedBy: string,
  reason: string,
): Promise<StudentFee | undefined> {
  const db = getDb()
  const [studentFee] = await db
    .update(studentFees)
    .set({ status: 'waived', waivedAt: new Date(), waivedBy, waiverReason: reason, balance: '0', updatedAt: new Date() })
    .where(eq(studentFees.id, studentFeeId))
    .returning()
  return studentFee
}

export async function getStudentsWithOutstandingBalance(_schoolId: string, schoolYearId: string) {
  const db = getDb()
  return db
    .select({
      studentId: studentFees.studentId,
      totalBalance: sql<string>`SUM(${studentFees.balance})`,
    })
    .from(studentFees)
    .innerJoin(enrollments, eq(studentFees.enrollmentId, enrollments.id))
    .where(and(eq(enrollments.schoolYearId, schoolYearId), gt(studentFees.balance, '0')))
    .groupBy(studentFees.studentId)
}
