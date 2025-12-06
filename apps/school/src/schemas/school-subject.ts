import { z } from 'zod'

// ===== SCHOOL SUBJECTS SCHEMAS =====

/**
 * Schema for adding subjects to school
 */
export const addSubjectsToSchoolSchema = z.object({
  subjectIds: z.array(z.string()).min(1, 'At least one subject is required'),
  schoolYearId: z.string().optional(),
})

export type AddSubjectsToSchoolInput = z.infer<typeof addSubjectsToSchoolSchema>

/**
 * Schema for toggling subject status
 */
export const toggleSchoolSubjectStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['active', 'inactive']),
})

export type ToggleSchoolSubjectStatusInput = z.infer<typeof toggleSchoolSubjectStatusSchema>

/**
 * Schema for school subjects filters
 */
export const schoolSubjectsFiltersSchema = z.object({
  schoolYearId: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  category: z.enum(['Scientifique', 'Littéraire', 'Sportif', 'Autre']).optional(),
  search: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
})

export type SchoolSubjectsFilters = z.infer<typeof schoolSubjectsFiltersSchema>

/**
 * Schema for available core subjects filters
 */
export const availableCoreSubjectsFiltersSchema = z.object({
  schoolYearId: z.string().optional(),
  category: z.enum(['Scientifique', 'Littéraire', 'Sportif', 'Autre']).optional(),
  search: z.string().optional(),
})

export type AvailableCoreSubjectsFilters = z.infer<typeof availableCoreSubjectsFiltersSchema>

/**
 * Schema for subject usage check
 */
export const checkSubjectInUseSchema = z.object({
  subjectId: z.string(),
  schoolYearId: z.string().optional(),
})

export type CheckSubjectInUseInput = z.infer<typeof checkSubjectInUseSchema>

// ===== RESPONSE TYPES =====

/**
 * School subject response type (matches API)
 */
export interface SchoolSubjectResponse {
  id: string
  schoolId: string
  subjectId: string
  schoolYearId: string
  status: 'active' | 'inactive'
  subject: {
    id: string
    name: string
    shortName: string
    category: string | null
  }
  createdAt: Date
  updatedAt: Date
}

/**
 * Subject usage stats response type
 */
export interface SubjectUsageStatsResponse {
  schoolSubjectId: string
  subjectId: string
  subjectName: string
  status: string
  usageCount: number
}

/**
 * Core subject (available to add) response type
 */
export interface CoreSubjectResponse {
  id: string
  name: string
  shortName: string
  category: string | null
}
