import type {
  CreateGradeInput,
  CreateSerieInput,
  CreateSubjectInput,
  CreateTrackInput,
  GradeIdInput,
  SerieIdInput,
  SubjectIdInput,
  TrackIdInput,
  UpdateGradeInput,
  UpdateSerieInput,
  UpdateSubjectInput,
  UpdateTrackInput,
} from '@/schemas/catalog'
import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import {
  bulkCreateSeriesMutation,
  bulkCreateSubjectsMutation,
  bulkUpdateGradesOrderMutation,
  catalogStatsQuery,
  createGradeMutation,
  createSerieMutation,
  createSubjectMutation,
  createTrackMutation,
  deleteGradeMutation,
  deleteSerieMutation,
  deleteSubjectMutation,
  deleteTrackMutation,
  educationLevelsQuery,
  gradeByIdQuery,
  gradesQuery,
  serieByIdQuery,
  seriesQuery,
  subjectByIdQuery,
  subjectsQuery,
  trackByIdQuery,
  tracksQuery,
  updateGradeMutation,
  updateSerieMutation,
  updateSubjectMutation,
  updateTrackMutation,
} from '@/core/functions/catalogs'

export const catalogsMutationKeys = {
  createTrack: ['catalogs', 'track', 'create'] as const,
  updateTrack: ['catalogs', 'track', 'update'] as const,
  deleteTrack: ['catalogs', 'track', 'delete'] as const,
  createGrade: ['catalogs', 'grade', 'create'] as const,
  updateGrade: ['catalogs', 'grade', 'update'] as const,
  deleteGrade: ['catalogs', 'grade', 'delete'] as const,
  bulkUpdateGradesOrder: ['catalogs', 'grade', 'bulkUpdateOrder'] as const,
  createSerie: ['catalogs', 'serie', 'create'] as const,
  updateSerie: ['catalogs', 'serie', 'update'] as const,
  deleteSerie: ['catalogs', 'serie', 'delete'] as const,
  bulkCreateSeries: ['catalogs', 'serie', 'bulkCreate'] as const,
  createSubject: ['catalogs', 'subject', 'create'] as const,
  updateSubject: ['catalogs', 'subject', 'update'] as const,
  deleteSubject: ['catalogs', 'subject', 'delete'] as const,
  bulkCreateSubjects: ['catalogs', 'subject', 'bulkCreate'] as const,
}

// ===== EDUCATION LEVELS =====

export function educationLevelsQueryOptions() {
  return queryOptions({
    queryKey: ['education-levels'],
    queryFn: () => educationLevelsQuery(),
    staleTime: 1000 * 60 * 60, // 1 hour (rarely changes)
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  })
}

// ===== TRACKS =====

export function tracksQueryOptions() {
  return queryOptions({
    queryKey: ['tracks'],
    queryFn: () => tracksQuery(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function trackByIdQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['track', id],
    queryFn: () => trackByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  })
}

export const createTrackMutationOptions = {
  mutationKey: catalogsMutationKeys.createTrack,
  mutationFn: (data: CreateTrackInput) => createTrackMutation({ data }),
}

export const updateTrackMutationOptions = {
  mutationKey: catalogsMutationKeys.updateTrack,
  mutationFn: (data: UpdateTrackInput) => updateTrackMutation({ data }),
}

export const deleteTrackMutationOptions = {
  mutationKey: catalogsMutationKeys.deleteTrack,
  mutationFn: (data: TrackIdInput) => deleteTrackMutation({ data }),
}

// ===== GRADES =====

export function gradesQueryOptions(trackId?: string) {
  return queryOptions({
    queryKey: ['grades', { trackId }],
    queryFn: () => gradesQuery({ data: { trackId } }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  })
}

export function gradeByIdQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['grade', id],
    queryFn: () => gradeByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  })
}

export const createGradeMutationOptions = {
  mutationKey: catalogsMutationKeys.createGrade,
  mutationFn: (data: CreateGradeInput) => createGradeMutation({ data }),
}

export const updateGradeMutationOptions = {
  mutationKey: catalogsMutationKeys.updateGrade,
  mutationFn: (data: UpdateGradeInput) => updateGradeMutation({ data }),
}

export const deleteGradeMutationOptions = {
  mutationKey: catalogsMutationKeys.deleteGrade,
  mutationFn: (data: GradeIdInput) => deleteGradeMutation({ data }),
}

