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

// ===== SCHOOL YEAR TEMPLATES =====

export function schoolYearTemplatesQueryOptions() {
  return {
    queryKey: ['school-year-templates'],
    queryFn: () => schoolYearTemplatesQuery(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  }
}

export function schoolYearTemplateByIdQueryOptions(id: string) {
  return {
    queryKey: ['school-year-template', id],
    queryFn: () => schoolYearTemplateByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  }
}

export const createSchoolYearTemplateMutationOptions = {
  mutationFn: (data: CreateSchoolYearTemplateInput) => createSchoolYearTemplateMutation({ data }),
}

export const updateSchoolYearTemplateMutationOptions = {
  mutationFn: (data: UpdateSchoolYearTemplateInput) => updateSchoolYearTemplateMutation({ data }),
}

export const deleteSchoolYearTemplateMutationOptions = {
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
  return {
    queryKey: ['program-templates', params],
    queryFn: () => programTemplatesQuery({ data: params }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  }
}

export function programTemplateByIdQueryOptions(id: string) {
  return {
    queryKey: ['program-template', id],
    queryFn: () => programTemplateByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  }
}

export const createProgramTemplateMutationOptions = {
  mutationFn: (data: CreateProgramTemplateInput) => createProgramTemplateMutation({ data }),
}

export const updateProgramTemplateMutationOptions = {
  mutationFn: (data: UpdateProgramTemplateInput) => updateProgramTemplateMutation({ data }),
}

export const deleteProgramTemplateMutationOptions = {
  mutationFn: (data: ProgramTemplateIdInput) => deleteProgramTemplateMutation({ data }),
}

export const cloneProgramTemplateMutationOptions = {
  mutationFn: (data: CloneProgramTemplateInput) => cloneProgramTemplateMutation({ data }),
}

// ===== PROGRAM TEMPLATE CHAPTERS =====

export function programTemplateChaptersQueryOptions(programTemplateId: string) {
  return {
    queryKey: ['program-template-chapters', programTemplateId],
    queryFn: () => programTemplateChaptersQuery({ data: { id: programTemplateId } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!programTemplateId,
  }
}

export function programTemplateChapterByIdQueryOptions(id: string) {
  return {
    queryKey: ['program-template-chapter', id],
    queryFn: () => programTemplateChapterByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  }
}

export const createProgramTemplateChapterMutationOptions = {
  mutationFn: (data: CreateProgramTemplateChapterInput) => createProgramTemplateChapterMutation({ data }),
}

export const updateProgramTemplateChapterMutationOptions = {
  mutationFn: (data: UpdateProgramTemplateChapterInput) => updateProgramTemplateChapterMutation({ data }),
}

export const deleteProgramTemplateChapterMutationOptions = {
  mutationFn: (data: ProgramTemplateChapterIdInput) => deleteProgramTemplateChapterMutation({ data }),
}

export const bulkUpdateChaptersOrderMutationOptions = {
  mutationFn: (data: BulkUpdateChaptersOrderInput) => bulkUpdateChaptersOrderMutation({ data }),
}

export const bulkCreateChaptersMutationOptions = {
  mutationFn: (data: BulkCreateChaptersInput) => bulkCreateChaptersMutation({ data }),
}

// ===== PROGRAM VERSIONS =====

export const publishProgramMutationOptions = {
  mutationFn: (data: PublishProgramInput) => publishProgramMutation({ data }),
}

export function getProgramVersionsQueryOptions(programTemplateId: string) {
  return {
    queryKey: ['program-versions', programTemplateId],
    queryFn: () => getProgramVersionsQuery({ data: { id: programTemplateId } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!programTemplateId,
  }
}

export const restoreProgramVersionMutationOptions = {
  mutationFn: (data: RestoreProgramVersionInput) => restoreProgramVersionMutation({ data }),
}

// ===== PROGRAM STATS =====

export function programStatsQueryOptions() {
  return {
    queryKey: ['program-stats'],
    queryFn: () => programStatsQuery(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  }
}

// ===== TERM TEMPLATES =====

export function termTemplatesQueryOptions(schoolYearTemplateId?: string) {
  return {
    queryKey: ['term-templates', schoolYearTemplateId],
    queryFn: () => termTemplatesQuery({ data: { schoolYearTemplateId } }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  }
}

export function termTemplateByIdQueryOptions(id: string) {
  return {
    queryKey: ['term-template', id],
    queryFn: () => termTemplateByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  }
}

export function schoolYearTemplatesWithTermsQueryOptions() {
  return {
    queryKey: ['school-year-templates-with-terms'],
    queryFn: () => schoolYearTemplatesWithTermsQuery(),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  }
}

export const createTermTemplateMutationOptions = {
  mutationFn: (data: CreateTermTemplateInput) => createTermTemplateMutation({ data }),
}

export const updateTermTemplateMutationOptions = {
  mutationFn: (data: UpdateTermTemplateInput) => updateTermTemplateMutation({ data }),
}

export const deleteTermTemplateMutationOptions = {
  mutationFn: (data: TermTemplateIdInput) => deleteTermTemplateMutation({ data }),
}

export const bulkCreateTermTemplatesMutationOptions = {
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
