import type {
  Grade,
  ProgramTemplate,
  ProgramTemplateChapter,
  ProgramTemplateVersion,
  SchoolYearTemplate,
  Subject,
  TermTemplate,
} from '@repo/data-ops/drizzle/core-schema'
import type {
  BulkCreateChaptersInput,
  BulkCreateTermTemplatesInput,
  BulkUpdateChaptersOrderInput,
  CloneProgramTemplateInput,
  CreateProgramTemplateChapterInput,
  CreateProgramTemplateInput,
  CreateSchoolYearTemplateInput,
  CreateTermTemplateInput,
  ProgramTemplateChapterIdInput,
  ProgramTemplateIdInput,
  PublishProgramInput,
  RestoreProgramVersionInput,
  SchoolYearTemplateIdInput,
  TermTemplateIdInput,
  UpdateProgramTemplateChapterInput,
  UpdateProgramTemplateInput,
  UpdateSchoolYearTemplateInput,
  UpdateTermTemplateInput,
} from '@/schemas/programs'
import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import {
  bulkCreateChaptersMutation,
  bulkCreateTermTemplatesMutation,
  bulkUpdateChaptersOrderMutation,
  cloneProgramTemplateMutation,
  createProgramTemplateChapterMutation,
  createProgramTemplateMutation,
  createSchoolYearTemplateMutation,
  createTermTemplateMutation,
  deleteProgramTemplateChapterMutation,
  deleteProgramTemplateMutation,
  deleteSchoolYearTemplateMutation,
  deleteTermTemplateMutation,
  getProgramVersionsQuery,
  programStatsQuery,
  programTemplateByIdQuery,
  programTemplateChapterByIdQuery,
  programTemplateChaptersQuery,
  programTemplatesQuery,
  publishProgramMutation,
  restoreProgramVersionMutation,
  schoolYearTemplateByIdQuery,
  schoolYearTemplatesQuery,
  schoolYearTemplatesWithTermsQuery,
  termTemplateByIdQuery,
  termTemplatesQuery,
  updateProgramTemplateChapterMutation,
  updateProgramTemplateMutation,
  updateSchoolYearTemplateMutation,
  updateTermTemplateMutation,
} from '@/core/functions/programs'

// Define the complex type locally since it's not exported from the query file
type ProgramWithDetails = ProgramTemplate & {
  schoolYearTemplate: Pick<SchoolYearTemplate, 'id' | 'name' | 'isActive'> | null
  subject: Pick<Subject, 'id' | 'name' | 'shortName' | 'category'> | null
  grade: Pick<Grade, 'id' | 'name' | 'code' | 'order'> | null
}

// ===== MUTATION KEYS =====

export const programsMutationKeys = {
  createSchoolYearTemplate: ['programs', 'schoolYearTemplate', 'create'] as const,
  updateSchoolYearTemplate: ['programs', 'schoolYearTemplate', 'update'] as const,
  deleteSchoolYearTemplate: ['programs', 'schoolYearTemplate', 'delete'] as const,
  createProgramTemplate: ['programs', 'programTemplate', 'create'] as const,
  updateProgramTemplate: ['programs', 'programTemplate', 'update'] as const,
  deleteProgramTemplate: ['programs', 'programTemplate', 'delete'] as const,
  cloneProgramTemplate: ['programs', 'programTemplate', 'clone'] as const,
  createChapter: ['programs', 'chapter', 'create'] as const,
  updateChapter: ['programs', 'chapter', 'update'] as const,
  deleteChapter: ['programs', 'chapter', 'delete'] as const,
  bulkUpdateChaptersOrder: ['programs', 'chapter', 'bulkUpdateOrder'] as const,
  bulkCreateChapters: ['programs', 'chapter', 'bulkCreate'] as const,
  publishProgram: ['programs', 'publish'] as const,
  restoreProgramVersion: ['programs', 'restoreVersion'] as const,
  createTermTemplate: ['programs', 'termTemplate', 'create'] as const,
  updateTermTemplate: ['programs', 'termTemplate', 'update'] as const,
  deleteTermTemplate: ['programs', 'termTemplate', 'delete'] as const,
  bulkCreateTermTemplates: ['programs', 'termTemplate', 'bulkCreate'] as const,
}

// ===== SCHOOL YEAR TEMPLATES =====

