import { Result as R } from '@praha/byethrow'
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

    const _result1 = await progressQueries.getClassSessions(data)
    if (R.isFailure(_result1))
      return { success: false as const, error: 'Erreur lors de la récupération des sessions' }
    return { success: true as const, data: _result1.value }
  })

export const getClassSession = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const _result2 = await progressQueries.getClassSessionById(data.id)
    if (R.isFailure(_result2))
      return { success: false as const, error: 'Erreur lors de la récupération de la session' }
    return { success: true as const, data: _result2.value }
  })

export const createClassSession = authServerFn
  .inputValidator(createClassSessionSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const _result3 = await progressQueries.createClassSession({
      id: crypto.randomUUID(),
      ...data,
    })
    if (R.isFailure(_result3))
      return { success: false as const, error: 'Erreur lors de la création de la session' }
    return { success: true as const, data: _result3.value }
  })

export const updateClassSession = authServerFn
  .inputValidator(updateClassSessionSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { id, ...updateData } = data
    const _result4 = await progressQueries.updateClassSession(id, updateData)
    if (R.isFailure(_result4))
      return { success: false as const, error: 'Erreur lors de la mise à jour de la session' }
    return { success: true as const, data: _result4.value }
  })

export const markSessionCompleted = authServerFn
  .inputValidator(markSessionCompletedSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const { id, ...completionData } = data
    const _result5 = await progressQueries.markSessionCompleted(id, completionData)
    if (R.isFailure(_result5))
      return { success: false as const, error: 'Erreur lors de la validation de la session' }
    return { success: true as const, data: _result5.value }
  })

export const deleteClassSession = authServerFn
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const _result6 = await progressQueries.deleteClassSession(data.id)
    if (R.isFailure(_result6))
      return { success: false as const, error: 'Erreur lors de la suppression de la session' }
    return { success: true as const, data: { success: true } }
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

    const _result7 = await progressQueries.getChapterCompletions(data)
    if (R.isFailure(_result7))
      return { success: false as const, error: 'Erreur lors de la récupération des chapitres terminés' }
    return { success: true as const, data: _result7.value }
  })

export const markChapterComplete = authServerFn
  .inputValidator(markChapterCompleteSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    // Check if already completed
    const _result8 = await progressQueries.isChapterCompleted(data.classId, data.chapterId)
    const isCompleted = R.isFailure(_result8) ? false : _result8.value
    if (isCompleted) {
      return { success: false as const, error: 'Chapitre déjà marqué comme terminé' }
    }

    const _result9 = await progressQueries.markChapterComplete({
      id: crypto.randomUUID(),
      ...data,
    })
    if (R.isFailure(_result9))
      return { success: false as const, error: 'Erreur lors de la validation du chapitre' }
    return { success: true as const, data: _result9.value }
  })

export const unmarkChapterComplete = authServerFn
  .inputValidator(unmarkChapterCompleteSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const _result10 = await progressQueries.unmarkChapterComplete(data.classId, data.chapterId)
    if (R.isFailure(_result10))
      return { success: false as const, error: 'Erreur lors de l\'annulation du chapitre' }
    return { success: true as const, data: { success: true } }
  })

export const isChapterCompleted = authServerFn
  .inputValidator(z.object({ classId: z.string(), chapterId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const _result11 = await progressQueries.isChapterCompleted(data.classId, data.chapterId)
    if (R.isFailure(_result11))
      return { success: false as const, error: 'Erreur lors de la vérification du chapitre' }
    return { success: true as const, data: _result11.value }
  })

// ============================================
// CURRICULUM PROGRESS
// ============================================

export const getCurriculumProgress = authServerFn
  .inputValidator(getProgressSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const _result12 = await progressQueries.getCurriculumProgress(data)
    if (R.isFailure(_result12))
      return { success: false as const, error: 'Erreur lors de la récupération de la progression' }
    return { success: true as const, data: _result12.value }
  })

export const getProgressOverview = authServerFn
  .inputValidator(getProgressOverviewSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const _result13 = await progressQueries.getProgressOverview(data)
    if (R.isFailure(_result13))
      return { success: false as const, error: 'Erreur lors de la récupération de la vue d\'ensemble' }
    return { success: true as const, data: _result13.value }
  })

export const getClassesBehindSchedule = authServerFn
  .inputValidator(getClassesBehindSchema)
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const _result14 = await progressQueries.getClassesBehindSchedule(data)
    if (R.isFailure(_result14))
      return { success: false as const, error: 'Erreur lors de la récupération des classes en retard' }
    return { success: true as const, data: _result14.value }
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

    if (R.isFailure(progressResult)) {
      return { success: false as const, error: 'Erreur lors du calcul de la progression' }
    }
    const progress = progressResult.value

    // Upsert progress record
    const _result15 = await progressQueries.upsertCurriculumProgress({
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
    })
    if (R.isFailure(_result15))
      return { success: false as const, error: 'Erreur lors de l\'enregistrement de la progression' }
    return { success: true as const, data: _result15.value }
  })

// ============================================
// STATISTICS
// ============================================

export const getProgressStatsByStatus = authServerFn
  .inputValidator(z.object({ schoolId: z.string(), termId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const _result16 = await progressQueries.getProgressStatsByStatus(data.schoolId, data.termId)
    if (R.isFailure(_result16))
      return { success: false as const, error: 'Erreur lors de la récupération des statistiques' }
    return { success: true as const, data: _result16.value }
  })

export const getProgressBySubject = authServerFn
  .inputValidator(z.object({ schoolId: z.string(), termId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const _result17 = await progressQueries.getProgressBySubject(data.schoolId, data.termId)
    if (R.isFailure(_result17))
      return { success: false as const, error: 'Erreur lors de la récupération de la progression par matière' }
    return { success: true as const, data: _result17.value }
  })

export const getTeacherProgressSummary = authServerFn
  .inputValidator(z.object({ teacherId: z.string(), termId: z.string() }))
  .handler(async ({ data, context }) => {
    if (!context?.school)
      return { success: false as const, error: 'Établissement non sélectionné' }

    const _result18 = await progressQueries.getTeacherProgressSummary(data.teacherId, data.termId)
    if (R.isFailure(_result18))
      return { success: false as const, error: 'Erreur lors de la récupération du résumé par enseignant' }
    return { success: true as const, data: _result18.value }
  })
