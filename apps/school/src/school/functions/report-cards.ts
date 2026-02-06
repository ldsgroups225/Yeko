import { queueAuditLog } from '@repo/background-tasks'
import { getReportCardsByStudentIds } from '@repo/data-ops/queries/report-cards'
import * as reportCardQueries from '@repo/data-ops/queries/report-cards'

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
import { authServerFn } from '../lib/server-fn'

// ============================================
// REPORT CARD TEMPLATES
// ============================================

export const getReportCardTemplates = authServerFn
  .inputValidator(z.object({ schoolId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      const result = await reportCardQueries.getReportCardTemplates(data.schoolId)
      return { success: true as const, data: result }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors de la récupération des modèles' }
    }
  })

export const getReportCardTemplate = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      const result = await reportCardQueries.getReportCardTemplateById(data.id)
      return { success: true as const, data: result }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Modèle non trouvé' }
    }
  })

export const getDefaultTemplate = authServerFn
  .inputValidator(z.object({ schoolId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      const result = await reportCardQueries.getDefaultTemplate(data.schoolId)
      return { success: true as const, data: result }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Modèle par défaut non trouvé' }
    }
  })

export const createReportCardTemplate = authServerFn
  .inputValidator(
    z.object({
      schoolId: z.string(),
      name: z.string(),
      isDefault: z.boolean().optional(),
      config: z.record(z.string(), z.unknown()).optional(),
      primaryColor: z.string().optional(),
      fontFamily: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school

    try {
      const template = await reportCardQueries.createReportCardTemplate({
        id: crypto.randomUUID(),
        ...data,
      })

      if (!template)
        throw new Error('Erreur lors de la création du modèle')

      queueAuditLog({
        schoolId,
        userId,
        action: 'create',
        tableName: 'report_card_templates',
        recordId: template.id,
        newValues: data,
      })

      return { success: true as const, data: template }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors de la création du modèle' }
    }
  })

export const updateReportCardTemplate = authServerFn
  .inputValidator(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      isDefault: z.boolean().optional(),
      config: z.record(z.string(), z.unknown()).optional(),
      primaryColor: z.string().optional(),
      fontFamily: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school
    const { id, ...updateData } = data

    try {
      const template = await reportCardQueries.updateReportCardTemplate(
        id,
        updateData,
      )

      queueAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'report_card_templates',
        recordId: id,
        newValues: updateData,
      })

      return { success: true as const, data: template }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du modèle' }
    }
  })

export const deleteReportCardTemplate = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school

    try {
      await reportCardQueries.deleteReportCardTemplate(data.id)

      queueAuditLog({
        schoolId,
        userId,
        action: 'delete',
        tableName: 'report_card_templates',
        recordId: data.id,
      })

      return { success: true as const, data: { success: true } }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors de la suppression du modèle' }
    }
  })

// ============================================
// REPORT CARDS
// ============================================

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
      const existingCards = await getReportCardsByStudentIds(
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

export const updateHomeroomComment = authServerFn
  .inputValidator(updateHomeroomCommentSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school

    try {
      const updated = await reportCardQueries.updateReportCard(
        data.reportCardId,
        {
          homeroomComment: data.homeroomComment,
        },
      )

      queueAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'report_cards',
        recordId: data.reportCardId,
        newValues: { homeroomComment: data.homeroomComment },
      })

      return { success: true as const, data: updated }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du commentaire' }
    }
  })

export const sendReportCard = authServerFn
  .inputValidator(sendReportCardSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school

    try {
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

      queueAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'report_cards',
        recordId: data.reportCardId,
        newValues: { status: 'sent', deliveryMethod: data.deliveryMethod },
      })

      return { success: true as const, data: updated }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors de l’envoi du bulletin' }
    }
  })

