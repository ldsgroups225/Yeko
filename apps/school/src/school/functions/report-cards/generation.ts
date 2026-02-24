import { queueAuditLog } from '@repo/background-tasks'
import * as reportCardQueries from '@repo/data-ops/queries/report-cards'
import { z } from 'zod'
import {
  bulkGenerateReportCardsSchema,
  generateReportCardSchema,
  getReportCardsSchema,
} from '@/schemas/report-card'
import { authServerFn } from '../../lib/server-fn'

/**
 * Get report cards for a class
 */
export const getReportCards = authServerFn
  .inputValidator(getReportCardsSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      const result = await reportCardQueries.getReportCardsByClass(data)
      return { success: true as const, data: result }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors de la récupération des bulletins' }
    }
  })

/**
 * Get a single report card by ID
 */
export const getReportCard = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      const result = await reportCardQueries.getReportCardById(data.id)
      return { success: true as const, data: result }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Bulletin non trouvé' }
    }
  })

/**
 * Get a report card by student and term
 */
export const getReportCardByStudentTerm = authServerFn
  .inputValidator(z.object({ studentId: z.string(), termId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      const result = await reportCardQueries.getReportCardByStudentTerm(
        data.studentId,
        data.termId,
      )
      return { success: true as const, data: result }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Bulletin non trouvé' }
    }
  })

/**
 * Generate (create or update) a report card
 */
export const generateReportCard = authServerFn
  .inputValidator(generateReportCardSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school

    try {
      // Check if report card already exists
      const existing = await reportCardQueries.getReportCardByStudentTerm(
        data.studentId,
        data.termId,
      )

      if (existing) {
        // Update existing report card
        const updated = await reportCardQueries.updateReportCard(existing.id, {
          templateId: data.templateId,
          homeroomComment: data.homeroomComment,
          status: 'generated',
          generatedAt: new Date(),
          generatedBy: userId,
        })

        queueAuditLog({
          schoolId,
          userId,
          action: 'update',
          tableName: 'report_cards',
          recordId: existing.id,
          newValues: { status: 'generated', templateId: data.templateId },
        })

        return { success: true as const, data: { ...updated, isNew: false } }
      }

      // Create new report card
      const reportCard = await reportCardQueries.createReportCard({
        id: crypto.randomUUID(),
        studentId: data.studentId,
        classId: data.classId,
        termId: data.termId,
        schoolYearId: data.schoolYearId,
        templateId: data.templateId,
        homeroomComment: data.homeroomComment,
        status: 'generated',
        generatedAt: new Date(),
        generatedBy: userId,
      })

      if (!reportCard)
        throw new Error('Erreur lors de la création du bulletin')

      queueAuditLog({
        schoolId,
        userId,
        action: 'create',
        tableName: 'report_cards',
        recordId: reportCard.id,
        newValues: { studentId: data.studentId, termId: data.termId, classId: data.classId },
      })

      return { success: true as const, data: { ...reportCard, isNew: true } }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors de la génération du bulletin' }
    }
  })

/**
 * Bulk generate report cards for students
 */
export const bulkGenerateReportCards = authServerFn
  .inputValidator(bulkGenerateReportCardsSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school

    const results = {
      total: 0,
      success: 0,
      failed: 0,
      errors: [] as { studentId: string, error: string }[],
    }

    // Get student IDs
    const studentIds = data.studentIds ?? []
    results.total = studentIds.length

    if (studentIds.length === 0)
      return { success: true as const, data: results }

    try {
      // 1. Batch fetch existing report cards
      const existingCards = await reportCardQueries.getReportCardsByStudentIds(
        studentIds,
        data.termId,
      )

      const existingMap = new Map(
        existingCards.map(c => [c.studentId, c.id]),
      )

      // 2. Separate into updates and inserts
      const toUpdateIds: string[] = []
      const toInsert: Parameters<typeof reportCardQueries.bulkCreateReportCards>[0] = []

      for (const studentId of studentIds) {
        const existingId = existingMap.get(studentId)
        if (existingId) {
          toUpdateIds.push(existingId)
        }
        else {
          toInsert.push({
            id: crypto.randomUUID(),
            studentId,
            classId: data.classId,
            termId: data.termId,
            schoolYearId: data.schoolYearId,
            templateId: data.templateId,
            status: 'generated',
            generatedAt: new Date(),
            generatedBy: userId,
          })
        }
      }

      // 3. Batch Update
      if (toUpdateIds.length > 0) {
        await reportCardQueries.bulkUpdateReportCards(toUpdateIds, {
          templateId: data.templateId,
          status: 'generated',
          generatedAt: new Date(),
          generatedBy: userId,
        })
      }

      // 4. Batch Insert
      if (toInsert.length > 0) {
        await reportCardQueries.bulkCreateReportCards(toInsert)
      }

      queueAuditLog({
        schoolId,
        userId,
        action: 'create',
        tableName: 'report_cards',
        recordId: 'bulk',
        newValues: { count: studentIds.length, termId: data.termId, classId: data.classId },
      })

      results.success = studentIds.length
    }
    catch (error) {
      results.failed = studentIds.length
      results.errors.push({
        studentId: 'batch',
        error:
          error instanceof Error ? error.message : 'Batch generation failed',
      })
    }

    return { success: true as const, data: results }
  })
