import type { Account, AccountTreeNode } from '@repo/data-ops'
import type { ServerContext } from '../lib/server-fn'
import {

  createAccount,
  deleteAccount,
  getAccountById,
  getAccounts,
  getAccountsTree,

  updateAccount,
} from '@repo/data-ops'
import { DatabaseError } from '@repo/data-ops/errors'
import { z } from 'zod'
import { createAccountSchema, updateAccountSchema } from '@/schemas/account'
import { createAuthenticatedServerFn } from '../lib/server-fn'

/**
 * Filters for accounts queries
 */
const accountFiltersSchema = z.object({
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  isHeader: z.boolean().optional(),
})

/**
 * Get accounts list
 */
export const getAccountsList = createAuthenticatedServerFn()
  .inputValidator(accountFiltersSchema.optional())
  .handler(async ({ data: filters, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await getAccounts({
      schoolId: school.schoolId,
      type: filters?.type,
      includeInactive: filters?.status === 'inactive',
    })

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get account tree (hierarchical)
 */
export const getAccountsTreeData = createAuthenticatedServerFn()
  .inputValidator(z.object({ includeInactive: z.boolean().optional() }).optional())
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await getAccountsTree(school.schoolId, data?.includeInactive)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get single account
 */
export const getAccount = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: accountId, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await getAccountById(accountId)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Create new account
 */
export const createNewAccount = createAuthenticatedServerFn()
  .inputValidator(createAccountSchema)
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await createAccount({
      schoolId: school.schoolId,
      ...data,
    })

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Update account
 */
export const updateExistingAccount = createAuthenticatedServerFn()
  .inputValidator(updateAccountSchema)
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const { id, ...updateData } = data
    const result = await updateAccount(id, updateData)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Delete account
 */
export const deleteExistingAccount = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: accountId, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await deleteAccount(accountId)
    return result.match(
      () => ({ success: true as const }),
      error => ({ success: false as const, error: error.message }),
    )
  })
