import type { Transaction, TransactionInsert, TransactionLine, TransactionLineInsert, TransactionStatus, TransactionType } from '../drizzle/school-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { accounts, transactionLines, transactions } from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'

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

export function getTransactions(params: GetTransactionsParams): ResultAsync<PaginatedTransactions, DatabaseError> {
  const db = getDb()
  const { schoolId, fiscalYearId, type, status, startDate, endDate, studentId, page = 1, pageSize = 20 } = params

  return ResultAsync.fromPromise(
    (async () => {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch transactions'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, fiscalYearId }))
}

export function getTransactionById(transactionId: string): ResultAsync<Transaction | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1).then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch transaction by ID'),
  ).mapErr(tapLogErr(databaseLogger, { transactionId }))
}

export function getTransactionWithLines(transactionId: string): ResultAsync<{ transaction: Transaction, lines: TransactionLine[] } | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [transaction] = await db.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1)
      if (!transaction)
        return null

      const lines = await db.select().from(transactionLines).where(eq(transactionLines.transactionId, transactionId)).orderBy(transactionLines.lineNumber)
      return { transaction, lines }
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch transaction with lines'),
  ).mapErr(tapLogErr(databaseLogger, { transactionId }))
}

export function generateTransactionNumber(schoolId: string): ResultAsync<string, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to generate transaction number'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId }))
}

export type CreateTransactionData = Omit<TransactionInsert, 'id' | 'transactionNumber' | 'createdAt' | 'updatedAt'>
export type CreateTransactionLineData = Omit<TransactionLineInsert, 'id' | 'transactionId' | 'lineNumber' | 'createdAt'>

export interface CreateTransactionWithLinesData extends CreateTransactionData {
  lines: CreateTransactionLineData[]
}

export function createJournalEntry(
  data: CreateTransactionWithLinesData,
): ResultAsync<{ transaction: Transaction, lines: TransactionLine[] }, DatabaseError> {
  const db = getDb()
  const { lines: linesData, ...transactionData } = data

  return ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      // Validate double-entry: debits must equal credits
      const totalDebits = linesData.reduce((sum, l) => sum + Number.parseFloat(l.debitAmount ?? '0'), 0)
      const totalCredits = linesData.reduce((sum, l) => sum + Number.parseFloat(l.creditAmount ?? '0'), 0)
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        throw dbError('UNBALANCED_TRANSACTION', `Transaction not balanced: debits (${totalDebits}) != credits (${totalCredits})`)
      }

      const transactionNumberResult = await generateTransactionNumber(transactionData.schoolId)
      if (transactionNumberResult.isErr())
        throw transactionNumberResult.error
      const transactionNumber = transactionNumberResult.value

      const [transaction] = await tx
        .insert(transactions)
        .values({ id: crypto.randomUUID(), transactionNumber, ...transactionData })
        .returning()

      if (!transaction) {
        throw dbError('INTERNAL_ERROR', 'Failed to create transaction record')
      }

      const createdLines: TransactionLine[] = []
      for (let i = 0; i < linesData.length; i++) {
        const lineData = linesData[i]!
        const [line] = await tx
          .insert(transactionLines)
          .values({ id: crypto.randomUUID(), transactionId: transaction.id, ...lineData, lineNumber: i + 1 })
          .returning()

        if (!line) {
          throw dbError('INTERNAL_ERROR', 'Failed to create transaction line')
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
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create transaction with lines'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId: data.schoolId }))
}

export function voidTransaction(
  transactionId: string,
  voidedBy: string,
  voidReason: string,
): ResultAsync<Transaction, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      const txnWithLinesResult = await getTransactionWithLines(transactionId)
      if (txnWithLinesResult.isErr())
        throw txnWithLinesResult.error
      const txnWithLines = txnWithLinesResult.value

      if (!txnWithLines)
        throw dbError('NOT_FOUND', `Transaction with ID ${transactionId} not found`)
      if (txnWithLines.transaction.status === 'voided')
        throw dbError('CONFLICT', 'Transaction already voided')

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
        throw dbError('INTERNAL_ERROR', 'Failed to void transaction record')
      }

      return voidedTxn
    }),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to void transaction'),
  ).mapErr(tapLogErr(databaseLogger, { transactionId, voidedBy }))
}

export function getTransactionLinesByAccount(accountId: string, fiscalYearId?: string): ResultAsync<TransactionLine[], DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      if (fiscalYearId) {
        return db
          .select({ line: transactionLines })
          .from(transactionLines)
          .innerJoin(transactions, eq(transactionLines.transactionId, transactions.id))
          .where(and(eq(transactionLines.accountId, accountId), eq(transactions.fiscalYearId, fiscalYearId), eq(transactions.status, 'posted')))
          .then((rows: Array<{ line: TransactionLine }>) => rows.map(r => r.line))
      }
      return db.select().from(transactionLines).where(eq(transactionLines.accountId, accountId))
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch transaction lines by account'),
  ).mapErr(tapLogErr(databaseLogger, { accountId, fiscalYearId }))
}

export interface TrialBalanceEntry {
  accountId: string
  accountCode: string
  accountName: string
  accountType: string
  debitBalance: number
  creditBalance: number
}

export function getTrialBalance(schoolId: string, fiscalYearId: string): ResultAsync<TrialBalanceEntry[], DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
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
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch trial balance'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, fiscalYearId }))
}
