import { z } from 'zod'

// Grade type enum
export const gradeTypes = ['quiz', 'test', 'exam', 'participation', 'homework', 'project'] as const
export type GradeType = typeof gradeTypes[number]

// Grade status enum
export const gradeStatuses = ['draft', 'submitted', 'validated', 'rejected'] as const
export type GradeStatus = typeof gradeStatuses[number]

// Grade value validation (0-20, quarter points)
export const gradeValueSchema = z.number()
  .min(0, 'La note doit être >= 0')
  .max(20, 'La note doit être <= 20')
  .refine(
    val => Number.isFinite(val) && (val * 4) % 1 === 0,
    'La note doit être un multiple de 0.25',
  )

// Create single grade schema
export const createGradeSchema = z.object({
  studentId: z.string().min(1, 'Élève requis'),
  classId: z.string().min(1, 'Classe requise'),
  subjectId: z.string().min(1, 'Matière requise'),
  termId: z.string().min(1, 'Trimestre requis'),
  value: gradeValueSchema,
  type: z.enum(gradeTypes),
  weight: z.number().int().min(1).max(10).default(1),
  description: z.string().max(200).optional(),
  gradeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export type CreateGradeInput = z.infer<typeof createGradeSchema>

// Bulk grades schema
export const bulkGradesSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  termId: z.string().min(1),
  type: z.enum(gradeTypes),
  weight: z.number().int().min(1).max(10).default(1),
  description: z.string().max(200).optional(),
  gradeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  grades: z.array(z.object({
    studentId: z.string().min(1),
    value: gradeValueSchema,
  })).min(1, 'Au moins une note requise'),
})

export type BulkGradesInput = z.infer<typeof bulkGradesSchema>

// Update grade schema
export const updateGradeSchema = z.object({
  id: z.string().min(1),
  value: gradeValueSchema.optional(),
  type: z.enum(gradeTypes).optional(),
  weight: z.number().int().min(1).max(10).optional(),
  description: z.string().max(200).optional(),
  gradeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export type UpdateGradeInput = z.infer<typeof updateGradeSchema>

// Submit grades for validation
export const submitGradesSchema = z.object({
  gradeIds: z.array(z.string()).min(1, 'Sélectionnez au moins une note'),
})

export type SubmitGradesInput = z.infer<typeof submitGradesSchema>

// Validate grades schema
export const validateGradesSchema = z.object({
  gradeIds: z.array(z.string()).min(1),
  comment: z.string().max(500).optional(),
})

export type ValidateGradesInput = z.infer<typeof validateGradesSchema>

// Reject grades schema
export const rejectGradesSchema = z.object({
  gradeIds: z.array(z.string()).min(1),
  reason: z.string()
    .min(10, 'Le motif doit contenir au moins 10 caractères')
    .max(500, 'Le motif ne peut pas dépasser 500 caractères'),
})

export type RejectGradesInput = z.infer<typeof rejectGradesSchema>

// Query params schemas
export const getGradesByClassSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  termId: z.string().min(1),
  teacherId: z.string().min(1).optional(),
})

export const getPendingValidationsSchema = z.object({
  schoolId: z.string().min(1),
  termId: z.string().optional(),
  classId: z.string().optional(),
  subjectId: z.string().optional(),
})

export const getGradeStatisticsSchema = z.object({
  classId: z.string().min(1),
  termId: z.string().min(1),
  subjectId: z.string().optional(),
})

// Grade type labels (French)
export const gradeTypeLabels: Record<GradeType, string> = {
  quiz: 'Interrogation',
  test: 'Devoir',
  exam: 'Examen',
  participation: 'Participation',
  homework: 'Travail maison',
  project: 'Projet',
}

// Grade status labels (French)
export const gradeStatusLabels: Record<GradeStatus, string> = {
  draft: 'Brouillon',
  submitted: 'Soumis',
  validated: 'Validé',
  rejected: 'Rejeté',
}

// Default weights by grade type
export const defaultGradeWeights: Record<GradeType, number> = {
  quiz: 1,
  homework: 1,
  participation: 1,
  test: 2,
  project: 2,
  exam: 3,
}