export function schoolYearTemplatesQueryOptions() {
  return queryOptions<SchoolYearTemplate[]>({
    queryKey: ['school-year-templates'],
    queryFn: () => schoolYearTemplatesQuery(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function schoolYearTemplateByIdQueryOptions(id: string) {
  return queryOptions<SchoolYearTemplate | null>({
    queryKey: ['school-year-template', id],
    queryFn: () => schoolYearTemplateByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  })
}

export const createSchoolYearTemplateMutationOptions = {
  mutationKey: programsMutationKeys.createSchoolYearTemplate,
  mutationFn: (data: CreateSchoolYearTemplateInput) => createSchoolYearTemplateMutation({ data }),
}

export const updateSchoolYearTemplateMutationOptions = {
  mutationKey: programsMutationKeys.updateSchoolYearTemplate,
  mutationFn: (data: UpdateSchoolYearTemplateInput) => updateSchoolYearTemplateMutation({ data }),
}

export const deleteSchoolYearTemplateMutationOptions = {
  mutationKey: programsMutationKeys.deleteSchoolYearTemplate,
  mutationFn: (data: SchoolYearTemplateIdInput) => deleteSchoolYearTemplateMutation({ data }),
}

// ===== PROGRAM TEMPLATES =====

export function programTemplatesQueryOptions(params: {
  schoolYearTemplateId?: string
  subjectId?: string
  gradeId?: string
  search?: string
  page?: number
  limit?: number
}) {
  return queryOptions<{
    programs: ProgramWithDetails[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>({
    queryKey: ['program-templates', params],
    queryFn: () => programTemplatesQuery({ data: params }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    placeholderData: keepPreviousData,
  })
}

export function programTemplateByIdQueryOptions(id: string) {
  return queryOptions<ProgramWithDetails | null>({
    queryKey: ['program-template', id],
    queryFn: () => programTemplateByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  })
}

export const createProgramTemplateMutationOptions = {
  mutationKey: programsMutationKeys.createProgramTemplate,
  mutationFn: (data: CreateProgramTemplateInput) => createProgramTemplateMutation({ data }),
}

export const updateProgramTemplateMutationOptions = {
  mutationKey: programsMutationKeys.updateProgramTemplate,
  mutationFn: (data: UpdateProgramTemplateInput) => updateProgramTemplateMutation({ data }),
}

export const deleteProgramTemplateMutationOptions = {
  mutationKey: programsMutationKeys.deleteProgramTemplate,
  mutationFn: (data: ProgramTemplateIdInput) => deleteProgramTemplateMutation({ data }),
}

export const cloneProgramTemplateMutationOptions = {
  mutationKey: programsMutationKeys.cloneProgramTemplate,
  mutationFn: (data: CloneProgramTemplateInput) => cloneProgramTemplateMutation({ data }),
}

// ===== PROGRAM TEMPLATE CHAPTERS =====

export function programTemplateChaptersQueryOptions(programTemplateId: string) {
  return queryOptions<ProgramTemplateChapter[]>({
    queryKey: ['program-template-chapters', programTemplateId],
    queryFn: () => programTemplateChaptersQuery({ data: { id: programTemplateId } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!programTemplateId,
  })
}

export function programTemplateChapterByIdQueryOptions(id: string) {
  return queryOptions<ProgramTemplateChapter | null>({
    queryKey: ['program-template-chapter', id],
    queryFn: () => programTemplateChapterByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  })
}

export const createProgramTemplateChapterMutationOptions = {
  mutationKey: programsMutationKeys.createChapter,
  mutationFn: (data: CreateProgramTemplateChapterInput) => createProgramTemplateChapterMutation({ data }),
}

export const updateProgramTemplateChapterMutationOptions = {
  mutationKey: programsMutationKeys.updateChapter,
  mutationFn: (data: UpdateProgramTemplateChapterInput) => updateProgramTemplateChapterMutation({ data }),
}

export const deleteProgramTemplateChapterMutationOptions = {
  mutationKey: programsMutationKeys.deleteChapter,
  mutationFn: (data: ProgramTemplateChapterIdInput) => deleteProgramTemplateChapterMutation({ data }),
}

export const bulkUpdateChaptersOrderMutationOptions = {
  mutationKey: programsMutationKeys.bulkUpdateChaptersOrder,
  mutationFn: (data: BulkUpdateChaptersOrderInput) => bulkUpdateChaptersOrderMutation({ data }),
}

export const bulkCreateChaptersMutationOptions = {
  mutationKey: programsMutationKeys.bulkCreateChapters,
  mutationFn: (data: BulkCreateChaptersInput) => bulkCreateChaptersMutation({ data }),
}

// ===== PROGRAM VERSIONS =====

export const publishProgramMutationOptions = {
  mutationKey: programsMutationKeys.publishProgram,
  mutationFn: (data: PublishProgramInput) => publishProgramMutation({ data }),
}

export function getProgramVersionsQueryOptions(programTemplateId: string) {
  return queryOptions<ProgramTemplateVersion[]>({
    queryKey: ['program-versions', programTemplateId],
    queryFn: () => getProgramVersionsQuery({ data: { id: programTemplateId } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!programTemplateId,
  })
}

export const restoreProgramVersionMutationOptions = {
  mutationKey: programsMutationKeys.restoreProgramVersion,
  mutationFn: (data: RestoreProgramVersionInput) => restoreProgramVersionMutation({ data }),
}

// ===== PROGRAM STATS =====

export function programStatsQueryOptions() {
  return queryOptions<{
    programs: number
    chapters: number
    schoolYears: number
  }>({
    queryKey: ['program-stats'],
    queryFn: () => programStatsQuery(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  })
}

// ===== TERM TEMPLATES =====

export function termTemplatesQueryOptions(schoolYearTemplateId?: string) {
  return queryOptions<TermTemplate[]>({
    queryKey: ['term-templates', schoolYearTemplateId],
    queryFn: () => termTemplatesQuery({ data: { schoolYearTemplateId } }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  })
}

export function termTemplateByIdQueryOptions(id: string) {
  return queryOptions<TermTemplate | null>({
    queryKey: ['term-template', id],
    queryFn: () => termTemplateByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  })
}

export function schoolYearTemplatesWithTermsQueryOptions() {
  return queryOptions<(SchoolYearTemplate & { terms: TermTemplate[] })[]>({
    queryKey: ['school-year-templates-with-terms'],
    queryFn: () => schoolYearTemplatesWithTermsQuery(),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  })
}

export const createTermTemplateMutationOptions = {
  mutationKey: programsMutationKeys.createTermTemplate,
  mutationFn: (data: CreateTermTemplateInput) => createTermTemplateMutation({ data }),
}

export const updateTermTemplateMutationOptions = {
  mutationKey: programsMutationKeys.updateTermTemplate,
  mutationFn: (data: UpdateTermTemplateInput) => updateTermTemplateMutation({ data }),
}

export const deleteTermTemplateMutationOptions = {
  mutationKey: programsMutationKeys.deleteTermTemplate,
  mutationFn: (data: TermTemplateIdInput) => deleteTermTemplateMutation({ data }),
}

export const bulkCreateTermTemplatesMutationOptions = {
  mutationKey: programsMutationKeys.bulkCreateTermTemplates,
  mutationFn: (data: BulkCreateTermTemplatesInput) => bulkCreateTermTemplatesMutation({ data }),
}

// Export all as a single object for convenience
export const programQueries = {
  schoolYearTemplates: schoolYearTemplatesQueryOptions,
  schoolYearTemplateById: schoolYearTemplateByIdQueryOptions,
  createSchoolYearTemplate: createSchoolYearTemplateMutationOptions,
  updateSchoolYearTemplate: updateSchoolYearTemplateMutationOptions,
  deleteSchoolYearTemplate: deleteSchoolYearTemplateMutationOptions,
  programTemplates: programTemplatesQueryOptions,
  programTemplateById: programTemplateByIdQueryOptions,
  createProgramTemplate: createProgramTemplateMutationOptions,
  updateProgramTemplate: updateProgramTemplateMutationOptions,
  deleteProgramTemplate: deleteProgramTemplateMutationOptions,
  cloneProgramTemplate: cloneProgramTemplateMutationOptions,
  programTemplateChapters: programTemplateChaptersQueryOptions,
  programTemplateChapterById: programTemplateChapterByIdQueryOptions,
  createProgramTemplateChapter: createProgramTemplateChapterMutationOptions,
  updateProgramTemplateChapter: updateProgramTemplateChapterMutationOptions,
  deleteProgramTemplateChapter: deleteProgramTemplateChapterMutationOptions,
  bulkUpdateChaptersOrder: bulkUpdateChaptersOrderMutationOptions,
  bulkCreateChapters: bulkCreateChaptersMutationOptions,
  publishProgram: publishProgramMutationOptions,
  getProgramVersions: getProgramVersionsQueryOptions,
  restoreProgramVersion: restoreProgramVersionMutationOptions,
  stats: programStatsQueryOptions,
}
