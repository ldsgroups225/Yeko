import type { FeeStructure, FeeStructureInsert } from '../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { grades, series } from '../drizzle/core-schema'
import { feeStructures, feeTypes } from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

export interface GetFeeStructuresParams {
  schoolId: string
  schoolYearId: string
  gradeId?: string
  seriesId?: string
  feeTypeId?: string
}

export async function getFeeStructures(
  params: GetFeeStructuresParams,
): R.ResultAsync<FeeStructure[], DatabaseError> {
  const db = getDb()
  const { schoolId, schoolYearId, gradeId, seriesId, feeTypeId } = params

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const conditions = [
          eq(feeStructures.schoolId, schoolId),
          eq(feeStructures.schoolYearId, schoolYearId),
        ]
        if (gradeId)
          conditions.push(eq(feeStructures.gradeId, gradeId))
        if (seriesId)
          conditions.push(eq(feeStructures.seriesId, seriesId))
        if (feeTypeId)
          conditions.push(eq(feeStructures.feeTypeId, feeTypeId))

        return await db
          .select()
          .from(feeStructures)
          .where(and(...conditions))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, schoolYearId })),
  )
}

export async function getFeeStructureById(
  feeStructureId: string,
): R.ResultAsync<FeeStructure | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db
          .select()
          .from(feeStructures)
          .where(eq(feeStructures.id, feeStructureId))
          .limit(1)
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.fetchByIdFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { feeStructureId })),
  )
}

export async function getFeeStructureForStudent(
  schoolId: string,
  schoolYearId: string,
  gradeId: string,
  seriesId: string | null,
  feeTypeId: string,
): R.ResultAsync<FeeStructure | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const conditions = [
          eq(feeStructures.schoolId, schoolId),
          eq(feeStructures.schoolYearId, schoolYearId),
          eq(feeStructures.gradeId, gradeId),
          eq(feeStructures.feeTypeId, feeTypeId),
        ]
        if (seriesId)
          conditions.push(eq(feeStructures.seriesId, seriesId))

        const [feeStructure] = await db
          .select()
          .from(feeStructures)
          .where(and(...conditions))
          .limit(1)
        return feeStructure ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.fetchForStudentFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, schoolYearId, gradeId, feeTypeId })),
  )
}

export type CreateFeeStructureData = Omit<
  FeeStructureInsert,
  'id' | 'createdAt' | 'updatedAt'
>

export async function createFeeStructure(
  data: CreateFeeStructureData,
): R.ResultAsync<FeeStructure, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [feeStructure] = await db
          .insert(feeStructures)
          .values({ id: crypto.randomUUID(), ...data })
          .returning()
        if (!feeStructure) {
          throw dbError('INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.createFailed'))
        }
        return feeStructure
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.createFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId: data.schoolId, schoolYearId: data.schoolYearId })),
  )
}

export async function createFeeStructuresBulk(
  dataList: CreateFeeStructureData[],
): R.ResultAsync<FeeStructure[], DatabaseError> {
  if (dataList.length === 0)
    return R.succeed([])

  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const values = dataList.map(data => ({ id: crypto.randomUUID(), ...data }))
        return await db.insert(feeStructures).values(values).returning()
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.bulkCreateFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { count: dataList.length })),
  )
}

export type UpdateFeeStructureData = Partial<
  Omit<FeeStructureInsert, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>
>

export async function updateFeeStructure(
  feeStructureId: string,
  data: UpdateFeeStructureData,
): R.ResultAsync<FeeStructure | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [feeStructure] = await db
          .update(feeStructures)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(feeStructures.id, feeStructureId))
          .returning()
        return feeStructure
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.updateFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { feeStructureId })),
  )
}

export async function deleteFeeStructure(
  feeStructureId: string,
): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        await db.delete(feeStructures).where(eq(feeStructures.id, feeStructureId))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.deleteFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { feeStructureId })),
  )
}

export interface FeeStructureWithDetails extends FeeStructure {
  feeTypeName: string
  feeTypeCode: string
  gradeName?: string | null
  seriesName?: string | null
}

export async function getFeeStructuresWithTypes(
  params: GetFeeStructuresParams,
): R.ResultAsync<FeeStructureWithDetails[], DatabaseError> {
  const db = getDb()
  const { schoolId, schoolYearId, gradeId, seriesId, feeTypeId } = params

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const conditions = [
          eq(feeStructures.schoolId, schoolId),
          eq(feeStructures.schoolYearId, schoolYearId),
        ]
        if (gradeId)
          conditions.push(eq(feeStructures.gradeId, gradeId))
        if (seriesId)
          conditions.push(eq(feeStructures.seriesId, seriesId))
        if (feeTypeId)
          conditions.push(eq(feeStructures.feeTypeId, feeTypeId))

        const result = await db
          .select({
            feeStructure: feeStructures,
            feeTypeName: feeTypes.name,
            feeTypeCode: feeTypes.code,
            gradeName: grades.name,
            seriesName: series.name,
          })
          .from(feeStructures)
          .innerJoin(feeTypes, eq(feeStructures.feeTypeId, feeTypes.id))
          .leftJoin(grades, eq(feeStructures.gradeId, grades.id))
          .leftJoin(series, eq(feeStructures.seriesId, series.id))
          .where(and(...conditions))

        return result.map(r => ({
          ...r.feeStructure,
          feeTypeName: r.feeTypeName,
          feeTypeCode: r.feeTypeCode,
          gradeName: r.gradeName,
          seriesName: r.seriesName,
        }))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.fetchWithDetailsFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, schoolYearId })),
  )
}
