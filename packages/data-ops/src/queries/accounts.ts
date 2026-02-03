import type { Account, AccountInsert, AccountType } from '../drizzle/school-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, asc, eq, isNull, sql } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
import { getDb } from '../database/setup'
import { accounts } from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'

// --- Account Queries ---

export interface GetAccountsParams {
  schoolId: string
  type?: AccountType
  parentId?: string | null
  includeInactive?: boolean
  search?: string
}

export function getAccounts(params: GetAccountsParams): ResultAsync<Account[], DatabaseError> {
  const db = getDb()
  const { schoolId, type, parentId, includeInactive = false, search } = params

  return ResultAsync.fromPromise(
    (async () => {
      const conditions = [eq(accounts.schoolId, schoolId)]

      if (type) {
        conditions.push(eq(accounts.type, type))
      }

      if (parentId !== undefined) {
        if (parentId === null) {
          conditions.push(isNull(accounts.parentId))
        }
        else {
          conditions.push(eq(accounts.parentId, parentId))
        }
      }

      if (!includeInactive) {
        conditions.push(eq(accounts.status, 'active'))
      }

      if (search) {
        conditions.push(
          sql`(${accounts.code} ILIKE ${`%${search}%`} OR ${accounts.name} ILIKE ${`%${search}%`})`,
        )
      }

      return db
        .select()
        .from(accounts)
        .where(and(...conditions))
        .orderBy(asc(accounts.code))
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch accounts'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, type }))
}

export interface AccountTreeNode extends Account {
  children: AccountTreeNode[]
}

export function getAccountsTree(schoolId: string, includeInactive = false): ResultAsync<AccountTreeNode[], DatabaseError> {
  return getAccounts({ schoolId, includeInactive }).map((allAccounts) => {
    const accountMap = new Map<string, AccountTreeNode>()
    const rootAccounts: AccountTreeNode[] = []

    for (const account of allAccounts) {
      accountMap.set(account.id, { ...account, children: [] })
    }

    for (const account of allAccounts) {
      const node = accountMap.get(account.id)!
      if (account.parentId && accountMap.has(account.parentId)) {
        accountMap.get(account.parentId)!.children.push(node)
      }
      else {
        rootAccounts.push(node)
      }
    }

    return rootAccounts
  })
}

export function getAccountById(accountId: string): ResultAsync<Account | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .limit(1)
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch account by ID'),
  ).mapErr(tapLogErr(databaseLogger, { accountId }))
}

export function getAccountByCode(schoolId: string, code: string): ResultAsync<Account | null, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select()
      .from(accounts)
      .where(and(eq(accounts.schoolId, schoolId), eq(accounts.code, code)))
      .limit(1)
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch account by code'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, code }))
}

export type CreateAccountData = Omit<AccountInsert, 'id' | 'createdAt' | 'updatedAt' | 'level'>

export function createAccount(data: CreateAccountData): ResultAsync<Account, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      let level = 1
      if (data.parentId) {
        const parentResult = await getAccountById(data.parentId)
        if (parentResult.isErr())
          throw parentResult.error
        const parent = parentResult.value
        if (parent) {
          level = parent.level + 1
        }
      }

      const [account] = await db
        .insert(accounts)
        .values({ id: crypto.randomUUID(), ...data, level })
        .returning()

      if (!account) {
        throw dbError('INTERNAL_ERROR', 'Failed to create account')
      }

      return account
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create account'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId: data.schoolId, code: data.code }))
}

export type UpdateAccountData = Partial<Omit<AccountInsert, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>

export function updateAccount(
  accountId: string,
  data: UpdateAccountData,
): ResultAsync<Account | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      let level: number | undefined
      if (data.parentId !== undefined) {
        if (data.parentId === null) {
          level = 1
        }
        else {
          const parentResult = await getAccountById(data.parentId)
          if (parentResult.isErr())
            throw parentResult.error
          const parent = parentResult.value
          if (parent) {
            level = parent.level + 1
          }
        }
      }

      const [account] = await db
        .update(accounts)
        .set({ ...data, ...(level !== undefined ? { level } : {}), updatedAt: new Date() })
        .where(eq(accounts.id, accountId))
        .returning()

      return account
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to update account'),
  ).mapErr(tapLogErr(databaseLogger, { accountId }))
}

export function updateAccountBalance(
  accountId: string,
  amount: string,
): ResultAsync<Account | undefined, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      const [account] = await db
        .update(accounts)
        .set({ balance: amount, updatedAt: new Date() })
        .where(eq(accounts.id, accountId))
        .returning()

      return account
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to update account balance'),
  ).mapErr(tapLogErr(databaseLogger, { accountId, amount }))
}

export function deleteAccount(accountId: string): ResultAsync<void, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    (async () => {
      await db.delete(accounts).where(eq(accounts.id, accountId))
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete account'),
  ).mapErr(tapLogErr(databaseLogger, { accountId }))
}

export function deactivateAccount(accountId: string): ResultAsync<Account | undefined, DatabaseError> {
  return updateAccount(accountId, { status: 'inactive' })
}

export interface AccountBalanceSummary {
  accountId: string
  code: string
  name: string
  type: AccountType
  balance: string
  normalBalance: 'debit' | 'credit'
}

export function getAccountBalancesByType(
  schoolId: string,
  type: AccountType,
): ResultAsync<AccountBalanceSummary[], DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select({
        accountId: accounts.id,
        code: accounts.code,
        name: accounts.name,
        type: accounts.type,
        balance: accounts.balance,
        normalBalance: accounts.normalBalance,
      })
      .from(accounts)
      .where(and(eq(accounts.schoolId, schoolId), eq(accounts.type, type), eq(accounts.status, 'active')))
      .orderBy(asc(accounts.code)) as Promise<AccountBalanceSummary[]>,
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch account balances'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, type }))
}

export function getTotalBalanceByType(schoolId: string, type: AccountType): ResultAsync<number, DatabaseError> {
  const db = getDb()
  return ResultAsync.fromPromise(
    db
      .select({ total: sql<string>`COALESCE(SUM(${accounts.balance}), 0)` })
      .from(accounts)
      .where(and(eq(accounts.schoolId, schoolId), eq(accounts.type, type), eq(accounts.status, 'active')))
      .then(rows => Number.parseFloat(rows[0]?.total ?? '0')),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch total balance'),
  ).mapErr(tapLogErr(databaseLogger, { schoolId, type }))
}
