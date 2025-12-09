import type { Receipt, ReceiptInsert } from '@/drizzle/school-schema'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb } from '@/database/setup'
import { receipts } from '@/drizzle/school-schema'

export interface GetReceiptsParams {
  paymentId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export async function getReceipts(params: GetReceiptsParams): Promise<Receipt[]> {
  const db = getDb()
  const { paymentId, startDate, endDate, page = 1, pageSize = 20 } = params
  const conditions = []
  if (paymentId)
    conditions.push(eq(receipts.paymentId, paymentId))
  if (startDate)
    conditions.push(gte(receipts.paymentDate, startDate))
  if (endDate)
    conditions.push(lte(receipts.paymentDate, endDate))

  return db
    .select()
    .from(receipts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(receipts.issuedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
}

export async function getReceiptById(receiptId: string): Promise<Receipt | null> {
  const db = getDb()
  const [receipt] = await db.select().from(receipts).where(eq(receipts.id, receiptId)).limit(1)
  return receipt ?? null
}

export async function getReceiptByPaymentId(paymentId: string): Promise<Receipt | null> {
  const db = getDb()
  const [receipt] = await db.select().from(receipts).where(eq(receipts.paymentId, paymentId)).limit(1)
  return receipt ?? null
}

export async function getReceiptByNumber(receiptNumber: string): Promise<Receipt | null> {
  const db = getDb()
  const [receipt] = await db.select().from(receipts).where(eq(receipts.receiptNumber, receiptNumber)).limit(1)
  return receipt ?? null
}

export type CreateReceiptData = Omit<ReceiptInsert, 'id' | 'createdAt'>

export async function createReceipt(data: CreateReceiptData): Promise<Receipt> {
  const db = getDb()
  const [receipt] = await db.insert(receipts).values({ id: nanoid(), ...data }).returning()
  return receipt
}

export async function recordReceiptReprint(receiptId: string, reprintedBy: string): Promise<Receipt> {
  const db = getDb()
  const [receipt] = await db
    .update(receipts)
    .set({
      reprintCount: db.select({ count: receipts.reprintCount }).from(receipts).where(eq(receipts.id, receiptId)),
      lastReprintedAt: new Date(),
      lastReprintedBy: reprintedBy,
    })
    .where(eq(receipts.id, receiptId))
    .returning()
  return receipt
}

export async function incrementReceiptReprint(receiptId: string, reprintedBy: string): Promise<Receipt> {
  const db = getDb()
  const existing = await getReceiptById(receiptId)
  if (!existing)
    throw new Error('Receipt not found')

  const [receipt] = await db
    .update(receipts)
    .set({
      reprintCount: (existing.reprintCount ?? 0) + 1,
      lastReprintedAt: new Date(),
      lastReprintedBy: reprintedBy,
    })
    .where(eq(receipts.id, receiptId))
    .returning()
  return receipt
}
