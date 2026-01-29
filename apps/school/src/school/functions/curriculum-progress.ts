import * as progressQueries from '@repo/data-ops/queries/curriculum-progress'
import { z } from 'zod'
import {
  createClassSessionSchema,
  getClassesBehindSchema,
  getClassSessionsSchema,
  getProgressOverviewSchema,
  getProgressSchema,
  markChapterCompleteSchema,
  markSessionCompletedSchema,
  recalculateProgressSchema,
  unmarkChapterCompleteSchema,
  updateClassSessionSchema,
} from '@/schemas/curriculum-progress'
import { authServerFn } from '../lib/server-fn'

// ============================================
// CLASS SESSIONS
// ============================================

export const getClassSessions = authServerFn
  .inputValidator(getClassSessionsSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    return (await progressQueries.getClassSessions(data)).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des sessions' }),
    )
  })

export const getClassSession = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    return (await progressQueries.getClassSessionById(data.id)).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération de la session' }),
    )
  })

export const createClassSession = authServerFn
  .inputValidator(createClassSessionSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    return (await progressQueries.createClassSession({
      id: crypto.randomUUID(),
      ...data,
    })).match(
      session => ({ success: true as const, data: session }),
      _ => ({ success: false as const, error: 'Erreur lors de la création de la session' }),
    )
  })

export const updateClassSession = authServerFn
  .inputValidator(updateClassSessionSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { id, ...updateData } = data
    return (await progressQueries.updateClassSession(id, updateData)).match(
      session => ({ success: true as const, data: session }),
      _ => ({ success: false as const, error: 'Erreur lors de la mise à jour de la session' }),
    )
  })

export const markSessionCompleted = authServerFn
  .inputValidator(markSessionCompletedSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { id, ...completionData } = data
    return (await progressQueries.markSessionCompleted(id, completionData)).match(
      session => ({ success: true as const, data: session }),
      _ => ({ success: false as const, error: 'Erreur lors de la validation de la session' }),
    )
  })

export const deleteClassSession = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    return (await progressQueries.deleteClassSession(data.id)).match(
      _ => ({ success: true as const, data: { success: true } }),
      _ => ({ success: false as const, error: 'Erreur lors de la suppression de la session' }),
    )
  })

// ============================================
// CHAPTER COMPLETIONS
// ============================================

export const getChapterCompletions = authServerFn
  .inputValidator(z.object({
    classId: z.string(),
    subjectId: z.string().optional(),
  }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    return (await progressQueries.getChapterCompletions(data)).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des chapitres terminés' }),
    )
  })

export const markChapterComplete = authServerFn
  .inputValidator(markChapterCompleteSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    // Check if already completed
    const isCompleted = (await progressQueries.isChapterCompleted(data.classId, data.chapterId)).match(
      val => val,
      _ => false,
    )
    if (isCompleted) {
      return { success: false as const, error: 'Chapitre déjà marqué comme terminé' }
    }

    return (await progressQueries.markChapterComplete({
      id: crypto.randomUUID(),
      ...data,
    })).match(
      completion => ({ success: true as const, data: completion }),
      _ => ({ success: false as const, error: 'Erreur lors de la validation du chapitre' }),
    )
  })

export const unmarkChapterComplete = authServerFn
  .inputValidator(unmarkChapterCompleteSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    return (await progressQueries.unmarkChapterComplete(data.classId, data.chapterId)).match(
      _ => ({ success: true as const, data: { success: true } }),
      _ => ({ success: false as const, error: 'Erreur lors de l\'annulation du chapitre' }),
    )
  })

export const isChapterCompleted = authServerFn
  .inputValidator(z.object({ classId: z.string(), chapterId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    return (await progressQueries.isChapterCompleted(data.classId, data.chapterId)).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la vérification du chapitre' }),
    )
  })

// ============================================
// CURRICULUM PROGRESS
// ============================================

export const getCurriculumProgress = authServerFn
  .inputValidator(getProgressSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    return (await progressQueries.getCurriculumProgress(data)).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération de la progression' }),
    )
  })

export const getProgressOverview = authServerFn
  .inputValidator(getProgressOverviewSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    return (await progressQueries.getProgressOverview(data)).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération de la vue d\'ensemble' }),
    )
  })

export const getClassesBehindSchedule = authServerFn
  .inputValidator(getClassesBehindSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    return (await progressQueries.getClassesBehindSchedule(data)).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des classes en retard' }),
    )
  })

export const recalculateProgress = authServerFn
  .inputValidator(recalculateProgressSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    // Calculate progress
    const progressResult = await progressQueries.calculateProgress({
      classId: data.classId,
      subjectId: data.subjectId,
      termId: data.termId,
      programTemplateId: data.programTemplateId,
      termStartDate: new Date(data.termStartDate),
      termEndDate: new Date(data.termEndDate),
    })

    if (progressResult.isErr()) {
      return { success: false as const, error: 'Erreur lors du calcul de la progression' }
    }
    const progress = progressResult.value

    // Upsert progress record
    return (await progressQueries.upsertCurriculumProgress({
      id: crypto.randomUUID(),
      classId: data.classId,
      subjectId: data.subjectId,
      termId: data.termId,
      programTemplateId: data.programTemplateId,
      totalChapters: progress.totalChapters,
      completedChapters: progress.completedChapters,
      progressPercentage: String(progress.progressPercentage),
      expectedPercentage: String(progress.expectedPercentage),
      variance: String(progress.variance),
      status: progress.status,
      lastChapterCompletedAt: progress.completedChapters > 0 ? new Date() : null,
    })).match(
      record => ({ success: true as const, data: record }),
      _ => ({ success: false as const, error: 'Erreur lors de l\'enregistrement de la progression' }),
    )
  })

// ============================================
// STATISTICS
// ============================================

export const getProgressStatsByStatus = authServerFn
  .inputValidator(z.object({ schoolId: z.string(), termId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    return (await progressQueries.getProgressStatsByStatus(data.schoolId, data.termId)).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération des statistiques' }),
    )
  })

export const getProgressBySubject = authServerFn
  .inputValidator(z.object({ schoolId: z.string(), termId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    return (await progressQueries.getProgressBySubject(data.schoolId, data.termId)).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération de la progression par matière' }),
    )
  })

export const getTeacherProgressSummary = authServerFn
  .inputValidator(z.object({ teacherId: z.string(), termId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    return (await progressQueries.getTeacherProgressSummary(data.teacherId, data.termId)).match(
      result => ({ success: true as const, data: result }),
      _ => ({ success: false as const, error: 'Erreur lors de la récupération du résumé par enseignant' }),
    )
  })
