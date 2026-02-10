/**
 * Fee Type Template Queries
 *
 * Core-level template management for SaaS fee type architecture.
 * Templates define standard fee types that schools can instantiate.
 */

import type { FeeTypeCategory } from '../drizzle/core-schema'
import { Result as R } from '@praha/byethrow'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, asc, eq, sql } from 'drizzle-orm'
import { getDb } from '../database/setup'
import { feeTypeTemplates } from '../drizzle/core-schema'
import { DatabaseError, dbError } from '../errors'

// Type definitions from drizzle
type FeeTypeTemplate = typeof feeTypeTemplates.$inferSelect
type FeeTypeTemplateInsert = typeof feeTypeTemplates.$inferInsert

export interface GetFeeTypeTemplatesParams {
  category?: FeeTypeCategory
  includeInactive?: boolean
}

/**
 * Get all active fee type templates
 */
export async function getFeeTypeTemplates(
  params: GetFeeTypeTemplatesParams = {},
): R.ResultAsync<FeeTypeTemplate[], DatabaseError> {
  const db = getDb()
  const { category, includeInactive = false } = params

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const conditions = []
        if (category) {
          conditions.push(eq(feeTypeTemplates.category, category))
        }
        if (!includeInactive) {
          conditions.push(eq(feeTypeTemplates.isActive, true))
        }

        return await db
          .select()
          .from(feeTypeTemplates)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(asc(feeTypeTemplates.displayOrder), asc(feeTypeTemplates.name))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch fee type templates'),
    }),
    R.mapError(tapLogErr(databaseLogger, { category, includeInactive })),
  )
}

/**
 * Get a single fee type template by ID
 */
export async function getFeeTypeTemplateById(
  templateId: string,
): R.ResultAsync<FeeTypeTemplate | null, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db
          .select()
          .from(feeTypeTemplates)
          .where(eq(feeTypeTemplates.id, templateId))
          .limit(1)
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch fee type template by ID'),
    }),
    R.mapError(tapLogErr(databaseLogger, { templateId })),
  )
}

/**
 * Get a fee type template by code
 */
export async function getFeeTypeTemplateByCode(
  code: string,
): R.ResultAsync<FeeTypeTemplate | null, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const rows = await db
          .select()
          .from(feeTypeTemplates)
          .where(eq(feeTypeTemplates.code, code))
          .limit(1)
        return rows[0] ?? null
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch fee type template by code'),
    }),
    R.mapError(tapLogErr(databaseLogger, { code })),
  )
}

/**
 * Create a new fee type template (SaaS admin only)
 */
export type CreateFeeTypeTemplateData = Omit<FeeTypeTemplateInsert, 'id' | 'createdAt' | 'updatedAt'>

export async function createFeeTypeTemplate(
  data: CreateFeeTypeTemplateData,
): R.ResultAsync<FeeTypeTemplate, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [template] = await db
          .insert(feeTypeTemplates)
          .values({ id: `ftpl-${data.code.toLowerCase()}-${Date.now()}`, ...data })
          .returning()

        if (!template) {
          throw dbError('INTERNAL_ERROR', 'Failed to create fee type template')
        }

        return template
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create fee type template'),
    }),
    R.mapError(tapLogErr(databaseLogger, { code: data.code, category: data.category })),
  )
}

/**
 * Update a fee type template (SaaS admin only)
 */
export type UpdateFeeTypeTemplateData = Partial<
  Omit<FeeTypeTemplateInsert, 'id' | 'createdAt' | 'updatedAt'>
>

export async function updateFeeTypeTemplate(
  templateId: string,
  data: UpdateFeeTypeTemplateData,
): R.ResultAsync<FeeTypeTemplate | undefined, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        const [template] = await db
          .update(feeTypeTemplates)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(feeTypeTemplates.id, templateId))
          .returning()

        return template
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to update fee type template'),
    }),
    R.mapError(tapLogErr(databaseLogger, { templateId })),
  )
}

/**
 * Deactivate a fee type template (soft delete)
 */
export function deactivateFeeTypeTemplate(
  templateId: string,
): R.ResultAsync<FeeTypeTemplate | undefined, DatabaseError> {
  return updateFeeTypeTemplate(templateId, { isActive: false })
}

/**
 * Delete a fee type template (hard delete - use with caution)
 */
export async function deleteFeeTypeTemplate(templateId: string): R.ResultAsync<void, DatabaseError> {
  const db = getDb()

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        await db.delete(feeTypeTemplates).where(eq(feeTypeTemplates.id, templateId))
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete fee type template'),
    }),
    R.mapError(tapLogErr(databaseLogger, { templateId })),
  )
}

/**
 * Get all template categories with counts
 */
export async function getTemplateCategoriesWithCounts(): R.ResultAsync<
  { category: FeeTypeCategory, count: number }[],
  DatabaseError
> {
  const db = getDb()

  return R.pipe(
    R.try({
      immediate: true,
      try: async () => {
        return await db
          .select({
            category: feeTypeTemplates.category,
            count: sql<number>`count(*)`,
          })
          .from(feeTypeTemplates)
          .where(eq(feeTypeTemplates.isActive, true))
          .groupBy(feeTypeTemplates.category)
      },
      catch: err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to get template category counts'),
    }),
    R.mapError(tapLogErr(databaseLogger, {})),
  )
}
