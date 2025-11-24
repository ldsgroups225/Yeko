import { z } from 'zod'

// ===== SCHOOL YEAR TEMPLATES =====

export const CreateSchoolYearTemplateSchema = z.object({
  name: z.string().min(4, 'Le nom doit contenir au moins 4 caractères (ex: 2025-2026)'),
  isActive: z.boolean().default(false),
})

export const UpdateSchoolYearTemplateSchema = CreateSchoolYearTemplateSchema.partial().merge(z.object({
  id: z.string().min(1),
}))

export const SchoolYearTemplateIdSchema = z.object({
  id: z.string().min(1),
})

// ===== PROGRAM TEMPLATES =====

export const CreateProgramTemplateSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  schoolYearTemplateId: z.string().min(1, 'L\'année scolaire est requise'),
  subjectId: z.string().min(1, 'La matière est requise'),
  gradeId: z.string().min(1, 'La classe est requise'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  description: z.string().optional(),
})

export const UpdateProgramTemplateSchema = CreateProgramTemplateSchema.partial().merge(z.object({
  id: z.string().min(1),
}))

export const ProgramTemplateIdSchema = z.object({
  id: z.string().min(1),
})

export const GetProgramTemplatesSchema = z.object({
  schoolYearTemplateId: z.string().optional(),
  subjectId: z.string().optional(),
  gradeId: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  status: z.enum(['draft', 'published', 'archived']).optional(),
})

export const CloneProgramTemplateSchema = z.object({
  id: z.string().min(1),
  newSchoolYearTemplateId: z.string().min(1, 'L\'année scolaire cible est requise'),
  newName: z.string().min(3, 'Le nouveau nom doit contenir au moins 3 caractères'),
})

// ===== PROGRAM TEMPLATE CHAPTERS =====

export const CreateProgramTemplateChapterSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  objectives: z.string().optional(),
  order: z.number().int().min(1),
  durationHours: z.number().int().min(0).optional(),
  programTemplateId: z.string().min(1),
})

export const UpdateProgramTemplateChapterSchema = CreateProgramTemplateChapterSchema.partial().merge(z.object({
  id: z.string().min(1),
}))

export const ProgramTemplateChapterIdSchema = z.object({
  id: z.string().min(1),
})

export const BulkUpdateChaptersOrderSchema = z.array(z.object({
  id: z.string(),
  order: z.number().int().min(1),
}))

export const BulkCreateChaptersSchema = z.object({
  programTemplateId: z.string().min(1),
  chapters: z.array(z.object({
    title: z.string().min(3),
    objectives: z.string().optional(),
    order: z.number().int().min(1).optional(),
    durationHours: z.number().int().min(0).optional(),
  })),
})

export const PublishProgramSchema = z.object({
  id: z.string().min(1),
})

export const RestoreProgramVersionSchema = z.object({
  versionId: z.string().min(1),
})

// Type exports
export type CreateSchoolYearTemplateInput = z.infer<typeof CreateSchoolYearTemplateSchema>
export type UpdateSchoolYearTemplateInput = z.infer<typeof UpdateSchoolYearTemplateSchema>
export type SchoolYearTemplateIdInput = z.infer<typeof SchoolYearTemplateIdSchema>

export type CreateProgramTemplateInput = z.infer<typeof CreateProgramTemplateSchema>
export type UpdateProgramTemplateInput = z.infer<typeof UpdateProgramTemplateSchema>
export type ProgramTemplateIdInput = z.infer<typeof ProgramTemplateIdSchema>
export type GetProgramTemplatesInput = z.infer<typeof GetProgramTemplatesSchema>
export type CloneProgramTemplateInput = z.infer<typeof CloneProgramTemplateSchema>

export type CreateProgramTemplateChapterInput = z.infer<typeof CreateProgramTemplateChapterSchema>
export type UpdateProgramTemplateChapterInput = z.infer<typeof UpdateProgramTemplateChapterSchema>
export type ProgramTemplateChapterIdInput = z.infer<typeof ProgramTemplateChapterIdSchema>
export type BulkUpdateChaptersOrderInput = z.infer<typeof BulkUpdateChaptersOrderSchema>
export type BulkCreateChaptersInput = z.infer<typeof BulkCreateChaptersSchema>
export type PublishProgramInput = z.infer<typeof PublishProgramSchema>
export type RestoreProgramVersionInput = z.infer<typeof RestoreProgramVersionSchema>
