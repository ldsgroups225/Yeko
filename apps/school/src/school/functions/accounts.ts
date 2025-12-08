import {
  createAccount,
  deleteAccount,
  getAccountById,
  getAccounts,
  getAccountsTree,
  updateAccount,
} from '@repo/data-ops'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createAccountSchema, updateAccountSchema } from '@/schemas/account'
import { getSchoolContext } from '../middleware/school-context'

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
export const getAccountsList = createServerFn()
  .inputValidator(accountFiltersSchema.optional())
  .handler(async ({ data: filters }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getAccounts({
      schoolId: context.schoolId,
      type: filters?.type,
      includeInactive: filters?.status === 'inactive',
    })
  })

/**
 * Get account tree (hierarchical)
 */
export const getAccountsTreeData = createServerFn()
  .inputValidator(z.object({ includeInactive: z.boolean().optional() }).optional())
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getAccountsTree(context.schoolId, data?.includeInactive)
  })

/**
 * Get single account
 */
export const getAccount = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: accountId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await getAccountById(accountId)
  })

/**
 * Create new account
 */
export const createNewAccount = createServerFn()
  .inputValidator(createAccountSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    return await createAccount({
      schoolId: context.schoolId,
      ...data,
    })
  })

/**
 * Update account
 */
export const updateExistingAccount = createServerFn()
  .inputValidator(updateAccountSchema)
  .handler(async ({ data }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    const { id, ...updateData } = data
    return await updateAccount(id, updateData)
  })

/**
 * Delete account
 */
export const deleteExistingAccount = createServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: accountId }) => {
    const context = await getSchoolContext()
    if (!context)
      throw new Error('No school context')

    await deleteAccount(accountId)
    return { success: true }
  })
