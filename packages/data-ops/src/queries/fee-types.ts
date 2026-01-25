import type { FeeCategory, FeeType, FeeTypeInsert } from '../drizzle/school-schema'
import { getDb } from '../database/setup'
import { feeTypes } from '../drizzle/school-schema'
import { and, asc, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export interface GetFeeTypesParams {
  schoolId: string
  category?: FeeCategory
  includeInactive?: boolean
}

export async function getFeeTypes(params: GetFeeTypesParams): Promise<FeeType[]> {
  const db = getDb()
  const { schoolId, category, includeInactive = false } = params
  const conditions = [eq(feeTypes.schoolId, schoolId)]
  if (category)
    conditions.push(eq(feeTypes.category, category))
  if (!includeInactive)
    conditions.push(eq(feeTypes.status, 'active'))

  return db.select().from(feeTypes).where(and(...conditions)).orderBy(asc(feeTypes.displayOrder), asc(feeTypes.name))
}

export async function getFeeTypeById(feeTypeId: string): Promise<FeeType | null> {
  const db = getDb()
  const [feeType] = await db.select().from(feeTypes).where(eq(feeTypes.id, feeTypeId)).limit(1)
  return feeType ?? null
}

export async function getFeeTypeByCode(schoolId: string, code: string): Promise<FeeType | null> {
  const db = getDb()
  const [feeType] = await db
    .select()
    .from(feeTypes)
    .where(and(eq(feeTypes.schoolId, schoolId), eq(feeTypes.code, code)))
    .limit(1)
  return feeType ?? null
}

export type CreateFeeTypeData = Omit<FeeTypeInsert, 'id' | 'createdAt' | 'updatedAt'>

export async function createFeeType(data: CreateFeeTypeData): Promise<FeeType> {
  const db = getDb()
  const [feeType] = await db.insert(feeTypes).values({ id: nanoid(), ...data }).returning()
  if (!feeType) {
    throw new Error('Failed to create fee type')
  }
  return feeType
}

export type UpdateFeeTypeData = Partial<Omit<FeeTypeInsert, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>

export async function updateFeeType(feeTypeId: string, data: UpdateFeeTypeData): Promise<FeeType | undefined> {
  const db = getDb()
  const [feeType] = await db
    .update(feeTypes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(feeTypes.id, feeTypeId))
    .returning()
  return feeType
}

export async function deleteFeeType(feeTypeId: string): Promise<void> {
  const db = getDb()
  await db.delete(feeTypes).where(eq(feeTypes.id, feeTypeId))
}

export async function deactivateFeeType(feeTypeId: string): Promise<FeeType | undefined> {
  return updateFeeType(feeTypeId, { status: 'inactive' })
}
