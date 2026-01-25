import type { Discount, DiscountInsert, DiscountType } from '../drizzle/school-schema'
import { and, asc, eq } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { discounts } from '../drizzle/school-schema'

export interface GetDiscountsParams {
  schoolId: string
  type?: DiscountType
  includeInactive?: boolean
}

export async function getDiscounts(params: GetDiscountsParams): Promise<Discount[]> {
  const db = getDb()
  const { schoolId, type, includeInactive = false } = params
  const conditions = [eq(discounts.schoolId, schoolId)]
  if (type)
    conditions.push(eq(discounts.type, type))
  if (!includeInactive)
    conditions.push(eq(discounts.status, 'active'))

  return db.select().from(discounts).where(and(...conditions)).orderBy(asc(discounts.name))
}

export async function getDiscountById(discountId: string): Promise<Discount | null> {
  const db = getDb()
  const [discount] = await db.select().from(discounts).where(eq(discounts.id, discountId)).limit(1)
  return discount ?? null
}

export async function getDiscountByCode(schoolId: string, code: string): Promise<Discount | null> {
  const db = getDb()
  const [discount] = await db
    .select()
    .from(discounts)
    .where(and(eq(discounts.schoolId, schoolId), eq(discounts.code, code)))
    .limit(1)
  return discount ?? null
}

export async function getAutoApplyDiscounts(schoolId: string): Promise<Discount[]> {
  const db = getDb()
  return db
    .select()
    .from(discounts)
    .where(and(eq(discounts.schoolId, schoolId), eq(discounts.autoApply, true), eq(discounts.status, 'active')))
}

export type CreateDiscountData = Omit<DiscountInsert, 'id' | 'createdAt' | 'updatedAt'>

export async function createDiscount(data: CreateDiscountData): Promise<Discount> {
  const db = getDb()
  const [discount] = await db.insert(discounts).values({ id: crypto.randomUUID(), ...data }).returning()
  if (!discount) {
    throw new Error('Failed to create discount')
  }
  return discount
}

export type UpdateDiscountData = Partial<Omit<DiscountInsert, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>

export async function updateDiscount(
  discountId: string,
  data: UpdateDiscountData,
): Promise<Discount | undefined> {
  const db = getDb()
  const [discount] = await db
    .update(discounts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(discounts.id, discountId))
    .returning()
  return discount
}

export async function deleteDiscount(discountId: string): Promise<void> {
  const db = getDb()
  await db.delete(discounts).where(eq(discounts.id, discountId))
}

export async function deactivateDiscount(discountId: string): Promise<Discount | undefined> {
  return updateDiscount(discountId, { status: 'inactive' })
}
