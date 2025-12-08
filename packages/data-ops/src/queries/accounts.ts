import type { Account, AccountInsert, AccountType } from '@/drizzle/school-schema'
import { and, asc, eq, isNull, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDb } from '@/database/setup'
import { accounts } from '@/drizzle/school-schema'

// --- Account Queries ---

export interface GetAccountsParams {
  schoolId: string
  type?: AccountType
  parentId?: string | null
  includeInactive?: boolean
  search?: string
}

export async function getAccounts(params: GetAccountsParams): Promise<Account[]> {
  const db = getDb()
  const { schoolId, type, parentId, includeInactive = false, search } = params

  const conditions = [eq(accounts.schoolId, schoolId)]

  if (type) {
    conditions.push(eq(accounts.type, type))
  }

  if (parentId !== undefined) {
    if (parentId === null) {
      conditions.push(isNull(accounts.parentId))
    } else {
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
}

export interface AccountTreeNode extends Account {
  children: AccountTreeNode[]
}

export async function getAccountsTree(schoolId: string, includeInactive = false): Promise<AccountTreeNode[]> {
  const allAccounts = await getAccounts({ schoolId, includeInactive })

  const accountMap = new Map<string, AccountTreeNode>()
  const rootAccounts: AccountTreeNode[] = []

  for (const account of allAccounts) {
    accountMap.set(account.id, { ...account, children: [] })
  }

  for (const account of allAccounts) {
    const node = accountMap.get(account.id)!
    if (account.parentId && accountMap.has(account.parentId)) {
      accountMap.get(account.parentId)!.children.push(node)
    } else {
      rootAccounts.push(node)
    }
  }

  return rootAccounts
}

export async function getAccountById(accountId: string): Promise<Account | null> {
  const db = getDb()
  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .limit(1)

  return account ?? null
}

export async function getAccountByCode(schoolId: string, code: string): Promise<Account | null> {
  const db = getDb()
  const [account] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.schoolId, schoolId), eq(accounts.code, code)))
    .limit(1)

  return account ?? null
}

export type CreateAccountData = Omit<AccountInsert, 'id' | 'createdAt' | 'updatedAt' | 'level'>

export async function createAccount(data: CreateAccountData): Promise<Account> {
  const db = getDb()
  let level = 1
  if (data.parentId) {
    const parent = await getAccountById(data.parentId)
    if (parent) {
      level = parent.level + 1
    }
  }

  const [account] = await db
    .insert(accounts)
    .values({ id: nanoid(), ...data, level })
    .returning()

  return account
}

export type UpdateAccountData = Partial<Omit<AccountInsert, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>

export async function updateAccount(accountId: string, data: UpdateAccountData): Promise<Account> {
  const db = getDb()
  let level: number | undefined
  if (data.parentId !== undefined) {
    if (data.parentId === null) {
      level = 1
    } else {
      const parent = await getAccountById(data.parentId)
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
}

export async function updateAccountBalance(accountId: string, amount: string): Promise<Account> {
  const db = getDb()
  const [account] = await db
    .update(accounts)
    .set({ balance: amount, updatedAt: new Date() })
    .where(eq(accounts.id, accountId))
    .returning()

  return account
}

export async function deleteAccount(accountId: string): Promise<void> {
  const db = getDb()
  await db.delete(accounts).where(eq(accounts.id, accountId))
}

export async function deactivateAccount(accountId: string): Promise<Account> {
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

export async function getAccountBalancesByType(
  schoolId: string,
  type: AccountType,
): Promise<AccountBalanceSummary[]> {
  const db = getDb()
  const result = await db
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
    .orderBy(asc(accounts.code))

  return result as AccountBalanceSummary[]
}

export async function getTotalBalanceByType(schoolId: string, type: AccountType): Promise<number> {
  const db = getDb()
  const [result] = await db
    .select({ total: sql<string>`COALESCE(SUM(${accounts.balance}), 0)` })
    .from(accounts)
    .where(and(eq(accounts.schoolId, schoolId), eq(accounts.type, type), eq(accounts.status, 'active')))

  return parseFloat(result?.total ?? '0')
}
