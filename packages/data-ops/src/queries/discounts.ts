import type { Discount, DiscountInsert, DiscountType } from '../drizzle/school-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, asc, eq } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { discounts } from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'

export interface GetDiscountsParams {
  schoolId: string
  type?: DiscountType
  includeInactive?: boolean
}

export function getDiscounts(params: GetDiscountsParams): ResultAsync<Discount[], DatabaseError> {
  const db = getDb()
  const { schoolId, type, includeInactive = false } = params

  return ResultAsync.fromPromise(
    (async () => {
      const conditions = [eq(discounts.schoolId, schoolId)]
      if (type)
        conditions.push(eq(discounts.type, type))
      if (!includeInactive)
        conditions.push(eq(discounts.status, 'active'))

      return db.select().from(discounts).where(and(...conditions)).orderBy(asc(discounts.name))
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch discounts'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, type }))
}

export function getDiscountById(discountId: string): ResultAsync<Discount | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.select().from(discounts).where(eq(discounts.id, discountId)).limit(1).then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch discount by ID'),
  ).mapErr(tapLogErr(databaseLogger, { discountId }))
}

export function getDiscountByCode(schoolId: string, code: string): ResultAsync<Discount | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(discounts)
      .where(and(eq(discounts.schoolId, schoolId), eq(discounts.code, code)))
      .limit(1)
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch discount by code'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, code }))
}

export function getAutoApplyDiscounts(schoolId: string): ResultAsync<Discount[], DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(discounts)
      .where(and(eq(discounts.schoolId, schoolId), eq(discounts.autoApply, true), eq(discounts.status, 'active'))),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch auto-apply discounts'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId }))
}

export type CreateDiscountData = Omit<DiscountInsert, 'id' | 'createdAt' | 'updatedAt'>

export function createDiscount(data: CreateDiscountData): ResultAsync<Discount, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [discount] = await db.insert(discounts).values({ id: crypto.randomUUID(), ...data }).returning()
      if (!discount) {
        throw dbError('INTERNAL_ERROR', 'Failed to create discount')
      }
      return discount
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create discount'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId: data.schoolId, code: data.code }))
}

export type UpdateDiscountData = Partial<Omit<DiscountInsert, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>

export function updateDiscount(
  discountId: string,
  data: UpdateDiscountData,
): ResultAsync<Discount | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [discount] = await db
        .update(discounts)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(discounts.id, discountId))
        .returning()
      return discount
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to update discount'),
  ).mapErr(tapLogErr(databaseLogger, { discountId }))
}

export function deleteDiscount(discountId: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      await db.delete(discounts).where(eq(discounts.id, discountId))
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete discount'),
  ).mapErr(tapLogErr(databaseLogger, { discountId }))
}

export function deactivateDiscount(discountId: string): ResultAsync<Discount | undefined, DatabaseError> {
  return updateDiscount(discountId, { status: 'inactive' })
}
