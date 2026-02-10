import type { Discount, DiscountInsert, DiscountType } from '../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, asc, eq } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { discounts } from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'

export interface GetDiscountsParams {
  schoolId: string
  type?: DiscountType
  includeInactive?: boolean
}

export function getDiscounts(params: GetDiscountsParams): R.ResultAsync<Discount[], DatabaseError> {
  const db = getDb()
  const { schoolId, type, includeInactive = false } = params

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const conditions = [eq(discounts.schoolId, schoolId)]
        if (type)
          conditions.push(eq(discounts.type, type))
        if (!includeInactive)
          conditions.push(eq(discounts.status, 'active'))

        return db.select().from(discounts).where(and(...conditions)).orderBy(asc(discounts.name))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch discounts'),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, type })),
  )
}

export function getDiscountById(discountId: string): R.ResultAsync<Discount | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: () => db.select().from(discounts).where(eq(discounts.id, discountId)).limit(1).then(rows => rows[0] ?? null),
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch discount by ID'),
    }),
    R.mapError(tapLogErr(databaseLogger, { discountId })),
  )
}

export function getDiscountByCode(schoolId: string, code: string): R.ResultAsync<Discount | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: () =>
        db
          .select()
          .from(discounts)
          .where(and(eq(discounts.schoolId, schoolId), eq(discounts.code, code)))
          .limit(1)
          .then(rows => rows[0] ?? null),
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch discount by code'),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, code })),
  )
}

export function getAutoApplyDiscounts(schoolId: string): R.ResultAsync<Discount[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: () =>
        db
          .select()
          .from(discounts)
          .where(and(eq(discounts.schoolId, schoolId), eq(discounts.autoApply, true), eq(discounts.status, 'active'))),
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch auto-apply discounts'),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId })),
  )
}

export type CreateDiscountData = Omit<DiscountInsert, 'id' | 'createdAt' | 'updatedAt'>

export async function createDiscount(data: CreateDiscountData): R.ResultAsync<Discount, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [discount] = await db.insert(discounts).values({ id: crypto.randomUUID(), ...data }).returning()
        if (!discount) {
          throw dbError('INTERNAL_ERROR', 'Failed to create discount')
        }
        return discount
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create discount'),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId: data.schoolId, code: data.code })),
  )
}

export type UpdateDiscountData = Partial<Omit<DiscountInsert, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>

export async function updateDiscount(
  discountId: string,
  data: UpdateDiscountData,
): R.ResultAsync<Discount | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [discount] = await db
          .update(discounts)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(discounts.id, discountId))
          .returning()
        return discount
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to update discount'),
    }),
    R.mapError(tapLogErr(databaseLogger, { discountId })),
  )
}

export async function deleteDiscount(discountId: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        await db.delete(discounts).where(eq(discounts.id, discountId))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete discount'),
    }),
    R.mapError(tapLogErr(databaseLogger, { discountId })),
  )
}

export function deactivateDiscount(discountId: string): R.ResultAsync<Discount | undefined, DatabaseError> {
  return updateDiscount(discountId, { status: 'inactive' })
}
