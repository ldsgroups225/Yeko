import type { ServerContext } from '../lib/server-fn'
import {
  createJournalEntry,
  getOpenFiscalYear,
  getTransactionById,
  getTransactions,
  voidTransaction,
} from '@repo/data-ops'
import { DatabaseError } from '@repo/data-ops/errors'
import { z } from 'zod'
import { createTransactionSchema, transactionFiltersSchema, voidTransactionSchema } from '@/schemas/transaction'
import { createAuthenticatedServerFn } from '../lib/server-fn'

/**
 * Get transactions list with pagination
 */
export const getTransactionsList = createAuthenticatedServerFn()
  .inputValidator(transactionFiltersSchema.optional())
  .handler(async ({ data: filters, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await getTransactions({
      schoolId: school.schoolId,
      ...filters,
    })
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Get single transaction
 */
export const getTransaction = createAuthenticatedServerFn()
  .inputValidator(z.string())
  .handler(async ({ data: transactionId, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await getTransactionById(transactionId)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Create a new journal entry
 */
export const createEntry = createAuthenticatedServerFn()
  .inputValidator(createTransactionSchema)
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const fiscalYearResult = await getOpenFiscalYear(school.schoolId)
    if (fiscalYearResult.isErr())
      return { success: false as const, error: fiscalYearResult.error.message }

    const fiscalYear = fiscalYearResult.value
    if (!fiscalYear)
      return { success: false as const, error: 'No open fiscal year found for this school' }

    // Calculate total amount (sum of debits)
    const totalAmount = data.lines.reduce((sum, line) => sum + line.debitAmount, 0).toString()

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

    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })

/**
 * Void a transaction
 */
export const voidExistingTransaction = createAuthenticatedServerFn()
  .inputValidator(voidTransactionSchema)
  .handler(async ({ data, context }) => {
    const { school } = context as unknown as ServerContext
    if (!school)
      throw new DatabaseError('UNAUTHORIZED', 'No school context')

    const result = await voidTransaction(data.transactionId, school.userId, data.voidReason)
    return result.match(
      data => ({ success: true as const, data }),
      error => ({ success: false as const, error: error.message }),
    )
  })
