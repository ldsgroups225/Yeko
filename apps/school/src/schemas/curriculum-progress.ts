import { z } from 'zod'

// ============================================
// STATUS TYPES
// ============================================

export const classSessionStatuses = ['scheduled', 'completed', 'cancelled', 'rescheduled'] as const
export type ClassSessionStatus = typeof classSessionStatuses[number]

export const progressStatuses = ['on_track', 'slightly_behind', 'significantly_behind', 'ahead'] as const
export type ProgressStatus = typeof progressStatuses[number]

// ============================================
// CLASS SESSION SCHEMAS
// ============================================

export const getClassSessionsSchema = z.object({
  classId: z.string().min(1, 'Classe requise'),
  subjectId: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(classSessionStatuses).optional(),
})

export type GetClassSessionsInput = z.infer<typeof getClassSessionsSchema>

export const createClassSessionSchema = z.object({
  classId: z.string().min(1, 'Classe requise'),
  subjectId: z.string().min(1, 'Matière requise'),
  teacherId: z.string().min(1, 'Enseignant requis'),
  chapterId: z.string().optional(),
  timetableSessionId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Heure invalide'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Heure invalide'),
  topic: z.string().max(200).optional(),
  objectives: z.string().max(500).optional(),
  homework: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
})

export type CreateClassSessionInput = z.infer<typeof createClassSessionSchema>

export const updateClassSessionSchema = z.object({
  id: z.string().min(1),
  chapterId: z.string().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  topic: z.string().max(200).nullable().optional(),
  objectives: z.string().max(500).nullable().optional(),
  homework: z.string().max(500).nullable().optional(),
  status: z.enum(classSessionStatuses).optional(),
  studentsPresent: z.number().int().min(0).optional(),
  studentsAbsent: z.number().int().min(0).optional(),
  notes: z.string().max(1000).nullable().optional(),
})

export type UpdateClassSessionInput = z.infer<typeof updateClassSessionSchema>

export const markSessionCompletedSchema = z.object({
  id: z.string().min(1),
  chapterId: z.string().optional(),
  studentsPresent: z.number().int().min(0).optional(),
  studentsAbsent: z.number().int().min(0).optional(),
  notes: z.string().max(1000).optional(),
})

export type MarkSessionCompletedInput = z.infer<typeof markSessionCompletedSchema>

// ============================================
// CHAPTER COMPLETION SCHEMAS
// ============================================

export const markChapterCompleteSchema = z.object({
  classId: z.string().min(1, 'Classe requise'),
  subjectId: z.string().min(1, 'Matière requise'),
  chapterId: z.string().min(1, 'Chapitre requis'),
  teacherId: z.string().min(1, 'Enseignant requis'),
  classSessionId: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export type MarkChapterCompleteInput = z.infer<typeof markChapterCompleteSchema>

export const unmarkChapterCompleteSchema = z.object({
  classId: z.string().min(1),
  chapterId: z.string().min(1),
})

export type UnmarkChapterCompleteInput = z.infer<typeof unmarkChapterCompleteSchema>

// ============================================
// CURRICULUM PROGRESS SCHEMAS
// ============================================

export const getProgressSchema = z.object({
  classId: z.string().min(1, 'Classe requise'),
  termId: z.string().min(1, 'Trimestre requis'),
  subjectId: z.string().optional(),
})

export type GetProgressInput = z.infer<typeof getProgressSchema>

export const getProgressOverviewSchema = z.object({
  schoolId: z.string().min(1, 'École requise'),
  schoolYearId: z.string().min(1, 'Année scolaire requise'),
  termId: z.string().optional(),
})

export type GetProgressOverviewInput = z.infer<typeof getProgressOverviewSchema>

export const getClassesBehindSchema = z.object({
  schoolId: z.string().min(1),
  termId: z.string().min(1),
  threshold: z.number().optional(), // Default -10 (10% behind)
})

export type GetClassesBehindInput = z.infer<typeof getClassesBehindSchema>

export const recalculateProgressSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  termId: z.string().min(1),
  programTemplateId: z.string().min(1),
  termStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  termEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export type RecalculateProgressInput = z.infer<typeof recalculateProgressSchema>

// ============================================
// STATUS LABELS (French)
// ============================================

export const classSessionStatusLabels: Record<ClassSessionStatus, string> = {
  scheduled: 'Planifié',
  completed: 'Terminé',
  cancelled: 'Annulé',
  rescheduled: 'Reporté',
}

export const progressStatusLabels: Record<ProgressStatus, string> = {
  on_track: 'En cours',
  slightly_behind: 'Légèrement en retard',
  significantly_behind: 'Significativement en retard',
  ahead: 'En avance',
}

// ============================================
// STATUS COLORS (for UI)
// ============================================

export const progressStatusColors: Record<ProgressStatus, { bg: string, text: string, border: string }> = {
  on_track: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  slightly_behind: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  significantly_behind: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
  ahead: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
}

export const classSessionStatusColors: Record<ClassSessionStatus, { bg: string, text: string }> = {
  scheduled: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
  },
  completed: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
  },
  cancelled: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
  },
  rescheduled: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
  },
}
