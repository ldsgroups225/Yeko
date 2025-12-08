import * as progressQueries from '@repo/data-ops/queries/curriculum-progress'
import { createServerFn } from '@tanstack/react-start'
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

// ============================================
// CLASS SESSIONS
// ============================================

export const getClassSessions = createServerFn()
  .inputValidator(getClassSessionsSchema)
  .handler(async ({ data }) => {
    return await progressQueries.getClassSessions(data)
  })

export const getClassSession = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    return await progressQueries.getClassSessionById(data.id)
  })

export const createClassSession = createServerFn()
  .inputValidator(createClassSessionSchema)
  .handler(async ({ data }) => {
    const session = await progressQueries.createClassSession({
      id: crypto.randomUUID(),
      ...data,
    })
    return { success: true, data: session }
  })

export const updateClassSession = createServerFn()
  .inputValidator(updateClassSessionSchema)
  .handler(async ({ data }) => {
    const { id, ...updateData } = data
    const session = await progressQueries.updateClassSession(id, updateData)
    return { success: true, data: session }
  })

export const markSessionCompleted = createServerFn()
  .inputValidator(markSessionCompletedSchema)
  .handler(async ({ data }) => {
    const { id, ...completionData } = data
    const session = await progressQueries.markSessionCompleted(id, completionData)
    return { success: true, data: session }
  })

export const deleteClassSession = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await progressQueries.deleteClassSession(data.id)
    return { success: true }
  })

// ============================================
// CHAPTER COMPLETIONS
// ============================================

export const getChapterCompletions = createServerFn()
  .inputValidator(z.object({
    classId: z.string(),
    subjectId: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    return await progressQueries.getChapterCompletions(data)
  })

export const markChapterComplete = createServerFn()
  .inputValidator(markChapterCompleteSchema)
  .handler(async ({ data }) => {
    // Check if already completed
    const isCompleted = await progressQueries.isChapterCompleted(data.classId, data.chapterId)
    if (isCompleted) {
      return { success: false, error: 'Chapitre déjà marqué comme terminé' }
    }

    const completion = await progressQueries.markChapterComplete({
      id: crypto.randomUUID(),
      ...data,
    })

    return { success: true, data: completion }
  })

export const unmarkChapterComplete = createServerFn()
  .inputValidator(unmarkChapterCompleteSchema)
  .handler(async ({ data }) => {
    await progressQueries.unmarkChapterComplete(data.classId, data.chapterId)
    return { success: true }
  })

export const isChapterCompleted = createServerFn()
  .inputValidator(z.object({ classId: z.string(), chapterId: z.string() }))
  .handler(async ({ data }) => {
    return await progressQueries.isChapterCompleted(data.classId, data.chapterId)
  })

// ============================================
// CURRICULUM PROGRESS
// ============================================

export const getCurriculumProgress = createServerFn()
  .inputValidator(getProgressSchema)
  .handler(async ({ data }) => {
    return await progressQueries.getCurriculumProgress(data)
  })

export const getProgressOverview = createServerFn()
  .inputValidator(getProgressOverviewSchema)
  .handler(async ({ data }) => {
    return await progressQueries.getProgressOverview(data)
  })

export const getClassesBehindSchedule = createServerFn()
  .inputValidator(getClassesBehindSchema)
  .handler(async ({ data }) => {
    return await progressQueries.getClassesBehindSchedule(data)
  })

export const recalculateProgress = createServerFn()
  .inputValidator(recalculateProgressSchema)
  .handler(async ({ data }) => {
    // Calculate progress
    const progress = await progressQueries.calculateProgress({
      classId: data.classId,
      subjectId: data.subjectId,
      termId: data.termId,
      programTemplateId: data.programTemplateId,
      termStartDate: new Date(data.termStartDate),
      termEndDate: new Date(data.termEndDate),
    })

    // Upsert progress record
    const record = await progressQueries.upsertCurriculumProgress({
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

    return { success: true, data: record }
  })

// ============================================
// STATISTICS
// ============================================

export const getProgressStatsByStatus = createServerFn()
  .inputValidator(z.object({ schoolId: z.string(), termId: z.string() }))
  .handler(async ({ data }) => {
    return await progressQueries.getProgressStatsByStatus(data.schoolId, data.termId)
  })

export const getProgressBySubject = createServerFn()
  .inputValidator(z.object({ schoolId: z.string(), termId: z.string() }))
  .handler(async ({ data }) => {
    return await progressQueries.getProgressBySubject(data.schoolId, data.termId)
  })

export const getTeacherProgressSummary = createServerFn()
  .inputValidator(z.object({ teacherId: z.string(), termId: z.string() }))
  .handler(async ({ data }) => {
    return await progressQueries.getTeacherProgressSummary(data.teacherId, data.termId)
  })
