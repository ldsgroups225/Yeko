import type { FeeStructure, FeeStructureInsert } from '@/drizzle/school-schema'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb } from '@/database/setup'
import { feeStructures, feeTypes } from '@/drizzle/school-schema'

export interface GetFeeStructuresParams {
  schoolId: string
  schoolYearId: string
  gradeId?: string
  seriesId?: string
  feeTypeId?: string
}

export async function getFeeStructures(params: GetFeeStructuresParams): Promise<FeeStructure[]> {
  const db = getDb()
  const { schoolId, schoolYearId, gradeId, seriesId, feeTypeId } = params
  const conditions = [eq(feeStructures.schoolId, schoolId), eq(feeStructures.schoolYearId, schoolYearId)]
  if (gradeId) conditions.push(eq(feeStructures.gradeId, gradeId))
  if (seriesId) conditions.push(eq(feeStructures.seriesId, seriesId))
  if (feeTypeId) conditions.push(eq(feeStructures.feeTypeId, feeTypeId))

  return db.select().from(feeStructures).where(and(...conditions))
}

export async function getFeeStructureById(feeStructureId: string): Promise<FeeStructure | null> {
  const db = getDb()
  const [feeStructure] = await db.select().from(feeStructures).where(eq(feeStructures.id, feeStructureId)).limit(1)
  return feeStructure ?? null
}

export async function getFeeStructureForStudent(
  schoolId: string,
  schoolYearId: string,
  gradeId: string,
  seriesId: string | null,
  feeTypeId: string,
): Promise<FeeStructure | null> {
  const db = getDb()
  const conditions = [
    eq(feeStructures.schoolId, schoolId),
    eq(feeStructures.schoolYearId, schoolYearId),
    eq(feeStructures.gradeId, gradeId),
    eq(feeStructures.feeTypeId, feeTypeId),
  ]
  if (seriesId) conditions.push(eq(feeStructures.seriesId, seriesId))

  const [feeStructure] = await db.select().from(feeStructures).where(and(...conditions)).limit(1)
  return feeStructure ?? null
}

export type CreateFeeStructureData = Omit<FeeStructureInsert, 'id' | 'createdAt' | 'updatedAt'>

export async function createFeeStructure(data: CreateFeeStructureData): Promise<FeeStructure> {
  const db = getDb()
  const [feeStructure] = await db.insert(feeStructures).values({ id: nanoid(), ...data }).returning()
  return feeStructure
}

export async function createFeeStructuresBulk(dataList: CreateFeeStructureData[]): Promise<FeeStructure[]> {
  const db = getDb()
  if (dataList.length === 0) return []
  const values = dataList.map(data => ({ id: nanoid(), ...data }))
  return db.insert(feeStructures).values(values).returning()
}

export type UpdateFeeStructureData = Partial<Omit<FeeStructureInsert, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>

export async function updateFeeStructure(feeStructureId: string, data: UpdateFeeStructureData): Promise<FeeStructure> {
  const db = getDb()
  const [feeStructure] = await db
    .update(feeStructures)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(feeStructures.id, feeStructureId))
    .returning()
  return feeStructure
}

export async function deleteFeeStructure(feeStructureId: string): Promise<void> {
  const db = getDb()
  await db.delete(feeStructures).where(eq(feeStructures.id, feeStructureId))
}

export interface FeeStructureWithType extends FeeStructure {
  feeTypeName: string
  feeTypeCode: string
}

export async function getFeeStructuresWithTypes(params: GetFeeStructuresParams): Promise<FeeStructureWithType[]> {
  const db = getDb()
  const { schoolId, schoolYearId, gradeId } = params
  const conditions = [eq(feeStructures.schoolId, schoolId), eq(feeStructures.schoolYearId, schoolYearId)]
  if (gradeId) conditions.push(eq(feeStructures.gradeId, gradeId))

  const result = await db
    .select({
      feeStructure: feeStructures,
      feeTypeName: feeTypes.name,
      feeTypeCode: feeTypes.code,
    })
    .from(feeStructures)
    .innerJoin(feeTypes, eq(feeStructures.feeTypeId, feeTypes.id))
    .where(and(...conditions))

  return result.map((r: { feeStructure: FeeStructure, feeTypeName: string, feeTypeCode: string }) => ({ ...r.feeStructure, feeTypeName: r.feeTypeName, feeTypeCode: r.feeTypeCode }))
}
