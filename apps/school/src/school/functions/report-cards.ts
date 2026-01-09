import { and, eq, getDb, inArray, reportCards } from '@repo/data-ops'
import * as reportCardQueries from '@repo/data-ops/queries/report-cards'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  bulkGenerateReportCardsSchema,
  bulkSendReportCardsSchema,
  createTeacherCommentSchema,
  generateReportCardSchema,
  getReportCardsSchema,
  sendReportCardSchema,
  updateHomeroomCommentSchema,
  updateTeacherCommentSchema,
} from '@/schemas/report-card'

// ============================================
// REPORT CARD TEMPLATES
// ============================================

export const getReportCardTemplates = createServerFn()
  .inputValidator(z.object({ schoolId: z.string() }))
  .handler(async ({ data }) => {
    return await reportCardQueries.getReportCardTemplates(data.schoolId)
  })

export const getReportCardTemplate = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    return await reportCardQueries.getReportCardTemplateById(data.id)
  })

export const getDefaultTemplate = createServerFn()
  .inputValidator(z.object({ schoolId: z.string() }))
  .handler(async ({ data }) => {
    return await reportCardQueries.getDefaultTemplate(data.schoolId)
  })

export const createReportCardTemplate = createServerFn()
  .inputValidator(z.object({
    schoolId: z.string(),
    name: z.string(),
    isDefault: z.boolean().optional(),
    config: z.record(z.string(), z.unknown()).optional(),
    primaryColor: z.string().optional(),
    fontFamily: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const template = await reportCardQueries.createReportCardTemplate({
      id: crypto.randomUUID(),
      ...data,
    })
    return { success: true, data: template }
  })

export const updateReportCardTemplate = createServerFn()
  .inputValidator(z.object({
    id: z.string(),
    name: z.string().optional(),
    isDefault: z.boolean().optional(),
    config: z.record(z.string(), z.unknown()).optional(),
    primaryColor: z.string().optional(),
    fontFamily: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const { id, ...updateData } = data
    const template = await reportCardQueries.updateReportCardTemplate(id, updateData)
    return { success: true, data: template }
  })

export const deleteReportCardTemplate = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await reportCardQueries.deleteReportCardTemplate(data.id)
    return { success: true }
  })

// ============================================
// REPORT CARDS
// ============================================

export const getReportCards = createServerFn()
  .inputValidator(getReportCardsSchema)
  .handler(async ({ data }) => {
    return await reportCardQueries.getReportCardsByClass(data)
  })

export const getReportCard = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    return await reportCardQueries.getReportCardById(data.id)
  })

export const getReportCardByStudentTerm = createServerFn()
  .inputValidator(z.object({ studentId: z.string(), termId: z.string() }))
  .handler(async ({ data }) => {
    return await reportCardQueries.getReportCardByStudentTerm(data.studentId, data.termId)
  })

export const generateReportCard = createServerFn()
  .inputValidator(generateReportCardSchema.extend({ generatedBy: z.string() }))
  .handler(async ({ data }) => {
    // IconCheck if report card already exists
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
        generatedBy: data.generatedBy,
      })
      return { success: true, data: updated, isNew: false }
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
      generatedBy: data.generatedBy,
    })

    return { success: true, data: reportCard, isNew: true }
  })

export const bulkGenerateReportCards = createServerFn()
  .inputValidator(bulkGenerateReportCardsSchema.extend({ generatedBy: z.string() }))
  .handler(async ({ data }) => {
    const results = {
      total: 0,
      success: 0,
      failed: 0,
      errors: [] as { studentId: string, error: string }[],
    }

    // Get student IDs - if not provided, we effectively do nothing or could fetch them
    const studentIds = data.studentIds ?? []
    results.total = studentIds.length

    if (studentIds.length === 0)
      return { success: true, data: results }

    try {
      const db = getDb()

      // 1. Batch fetch existing report cards for these students and term
      const existingCards = await db
        .select({ id: reportCards.id, studentId: reportCards.studentId })
        .from(reportCards)
        .where(and(
          inArray(reportCards.studentId, studentIds),
          eq(reportCards.termId, data.termId),
        ))

      const existingMap = new Map(existingCards.map(c => [c.studentId, c.id]))

      // 2. Separate into updates and inserts
      const toUpdateIds: string[] = []
      const toInsert: any[] = []

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
            generatedBy: data.generatedBy,
          })
        }
      }

      // 3. Batch Update
      if (toUpdateIds.length > 0) {
        await reportCardQueries.bulkUpdateReportCards(toUpdateIds, {
          templateId: data.templateId,
          status: 'generated',
          generatedAt: new Date(),
          generatedBy: data.generatedBy,
        })
      }

      // 4. Batch Insert
      if (toInsert.length > 0) {
        await reportCardQueries.bulkCreateReportCards(toInsert)
      }

      results.success = studentIds.length
    }
    catch (error) {
      results.failed = studentIds.length
      results.errors.push({
        studentId: 'batch',
        error: error instanceof Error ? error.message : 'Batch generation failed',
      })
    }

    return { success: true, data: results }
  })

