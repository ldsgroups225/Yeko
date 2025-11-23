import { z } from 'zod'

// ===== TRACKS =====

export const CreateTrackSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  code: z.string().min(2, 'Le code doit contenir au moins 2 caractères').regex(/^[A-Z0-9_]+$/, 'Le code doit contenir uniquement des lettres majuscules, chiffres et underscores'),
  educationLevelId: z.number().int().min(1),
})

export const UpdateTrackSchema = CreateTrackSchema.partial().merge(z.object({
  id: z.string().min(1),
}))

export const TrackIdSchema = z.object({
  id: z.string().min(1),
})

// ===== GRADES =====

export const CreateGradeSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  code: z.string().min(2, 'Le code doit contenir au moins 2 caractères'),
  order: z.number().int().min(1),
  trackId: z.string().min(1),
})

export const UpdateGradeSchema = CreateGradeSchema.partial().merge(z.object({
  id: z.string().min(1),
}))

export const GradeIdSchema = z.object({
  id: z.string().min(1),
})

export const GetGradesSchema = z.object({
  trackId: z.string().optional(),
})

// ===== SERIES =====

export const CreateSerieSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  code: z.string().min(1, 'Le code est requis').regex(/^[A-Z0-9_]+$/, 'Le code doit contenir uniquement des lettres majuscules, chiffres et underscores'),
  trackId: z.string().min(1),
})

export const UpdateSerieSchema = CreateSerieSchema.partial().merge(z.object({
  id: z.string().min(1),
}))

export const SerieIdSchema = z.object({
  id: z.string().min(1),
})

export const GetSeriesSchema = z.object({
  trackId: z.string().optional(),
})

// ===== SUBJECTS =====

export const CreateSubjectSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  shortName: z.string().min(1, 'Le nom court est requis').max(10, 'Le nom court ne doit pas dépasser 10 caractères').optional(),
  category: z.enum(['Scientifique', 'Littéraire', 'Sportif', 'Autre']).default('Autre'),
})

export const UpdateSubjectSchema = CreateSubjectSchema.partial().merge(z.object({
  id: z.string().min(1),
}))

export const SubjectIdSchema = z.object({
  id: z.string().min(1),
})

export const GetSubjectsSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// Type exports
export type CreateTrackInput = z.infer<typeof CreateTrackSchema>
export type UpdateTrackInput = z.infer<typeof UpdateTrackSchema>
export type TrackIdInput = z.infer<typeof TrackIdSchema>

export type CreateGradeInput = z.infer<typeof CreateGradeSchema>
export type UpdateGradeInput = z.infer<typeof UpdateGradeSchema>
export type GradeIdInput = z.infer<typeof GradeIdSchema>
export type GetGradesInput = z.infer<typeof GetGradesSchema>

export type CreateSerieInput = z.infer<typeof CreateSerieSchema>
export type UpdateSerieInput = z.infer<typeof UpdateSerieSchema>
export type SerieIdInput = z.infer<typeof SerieIdSchema>
export type GetSeriesInput = z.infer<typeof GetSeriesSchema>

export type CreateSubjectInput = z.infer<typeof CreateSubjectSchema>
export type UpdateSubjectInput = z.infer<typeof UpdateSubjectSchema>
export type SubjectIdInput = z.infer<typeof SubjectIdSchema>
export type GetSubjectsInput = z.infer<typeof GetSubjectsSchema>
