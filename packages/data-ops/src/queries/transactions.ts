import type { Transaction, TransactionInsert, TransactionLine, TransactionLineInsert, TransactionStatus, TransactionType } from '../drizzle/school-schema'
import { getDb } from '../database/setup'
import { accounts, transactionLines, transactions } from '../drizzle/school-schema'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export interface GetTransactionsParams {
  schoolId: string
  fiscalYearId?: string
  type?: TransactionType
  status?: TransactionStatus
  startDate?: string
  endDate?: string
  studentId?: string
  page?: number
  pageSize?: number
}

export interface PaginatedTransactions {
  data: Transaction[]
  total: number
  page: number
  pageSize: number
}

export async function getTransactions(params: GetTransactionsParams): Promise<PaginatedTransactions> {
  const db = getDb()
  const { schoolId, fiscalYearId, type, status, startDate, endDate, studentId, page = 1, pageSize = 20 } = params
  const conditions = [eq(transactions.schoolId, schoolId)]
  if (fiscalYearId)
    conditions.push(eq(transactions.fiscalYearId, fiscalYearId))
  if (type)
    conditions.push(eq(transactions.type, type))
  if (status)
    conditions.push(eq(transactions.status, status))
  if (startDate)
    conditions.push(gte(transactions.date, startDate))
  if (endDate)
    conditions.push(lte(transactions.date, endDate))
  if (studentId)
    conditions.push(eq(transactions.studentId, studentId))

  const [data, countResult] = await Promise.all([
    db.select().from(transactions).where(and(...conditions)).orderBy(desc(transactions.date), desc(transactions.createdAt)).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(transactions).where(and(...conditions)),
  ])

  return { data, total: countResult[0]?.count ?? 0, page, pageSize }
}

export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  const db = getDb()
  const [transaction] = await db.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1)
  return transaction ?? null
}

export async function getTransactionWithLines(transactionId: string): Promise<{ transaction: Transaction, lines: TransactionLine[] } | null> {
  const db = getDb()
  const [transaction] = await db.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1)
  if (!transaction)
    return null

  const lines = await db.select().from(transactionLines).where(eq(transactionLines.transactionId, transactionId)).orderBy(transactionLines.lineNumber)
  return { transaction, lines }
}

export async function generateTransactionNumber(schoolId: string): Promise<string> {
  const db = getDb()
  const year = new Date().getFullYear()
  const prefix = `TXN-${year}-`

  const [lastTxn] = await db
    .select({ transactionNumber: transactions.transactionNumber })
    .from(transactions)
    .where(and(eq(transactions.schoolId, schoolId), sql`${transactions.transactionNumber} LIKE ${`${prefix}%`}`))
    .orderBy(desc(transactions.transactionNumber))
    .limit(1)

  let nextNumber = 1
  if (lastTxn?.transactionNumber) {
    const lastNum = Number.parseInt(lastTxn.transactionNumber.replace(prefix, ''), 10)
    if (!Number.isNaN(lastNum))
      nextNumber = lastNum + 1
  }

  return `${prefix}${nextNumber.toString().padStart(5, '0')}`
}

export type CreateTransactionData = Omit<TransactionInsert, 'id' | 'transactionNumber' | 'createdAt' | 'updatedAt'>
export type CreateTransactionLineData = Omit<TransactionLineInsert, 'id' | 'transactionId' | 'createdAt'>

export interface CreateTransactionWithLinesData extends CreateTransactionData {
  lines: CreateTransactionLineData[]
}

export async function createTransactionWithLines(
  data: CreateTransactionWithLinesData,
): Promise<{ transaction: Transaction, lines: TransactionLine[] }> {
  const db = getDb()
  const { lines: linesData, ...transactionData } = data

  // Validate double-entry: debits must equal credits
  const totalDebits = linesData.reduce((sum, l) => sum + Number.parseFloat(l.debitAmount ?? '0'), 0)
  const totalCredits = linesData.reduce((sum, l) => sum + Number.parseFloat(l.creditAmount ?? '0'), 0)
  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    throw new Error(`Transaction not balanced: debits (${totalDebits}) != credits (${totalCredits})`)
  }

  return db.transaction(async (tx: any) => {
    const transactionNumber = await generateTransactionNumber(transactionData.schoolId)

    const [transaction] = await tx
      .insert(transactions)
      .values({ id: nanoid(), transactionNumber, ...transactionData })
      .returning()
    if (!transaction) {
      throw new Error('Failed to create transaction')
    }

    const createdLines: TransactionLine[] = []
    for (let i = 0; i < linesData.length; i++) {
      const lineData = linesData[i]!
      const [line] = await tx
        .insert(transactionLines)
        .values({ id: nanoid(), transactionId: transaction.id, ...lineData, lineNumber: i + 1 })
        .returning()
      if (!line) {
        throw new Error('Failed to create transaction line')
      }
      createdLines.push(line)

      // Update account balance
      const debit = Number.parseFloat(lineData.debitAmount ?? '0')
      const credit = Number.parseFloat(lineData.creditAmount ?? '0')
      const [account] = await tx.select().from(accounts).where(eq(accounts.id, lineData.accountId)).limit(1)
      if (account) {
        const balanceChange = account.normalBalance === 'debit' ? debit - credit : credit - debit
        await tx
          .update(accounts)
          .set({ balance: sql`${accounts.balance} + ${balanceChange}`, updatedAt: new Date() })
          .where(eq(accounts.id, lineData.accountId))
      }
    }

    return { transaction, lines: createdLines }
  })
}

