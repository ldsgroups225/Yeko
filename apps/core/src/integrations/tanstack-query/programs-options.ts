import {
  bulkCreateChaptersMutation,
  bulkUpdateChaptersOrderMutation,
  cloneProgramTemplateMutation,
  createProgramTemplateChapterMutation,
  createProgramTemplateMutation,
  createSchoolYearTemplateMutation,
  deleteProgramTemplateChapterMutation,
  deleteProgramTemplateMutation,
  deleteSchoolYearTemplateMutation,
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
  updateProgramTemplateChapterMutation,
  updateProgramTemplateMutation,
  updateSchoolYearTemplateMutation,
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
  mutationFn: (data: any) => createSchoolYearTemplateMutation({ data }),
}

export const updateSchoolYearTemplateMutationOptions = {
  mutationFn: (data: any) => updateSchoolYearTemplateMutation({ data }),
}

export const deleteSchoolYearTemplateMutationOptions = {
  mutationFn: (data: any) => deleteSchoolYearTemplateMutation({ data }),
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
  mutationFn: (data: any) => createProgramTemplateMutation({ data }),
}

export const updateProgramTemplateMutationOptions = {
  mutationFn: (data: any) => updateProgramTemplateMutation({ data }),
}

export const deleteProgramTemplateMutationOptions = {
  mutationFn: (data: any) => deleteProgramTemplateMutation({ data }),
}

export const cloneProgramTemplateMutationOptions = {
  mutationFn: (data: any) => cloneProgramTemplateMutation({ data }),
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
  mutationFn: (data: any) => createProgramTemplateChapterMutation({ data }),
}

export const updateProgramTemplateChapterMutationOptions = {
  mutationFn: (data: any) => updateProgramTemplateChapterMutation({ data }),
}

export const deleteProgramTemplateChapterMutationOptions = {
  mutationFn: (data: any) => deleteProgramTemplateChapterMutation({ data }),
}

export const bulkUpdateChaptersOrderMutationOptions = {
  mutationFn: (data: any) => bulkUpdateChaptersOrderMutation({ data }),
}

export const bulkCreateChaptersMutationOptions = {
  mutationFn: (data: any) => bulkCreateChaptersMutation({ data }),
}

// ===== PROGRAM VERSIONS =====

export const publishProgramMutationOptions = {
  mutationFn: (data: any) => publishProgramMutation({ data }),
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
  mutationFn: (data: any) => restoreProgramVersionMutation({ data }),
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
