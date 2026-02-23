import type { Account, AccountInsert, AccountType } from '../drizzle/school-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, asc, eq, isNull, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { accounts } from '../drizzle/school-schema'
import { DatabaseError, dbError } from '../errors'
import { getNestedErrorMessage } from '../i18n'

// --- Account Queries ---

export interface GetAccountsParams {
  schoolId: string
  type?: AccountType
  parentId?: string | null
  includeInactive?: boolean
  search?: string
}

export function getAccounts(params: GetAccountsParams): R.ResultAsync<Account[], DatabaseError> {
  const db = getDb()
  const { schoolId, type, parentId, includeInactive = false, search } = params

  return R.pipe(
    R.try({
      try: async () => {
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

        return await db
          .select()
          .from(accounts)
          .where(and(...conditions))
          .orderBy(asc(accounts.code))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'account.fetchFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, type })),
  )
}

export interface AccountTreeNode extends Account {
  children: AccountTreeNode[]
}

export async function getAccountsTree(schoolId: string, includeInactive = false): R.ResultAsync<AccountTreeNode[], DatabaseError> {
  const result = await getAccounts({ schoolId, includeInactive })
  return R.pipe(
    result,
    R.map((allAccounts) => {
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
    }),
  )
}

export function getAccountById(accountId: string): R.ResultAsync<Account | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .select()
          .from(accounts)
          .where(eq(accounts.id, accountId))
          .limit(1)
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'account.fetchByIdFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { accountId })),
  )
}

export function getAccountByCode(schoolId: string, code: string): R.ResultAsync<Account | null, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .select()
          .from(accounts)
          .where(and(eq(accounts.schoolId, schoolId), eq(accounts.code, code)))
          .limit(1)
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'account.fetchByCodeFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, code })),
  )
}

export type CreateAccountData = Omit<AccountInsert, 'id' | 'createdAt' | 'updatedAt' | 'level'>

export function createAccount(data: CreateAccountData): R.ResultAsync<Account, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        let level = 1
        if (data.parentId) {
          const parentResult = await getAccountById(data.parentId)
          if (R.isFailure(parentResult))
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
          throw dbError('INTERNAL_ERROR', getNestedErrorMessage('finance', 'account.createFailed'))
        }

        return account
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'account.createFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId: data.schoolId, code: data.code })),
  )
}

export type UpdateAccountData = Partial<Omit<AccountInsert, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>

export function updateAccount(
  accountId: string,
  data: UpdateAccountData,
): R.ResultAsync<Account | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        let level: number | undefined
        if (data.parentId !== undefined) {
          if (data.parentId === null) {
            level = 1
          }
          else {
            const parentResult = await getAccountById(data.parentId)
            if (R.isFailure(parentResult))
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
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'account.updateFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { accountId })),
  )
}

export function updateAccountBalance(
  accountId: string,
  amount: string,
): R.ResultAsync<Account | undefined, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const [account] = await db
          .update(accounts)
          .set({ balance: amount, updatedAt: new Date() })
          .where(eq(accounts.id, accountId))
          .returning()

        return account
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'account.updateBalanceFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { accountId, amount })),
  )
}

export function deleteAccount(accountId: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        await db.delete(accounts).where(eq(accounts.id, accountId))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'account.deleteFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { accountId })),
  )
}

export async function deactivateAccount(accountId: string): R.ResultAsync<Account | undefined, DatabaseError> {
  return await updateAccount(accountId, { status: 'inactive' })
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
): R.ResultAsync<AccountBalanceSummary[], DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: () =>
        db
          .select({
            accountId: accounts.id,
            code: accounts.code,
            name: accounts.name,
            type: accounts.type,
            balance: sql<string>`COALESCE(${accounts.balance}, '0')`,
            normalBalance: accounts.normalBalance,
          })
          .from(accounts)
          .where(and(eq(accounts.schoolId, schoolId), eq(accounts.type, type), eq(accounts.status, 'active')))
          .orderBy(asc(accounts.code)),
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'account.fetchBalancesFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, type })),
  )
}

export function getTotalBalanceByType(schoolId: string, type: AccountType): R.ResultAsync<number, DatabaseError> {
  const db = getDb()
  return R.pipe(
    R.try({
      try: async () => {
        const rows = await db
          .select({ total: sql<string>`COALESCE(SUM(${accounts.balance}), 0)` })
          .from(accounts)
          .where(and(eq(accounts.schoolId, schoolId), eq(accounts.type, type), eq(accounts.status, 'active')))
        return Number.parseFloat(rows[0]?.total ?? '0')
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', getNestedErrorMessage('finance', 'account.fetchTotalBalanceFailed')),
    }),
    R.mapError(tapLogErr(databaseLogger, { schoolId, type })),
  )
}