export const bulkUpdateGradesOrderMutationOptions = {
  mutationKey: catalogsMutationKeys.bulkUpdateGradesOrder,
  mutationFn: (data: Array<{ id: string, order: number }>) => bulkUpdateGradesOrderMutation({ data }),
}

// ===== SERIES =====

export function seriesQueryOptions(trackId?: string) {
  return queryOptions({
    queryKey: ['series', { trackId }],
    queryFn: () => seriesQuery({ data: { trackId } }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  })
}

export function serieByIdQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['serie', id],
    queryFn: () => serieByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  })
}

export const createSerieMutationOptions = {
  mutationKey: catalogsMutationKeys.createSerie,
  mutationFn: (data: CreateSerieInput) => createSerieMutation({ data }),
}

export const updateSerieMutationOptions = {
  mutationKey: catalogsMutationKeys.updateSerie,
  mutationFn: (data: UpdateSerieInput) => updateSerieMutation({ data }),
}

export const deleteSerieMutationOptions = {
  mutationKey: catalogsMutationKeys.deleteSerie,
  mutationFn: (data: SerieIdInput) => deleteSerieMutation({ data }),
}

export const bulkCreateSeriesMutationOptions = {
  mutationKey: catalogsMutationKeys.bulkCreateSeries,
  mutationFn: (data: { series: CreateSerieInput[] }) => bulkCreateSeriesMutation({ data }),
}

// ===== SUBJECTS =====

export function subjectsQueryOptions(params: {
  category?: string
  search?: string
  page?: number
  limit?: number
}) {
  return queryOptions({
    queryKey: ['subjects', params],
    queryFn: () => subjectsQuery({ data: params }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    placeholderData: keepPreviousData,
  })
}

export function subjectByIdQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['subject', id],
    queryFn: () => subjectByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  })
}

export const createSubjectMutationOptions = {
  mutationKey: catalogsMutationKeys.createSubject,
  mutationFn: (data: CreateSubjectInput) => createSubjectMutation({ data }),
}

export const updateSubjectMutationOptions = {
  mutationKey: catalogsMutationKeys.updateSubject,
  mutationFn: (data: UpdateSubjectInput) => updateSubjectMutation({ data }),
}

export const deleteSubjectMutationOptions = {
  mutationKey: catalogsMutationKeys.deleteSubject,
  mutationFn: (data: SubjectIdInput) => deleteSubjectMutation({ data }),
}

export const bulkCreateSubjectsMutationOptions = {
  mutationKey: catalogsMutationKeys.bulkCreateSubjects,
  mutationFn: (data: { subjects: CreateSubjectInput[] }) => bulkCreateSubjectsMutation({ data }),
}

// ===== CATALOG STATS =====

export function catalogStatsQueryOptions() {
  return queryOptions({
    queryKey: ['catalog-stats'],
    queryFn: () => catalogStatsQuery(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  })
}

// Export all as a single object for convenience
export const catalogQueries = {
  educationLevels: educationLevelsQueryOptions,
  tracks: tracksQueryOptions,
  trackById: trackByIdQueryOptions,
  createTrack: createTrackMutationOptions,
  updateTrack: updateTrackMutationOptions,
  deleteTrack: deleteTrackMutationOptions,
  grades: gradesQueryOptions,
  gradeById: gradeByIdQueryOptions,
  createGrade: createGradeMutationOptions,
  updateGrade: updateGradeMutationOptions,
  deleteGrade: deleteGradeMutationOptions,
  series: seriesQueryOptions,
  serieById: serieByIdQueryOptions,
  createSerie: createSerieMutationOptions,
  updateSerie: updateSerieMutationOptions,
  deleteSerie: deleteSerieMutationOptions,
  subjects: subjectsQueryOptions,
  subjectById: subjectByIdQueryOptions,
  createSubject: createSubjectMutationOptions,
  updateSubject: updateSubjectMutationOptions,
  deleteSubject: deleteSubjectMutationOptions,
  bulkCreateSubjects: bulkCreateSubjectsMutationOptions,
  bulkUpdateGradesOrder: bulkUpdateGradesOrderMutationOptions,
  bulkCreateSeries: bulkCreateSeriesMutationOptions,
  stats: catalogStatsQueryOptions,
}
