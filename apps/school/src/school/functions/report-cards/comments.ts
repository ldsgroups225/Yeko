import { queueAuditLog } from '@repo/background-tasks'
import * as reportCardQueries from '@repo/data-ops/queries/report-cards'
import { z } from 'zod'
import {
  createTeacherCommentSchema,
  updateHomeroomCommentSchema,
  updateTeacherCommentSchema,
} from '@/schemas/report-card'
import { authServerFn } from '../../lib/server-fn'

/**
 * Update homeroom teacher comment on a report card
 */
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

/**
 * Get teacher comments for a report card
 */
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

/**
 * Create or update a teacher comment for a subject
 */
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

/**
 * Update a teacher subject comment
 */
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

/**
 * Delete a teacher comment
 */
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
