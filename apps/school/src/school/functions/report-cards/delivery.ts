import { queueAuditLog } from '@repo/background-tasks'
import * as reportCardQueries from '@repo/data-ops/queries/report-cards'
import { z } from 'zod'
import {
  bulkSendReportCardsSchema,
  sendReportCardSchema,
} from '@/schemas/report-card'
import { authServerFn } from '../../lib/server-fn'

/**
 * Send a single report card
 */
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

/**
 * Bulk send report cards
 */
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

/**
 * Mark a report card as delivered
 */
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

/**
 * Mark a report card as viewed
 */
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

/**
 * Get delivery status summary for a class and term
 */
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

/**
 * Get report card statistics for a class
 */
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
