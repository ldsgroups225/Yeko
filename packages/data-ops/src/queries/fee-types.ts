import type { FeeCategory, FeeType, FeeTypeInsert } from '../drizzle/school-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, asc, eq } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { feeTypes } from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'

export interface GetFeeTypesParams {
  schoolId: string
  category?: FeeCategory
  includeInactive?: boolean
}

export function getFeeTypes(params: GetFeeTypesParams): ResultAsync<FeeType[], DatabaseError> {
  const db = getDb()
  const { schoolId, category, includeInactive = false } = params

  return ResultAsync.fromPromise(
    (async () => {
      const conditions = [eq(feeTypes.schoolId, schoolId)]
      if (category)
        conditions.push(eq(feeTypes.category, category))
      if (!includeInactive)
        conditions.push(eq(feeTypes.status, 'active'))

      return db.select().from(feeTypes).where(and(...conditions)).orderBy(asc(feeTypes.displayOrder), asc(feeTypes.name))
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch fee types'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, category }))
}

export function getFeeTypeById(feeTypeId: string): ResultAsync<FeeType | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.select().from(feeTypes).where(eq(feeTypes.id, feeTypeId)).limit(1).then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch fee type by ID'),
  ).mapErr(tapLogErr(databaseLogger, { feeTypeId }))
}

export function getFeeTypeByCode(schoolId: string, code: string): ResultAsync<FeeType | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(feeTypes)
      .where(and(eq(feeTypes.schoolId, schoolId), eq(feeTypes.code, code)))
      .limit(1)
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch fee type by code'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, code }))
}

export type CreateFeeTypeData = Omit<FeeTypeInsert, 'id' | 'createdAt' | 'updatedAt'>

export function createFeeType(data: CreateFeeTypeData): ResultAsync<FeeType, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [feeType] = await db.insert(feeTypes).values({ id: crypto.randomUUID(), ...data }).returning()
      if (!feeType) {
        throw dbError('INTERNAL_ERROR', 'Failed to create fee type')
      }
      return feeType
    })(),
    (err) => {
      // Check for PostgreSQL unique constraint violations
      const pgError = err as { code?: string, constraint?: string, detail?: string }
      if (pgError.code === '23505') { // unique_violation
        if (pgError.constraint?.includes('code')) {
          return new DatabaseError('CONFLICT', `Le code "${data.code}" existe déjà pour cet établissement`, { code: data.code })
        }
        if (pgError.constraint?.includes('template')) {
          return new DatabaseError('CONFLICT', 'Ce type de frais a déjà été importé depuis ce modèle', { templateId: data.feeTypeTemplateId })
        }
        return new DatabaseError('CONFLICT', 'Un type de frais avec ces informations existe déjà')
      }
      return DatabaseError.from(err, 'INTERNAL_ERROR', 'Échec de la création du type de frais')
    },
  ).mapErr(tapLogErr(databaseLogger, { schoolId: data.schoolId, code: data.code }))
}

export type UpdateFeeTypeData = Partial<Omit<FeeTypeInsert, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>

export function updateFeeType(feeTypeId: string, data: UpdateFeeTypeData): ResultAsync<FeeType | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [feeType] = await db
        .update(feeTypes)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(feeTypes.id, feeTypeId))
        .returning()
      return feeType
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to update fee type'),
  ).mapErr(tapLogErr(databaseLogger, { feeTypeId }))
}

export function deleteFeeType(feeTypeId: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      await db.delete(feeTypes).where(eq(feeTypes.id, feeTypeId))
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete fee type'),
  ).mapErr(tapLogErr(databaseLogger, { feeTypeId }))
}

export function deactivateFeeType(feeTypeId: string): ResultAsync<FeeType | undefined, DatabaseError> {
  return updateFeeType(feeTypeId, { status: 'inactive' })
}
