import { queueAuditLog } from '@repo/background-tasks'
import * as reportCardQueries from '@repo/data-ops/queries/report-cards'
import { z } from 'zod'
import { authServerFn } from '../../lib/server-fn'

/**
 * Get report card templates for a school
 */
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

/**
 * Get a single report card template by ID
 */
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

/**
 * Get the default report card template for a school
 */
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

/**
 * Create a new report card template
 */
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

/**
 * Update an existing report card template
 */
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

/**
 * Delete a report card template
 */
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