export const bulkSendReportCards = authServerFn
  .inputValidator(bulkSendReportCardsSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school

    try {
      const updated = await reportCardQueries.bulkUpdateReportCardStatus(
        data.reportCardIds,
        'sent',
        {
          sentAt: new Date(),
          deliveryMethod: data.deliveryMethod,
        },
      )

      queueAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'report_cards',
        recordId: 'bulk-send',
        newValues: { count: data.reportCardIds.length, status: 'sent', deliveryMethod: data.deliveryMethod },
      })

      return { success: true as const, data: { count: updated.length } }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors de l’envoi groupé des bulletins' }
    }
  })

export const markReportCardDelivered = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      const updated = await reportCardQueries.updateReportCardStatus(
        data.id,
        'delivered',
        {
          deliveredAt: new Date(),
        },
      )
      return { success: true as const, data: updated }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors du marquage comme délivré' }
    }
  })

export const markReportCardViewed = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      const updated = await reportCardQueries.updateReportCardStatus(
        data.id,
        'viewed',
        {
          viewedAt: new Date(),
        },
      )
      return { success: true as const, data: updated }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors du marquage comme vu' }
    }
  })

// ============================================
// DELIVERY STATUS
// ============================================

export const getDeliveryStatusSummary = authServerFn
  .inputValidator(z.object({ classId: z.string(), termId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      const result = await reportCardQueries.getDeliveryStatusSummary(
        data.classId,
        data.termId,
      )
      return { success: true as const, data: result }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors de la récupération du résumé de livraison' }
    }
  })

export const getClassReportCardStats = authServerFn
  .inputValidator(z.object({ classId: z.string(), termId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      const result = await reportCardQueries.getClassReportCardStats(
        data.classId,
        data.termId,
      )
      return { success: true as const, data: result }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors de la récupération des statistiques' }
    }
  })

// ============================================
// TEACHER COMMENTS
// ============================================

export const getTeacherComments = authServerFn
  .inputValidator(z.object({ reportCardId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      const result = await reportCardQueries.getTeacherCommentsByReportCard(
        data.reportCardId,
      )
      return { success: true as const, data: result }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors de la récupération des commentaires' }
    }
  })

export const createTeacherComment = authServerFn
  .inputValidator(createTeacherCommentSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school

    try {
      const comment = await reportCardQueries.upsertTeacherComment({
        id: crypto.randomUUID(),
        ...data,
      })

      if (!comment)
        throw new Error('Erreur lors de la création du commentaire')

      queueAuditLog({
        schoolId,
        userId,
        action: 'create',
        tableName: 'teacher_comments',
        recordId: comment.id,
        newValues: { reportCardId: data.reportCardId, subjectId: data.subjectId },
      })

      return { success: true as const, data: comment }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors de la création du commentaire' }
    }
  })

export const updateTeacherComment = authServerFn
  .inputValidator(updateTeacherCommentSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school

    try {
      const comment = await reportCardQueries.updateTeacherComment(
        data.id,
        data.comment,
      )

      queueAuditLog({
        schoolId,
        userId,
        action: 'update',
        tableName: 'teacher_comments',
        recordId: data.id,
        newValues: { comment: data.comment },
      })

      return { success: true as const, data: comment }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du commentaire' }
    }
  })

export const deleteTeacherComment = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { schoolId, userId } = context.school

    try {
      await reportCardQueries.deleteTeacherComment(data.id)

      queueAuditLog({
        schoolId,
        userId,
        action: 'delete',
        tableName: 'teacher_comments',
        recordId: data.id,
      })

      return { success: true as const, data: { success: true } }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors de la suppression du commentaire' }
    }
  })

// ============================================
// REPORT CARD DATA
// ============================================

export const getReportCardData = authServerFn
  .inputValidator(
    z.object({
      studentId: z.string(),
      termId: z.string(),
      classId: z.string(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    try {
      const result = await reportCardQueries.getReportCardData(
        data.studentId,
        data.termId,
        data.classId,
      )
      return { success: true as const, data: result }
    }
    catch (error) {
      return { success: false as const, error: error instanceof Error ? error.message : 'Erreur lors de la récupération des données du bulletin' }
    }
  })