export async function voidTransaction(
  transactionId: string,
  voidedBy: string,
  voidReason: string,
): Promise<Transaction | undefined> {
  const db = getDb()
  return db.transaction(async (tx: any) => {
    const txnWithLines = await getTransactionWithLines(transactionId)
    if (!txnWithLines)
      throw new Error('Transaction not found')
    if (txnWithLines.transaction.status === 'voided')
      throw new Error('Transaction already voided')

    // Reverse account balances
    for (const line of txnWithLines.lines) {
      const debit = Number.parseFloat(line.debitAmount ?? '0')
      const credit = Number.parseFloat(line.creditAmount ?? '0')
      const [account] = await tx.select().from(accounts).where(eq(accounts.id, line.accountId)).limit(1)
      if (account) {
        const balanceChange = account.normalBalance === 'debit' ? credit - debit : debit - credit
        await tx
          .update(accounts)
          .set({ balance: sql`${accounts.balance} + ${balanceChange}`, updatedAt: new Date() })
          .where(eq(accounts.id, line.accountId))
      }
    }

    const [voidedTxn] = await tx
      .update(transactions)
      .set({ status: 'voided', voidedAt: new Date(), voidedBy, voidReason, updatedAt: new Date() })
      .where(eq(transactions.id, transactionId))
      .returning()
    if (!voidedTxn) {
      throw new Error('Failed to void transaction')
    }
    return voidedTxn
  })
}

export async function getTransactionLinesByAccount(accountId: string, fiscalYearId?: string): Promise<TransactionLine[]> {
  const db = getDb()
  if (fiscalYearId) {
    return db
      .select({ line: transactionLines })
      .from(transactionLines)
      .innerJoin(transactions, eq(transactionLines.transactionId, transactions.id))
      .where(and(eq(transactionLines.accountId, accountId), eq(transactions.fiscalYearId, fiscalYearId), eq(transactions.status, 'posted')))
      .then((rows: Array<{ line: TransactionLine }>) => rows.map(r => r.line))
  }
  return db.select().from(transactionLines).where(eq(transactionLines.accountId, accountId))
}

export interface TrialBalanceEntry {
  accountId: string
  accountCode: string
  accountName: string
  accountType: string
  debitBalance: number
  creditBalance: number
}

export async function getTrialBalance(schoolId: string, fiscalYearId: string): Promise<TrialBalanceEntry[]> {
  const db = getDb()
  const result = await db
    .select({
      accountId: accounts.id,
      accountCode: accounts.code,
      accountName: accounts.name,
      accountType: accounts.type,
      normalBalance: accounts.normalBalance,
      totalDebits: sql<string>`COALESCE(SUM(${transactionLines.debitAmount}), 0)`,
      totalCredits: sql<string>`COALESCE(SUM(${transactionLines.creditAmount}), 0)`,
    })
    .from(accounts)
    .leftJoin(transactionLines, eq(transactionLines.accountId, accounts.id))
    .leftJoin(transactions, and(eq(transactionLines.transactionId, transactions.id), eq(transactions.fiscalYearId, fiscalYearId), eq(transactions.status, 'posted')))
    .where(and(eq(accounts.schoolId, schoolId), eq(accounts.isHeader, false)))
    .groupBy(accounts.id, accounts.code, accounts.name, accounts.type, accounts.normalBalance)
    .orderBy(accounts.code)

  return result.map((r: { accountId: string, accountCode: string, accountName: string, accountType: string, normalBalance: string, totalDebits: string, totalCredits: string }) => {
    const debits = Number.parseFloat(r.totalDebits)
    const credits = Number.parseFloat(r.totalCredits)
    const netBalance = debits - credits
    return {
      accountId: r.accountId,
      accountCode: r.accountCode,
      accountName: r.accountName,
      accountType: r.accountType,
      debitBalance: netBalance > 0 ? netBalance : 0,
      creditBalance: netBalance < 0 ? Math.abs(netBalance) : 0,
    }
  })
}
