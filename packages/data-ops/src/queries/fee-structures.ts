import type { FeeStructure, FeeStructureInsert } from '../drizzle/school-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, eq } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
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

export function getFeeStructures(
  params: GetFeeStructuresParams,
): ResultAsync<FeeStructure[], DatabaseError> {
  const db = getDb()
  const { schoolId, schoolYearId, gradeId, seriesId, feeTypeId } = params

  return ResultAsync.fromPromise(
    (async () => {
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

      return db
        .select()
        .from(feeStructures)
        .where(and(...conditions))
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.fetchFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, schoolYearId }))
}

export function getFeeStructureById(
  feeStructureId: string,
): ResultAsync<FeeStructure | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(feeStructures)
      .where(eq(feeStructures.id, feeStructureId))
      .limit(1)
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.fetchByIdFailed')),
  ).mapErr(tapLogErr(databaseLogger, { feeStructureId }))
}

export function getFeeStructureForStudent(
  schoolId: string,
  schoolYearId: string,
  gradeId: string,
  seriesId: string | null,
  feeTypeId: string,
): ResultAsync<FeeStructure | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.fetchForStudentFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, schoolYearId, gradeId, feeTypeId }))
}

export type CreateFeeStructureData = Omit<
  FeeStructureInsert,
  'id' | 'createdAt' | 'updatedAt'
>

export function createFeeStructure(
  data: CreateFeeStructureData,
): ResultAsync<FeeStructure, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [feeStructure] = await db
        .insert(feeStructures)
        .values({ id: crypto.randomUUID(), ...data })
        .returning()
      if (!feeStructure) {
        throw dbError('INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.createFailed'))
      }
      return feeStructure
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.createFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolId: data.schoolId, schoolYearId: data.schoolYearId }))
}

export function createFeeStructuresBulk(
  dataList: CreateFeeStructureData[],
): ResultAsync<FeeStructure[], DatabaseError> {
  const db = getDb()
  if (dataList.length === 0)
    return ResultAsync.fromPromise(Promise.resolve([]), err => DatabaseError.from(err))

  return ResultAsync.fromPromise(
    (async () => {
      const values = dataList.map(data => ({ id: crypto.randomUUID(), ...data }))
      return db.insert(feeStructures).values(values).returning()
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.bulkCreateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { count: dataList.length }))
}

export type UpdateFeeStructureData = Partial<
  Omit<FeeStructureInsert, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>
>

export function updateFeeStructure(
  feeStructureId: string,
  data: UpdateFeeStructureData,
): ResultAsync<FeeStructure | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [feeStructure] = await db
        .update(feeStructures)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(feeStructures.id, feeStructureId))
        .returning()
      return feeStructure
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.updateFailed')),
  ).mapErr(tapLogErr(databaseLogger, { feeStructureId }))
}

export function deleteFeeStructure(
  feeStructureId: string,
): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      await db.delete(feeStructures).where(eq(feeStructures.id, feeStructureId))
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.deleteFailed')),
  ).mapErr(tapLogErr(databaseLogger, { feeStructureId }))
}

export interface FeeStructureWithDetails extends FeeStructure {
  feeTypeName: string
  feeTypeCode: string
  gradeName?: string | null
  seriesName?: string | null
}

export function getFeeStructuresWithTypes(
  params: GetFeeStructuresParams,
): ResultAsync<FeeStructureWithDetails[], DatabaseError> {
  const db = getDb()
  const { schoolId, schoolYearId, gradeId, seriesId, feeTypeId } = params

  return ResultAsync.fromPromise(
    (async () => {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'feeStructure.fetchWithDetailsFailed')),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, schoolYearId }))
}
