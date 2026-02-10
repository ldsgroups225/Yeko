import { Result as R } from '@praha/byethrow'
import {
  createAccount,
  deleteAccount,
  getAccountById,
  getAccounts,
  getAccountsTree,
  updateAccount,
} from '@repo/data-ops/queries/accounts'
import { z } from 'zod'
import { createAccountSchema, updateAccountSchema } from '@/schemas/account'
import { authServerFn } from '../lib/server-fn'

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
export const getAccountsList = authServerFn
  .inputValidator(accountFiltersSchema.optional())
  .handler(async ({ data: filters, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    const result = await getAccounts({
      schoolId: school.schoolId,
      type: filters?.type,
      includeInactive: filters?.status === 'inactive',
    })

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Get account tree (hierarchical)
 */
export const getAccountsTreeData = authServerFn
  .inputValidator(z.object({ includeInactive: z.boolean().optional() }).optional())
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await getAccountsTree(context.school.schoolId, data?.includeInactive)
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Get single account
 */
export const getAccount = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: accountId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await getAccountById(accountId)
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Create new account
 */
export const createNewAccount = authServerFn
  .inputValidator(createAccountSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await createAccount({
      schoolId: context.school.schoolId,
      ...data,
    })

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Update account
 */
export const updateExistingAccount = authServerFn
  .inputValidator(updateAccountSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { id, ...updateData } = data
    const result = await updateAccount(id, updateData)
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Delete account
 */
export const deleteExistingAccount = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: accountId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await deleteAccount(accountId)
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: { success: true } }
  })
