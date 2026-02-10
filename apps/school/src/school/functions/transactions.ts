import { Result as R } from '@praha/byethrow'
import { getOpenFiscalYear } from '@repo/data-ops/queries/fiscal-years'
import {
  createJournalEntry,
  getTransactionById,
  getTransactions,
  voidTransaction,
} from '@repo/data-ops/queries/transactions'
import { z } from 'zod'
import { createTransactionSchema, transactionFiltersSchema, voidTransactionSchema } from '@/schemas/transaction'
import { authServerFn } from '../lib/server-fn'

/**
 * Get transactions list with pagination
 */
export const getTransactionsList = authServerFn
  .inputValidator(transactionFiltersSchema.optional())
  .handler(async ({ data: filters, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    const result = await getTransactions({
      schoolId: school.schoolId,
      ...filters,
    })
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Get single transaction
 */
export const getTransaction = authServerFn
  .inputValidator(z.string())
  .handler(async ({ data: transactionId, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const result = await getTransactionById(transactionId)
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Create a new journal entry
 */
export const createEntry = authServerFn
  .inputValidator(createTransactionSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    const fiscalYearResult = await getOpenFiscalYear(school.schoolId)
    if (R.isFailure(fiscalYearResult))
      return { success: false as const, error: fiscalYearResult.error.message }

    const fiscalYear = fiscalYearResult.value
    if (!fiscalYear)
      return { success: false as const, error: 'Aucun exercice comptable ouvert n\'a été trouvé pour cet établissement' }

    // Calculate total amount (sum of debits)
    const totalAmount = data.lines.reduce((sum: number, line) => sum + line.debitAmount, 0).toString()

    const result = await createJournalEntry({
      schoolId: school.schoolId,
      fiscalYearId: fiscalYear.id,
      createdBy: school.userId,
      ...data,
      totalAmount,
      date: data.date, // Already a string in YYYY-MM-DD format
      lines: data.lines.map(line => ({
        accountId: line.accountId,
        debitAmount: line.debitAmount.toString(),
        creditAmount: line.creditAmount.toString(),
        description: line.description,
      })),
    })

    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })

/**
 * Void a transaction
 */
export const voidExistingTransaction = authServerFn
  .inputValidator(voidTransactionSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { school } = context
    const result = await voidTransaction(data.transactionId, school.userId, data.voidReason)
    if (R.isFailure(result))
      return { success: false as const, error: result.error.message }
    return { success: true as const, data: result.value }
  })
