/**
 * Fee Type Template Queries
 *
 * Core-level template management for SaaS fee type architecture.
 * Templates define standard fee types that schools can instantiate.
 */

import type { FeeTypeCategory } from '../drizzle/core-schema'
import { databaseLogger, tapLogErr } from '@repo/logger'
import { and, asc, eq, sql } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'
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
export function getFeeTypeTemplates(
  params: GetFeeTypeTemplatesParams = {},
): ResultAsync<FeeTypeTemplate[], DatabaseError> {
  const db = getDb()
  const { category, includeInactive = false } = params

  return ResultAsync.fromPromise(
    (async () => {
      const conditions = []
      if (category) {
        conditions.push(eq(feeTypeTemplates.category, category))
      }
      if (!includeInactive) {
        conditions.push(eq(feeTypeTemplates.isActive, true))
      }

      return db
        .select()
        .from(feeTypeTemplates)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(feeTypeTemplates.displayOrder), asc(feeTypeTemplates.name))
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch fee type templates'),
  ).mapErr(tapLogErr(databaseLogger, { category, includeInactive }))
}

/**
 * Get a single fee type template by ID
 */
export function getFeeTypeTemplateById(
  templateId: string,
): ResultAsync<FeeTypeTemplate | null, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db
      .select()
      .from(feeTypeTemplates)
      .where(eq(feeTypeTemplates.id, templateId))
      .limit(1)
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch fee type template by ID'),
  ).mapErr(tapLogErr(databaseLogger, { templateId }))
}

/**
 * Get a fee type template by code
 */
export function getFeeTypeTemplateByCode(
  code: string,
): ResultAsync<FeeTypeTemplate | null, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    db
      .select()
      .from(feeTypeTemplates)
      .where(eq(feeTypeTemplates.code, code))
      .limit(1)
      .then(rows => rows[0] ?? null),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to fetch fee type template by code'),
  ).mapErr(tapLogErr(databaseLogger, { code }))
}

/**
 * Create a new fee type template (SaaS admin only)
 */
export type CreateFeeTypeTemplateData = Omit<FeeTypeTemplateInsert, 'id' | 'createdAt' | 'updatedAt'>

export function createFeeTypeTemplate(
  data: CreateFeeTypeTemplateData,
): ResultAsync<FeeTypeTemplate, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    (async () => {
      const [template] = await db
        .insert(feeTypeTemplates)
        .values({ id: `ftpl-${data.code.toLowerCase()}-${Date.now()}`, ...data })
        .returning()

      if (!template) {
        throw dbError('INTERNAL_ERROR', 'Failed to create fee type template')
      }

      return template
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to create fee type template'),
  ).mapErr(tapLogErr(databaseLogger, { code: data.code, category: data.category }))
}

/**
 * Update a fee type template (SaaS admin only)
 */
export type UpdateFeeTypeTemplateData = Partial<
  Omit<FeeTypeTemplateInsert, 'id' | 'createdAt' | 'updatedAt'>
>

export function updateFeeTypeTemplate(
  templateId: string,
  data: UpdateFeeTypeTemplateData,
): ResultAsync<FeeTypeTemplate | undefined, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    (async () => {
      const [template] = await db
        .update(feeTypeTemplates)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(feeTypeTemplates.id, templateId))
        .returning()

      return template
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to update fee type template'),
  ).mapErr(tapLogErr(databaseLogger, { templateId }))
}

/**
 * Deactivate a fee type template (soft delete)
 */
export function deactivateFeeTypeTemplate(
  templateId: string,
): ResultAsync<FeeTypeTemplate | undefined, DatabaseError> {
  return updateFeeTypeTemplate(templateId, { isActive: false })
}

/**
 * Delete a fee type template (hard delete - use with caution)
 */
export function deleteFeeTypeTemplate(templateId: string): ResultAsync<void, DatabaseError> {
  const db = getDb()

  return ResultAsync.fromPromise(
    (async () => {
      await db.delete(feeTypeTemplates).where(eq(feeTypeTemplates.id, templateId))
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to delete fee type template'),
  ).mapErr(tapLogErr(databaseLogger, { templateId }))
}

/**
 * Get all template categories with counts
 */
export function getTemplateCategoriesWithCounts(): ResultAsync<
  { category: FeeTypeCategory, count: number }[],
  DatabaseError
> {
  const db = getDb()

  return ResultAsync.fromPromise(
    (async () => {
      return db
        .select({
          category: feeTypeTemplates.category,
          count: sql<number>`count(*)`,
        })
        .from(feeTypeTemplates)
        .where(eq(feeTypeTemplates.isActive, true))
        .groupBy(feeTypeTemplates.category)
    })(),
    err => DatabaseError.from(err, 'INTERNAL_ERROR', 'Failed to get template category counts'),
  ).mapErr(tapLogErr(databaseLogger, {}))
}