export const updateHomeroomComment = createServerFn()
  .inputValidator(updateHomeroomCommentSchema)
  .handler(async ({ data }) => {
    const updated = await reportCardQueries.updateReportCard(data.reportCardId, {
      homeroomComment: data.homeroomComment,
    })
    return { success: true, data: updated }
  })

export const sendReportCard = createServerFn()
  .inputValidator(sendReportCardSchema)
  .handler(async ({ data }) => {
    // Update status to sent
    const updated = await reportCardQueries.updateReportCardStatus(
      data.reportCardId,
      'sent',
      {
        sentAt: new Date(),
        sentTo: data.recipientEmail ?? data.recipientPhone,
        deliveryMethod: data.deliveryMethod,
      },
    )

    // TODO: Implement actual email/SMS sending logic
    // This would integrate with a service like Resend, SendGrid, or Twilio

    return { success: true, data: updated }
  })

export const bulkSendReportCards = createServerFn()
  .inputValidator(bulkSendReportCardsSchema)
  .handler(async ({ data }) => {
    const updated = await reportCardQueries.bulkUpdateReportCardStatus(
      data.reportCardIds,
      'sent',
      {
        sentAt: new Date(),
        deliveryMethod: data.deliveryMethod,
      },
    )

    return { success: true, count: updated.length }
  })

export const markReportCardDelivered = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const updated = await reportCardQueries.updateReportCardStatus(data.id, 'delivered', {
      deliveredAt: new Date(),
    })
    return { success: true, data: updated }
  })

export const markReportCardViewed = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const updated = await reportCardQueries.updateReportCardStatus(data.id, 'viewed', {
      viewedAt: new Date(),
    })
    return { success: true, data: updated }
  })

// ============================================
// DELIVERY STATUS
// ============================================

export const getDeliveryStatusSummary = createServerFn()
  .inputValidator(z.object({ classId: z.string(), termId: z.string() }))
  .handler(async ({ data }) => {
    return await reportCardQueries.getDeliveryStatusSummary(data.classId, data.termId)
  })

export const getClassReportCardStats = createServerFn()
  .inputValidator(z.object({ classId: z.string(), termId: z.string() }))
  .handler(async ({ data }) => {
    return await reportCardQueries.getClassReportCardStats(data.classId, data.termId)
  })

// ============================================
// TEACHER COMMENTS
// ============================================

export const getTeacherComments = createServerFn()
  .inputValidator(z.object({ reportCardId: z.string() }))
  .handler(async ({ data }) => {
    return await reportCardQueries.getTeacherCommentsByReportCard(data.reportCardId)
  })

export const createTeacherComment = createServerFn()
  .inputValidator(createTeacherCommentSchema)
  .handler(async ({ data }) => {
    const comment = await reportCardQueries.upsertTeacherComment({
      id: crypto.randomUUID(),
      ...data,
    })
    return { success: true, data: comment }
  })

export const updateTeacherComment = createServerFn()
  .inputValidator(updateTeacherCommentSchema)
  .handler(async ({ data }) => {
    const comment = await reportCardQueries.updateTeacherComment(data.id, data.comment)
    return { success: true, data: comment }
  })

export const deleteTeacherComment = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await reportCardQueries.deleteTeacherComment(data.id)
    return { success: true }
  })

// ============================================
// REPORT CARD DATA
// ============================================

export const getReportCardData = createServerFn()
  .inputValidator(z.object({
    studentId: z.string(),
    termId: z.string(),
    classId: z.string(),
  }))
  .handler(async ({ data }) => {
    return await reportCardQueries.getReportCardData(
      data.studentId,
      data.termId,
      data.classId,
    )
  })
