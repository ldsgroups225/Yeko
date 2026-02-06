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
import { keepPreviousData } from '@tanstack/react-query'
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

// ===== EDUCATION LEVELS =====

export function educationLevelsQueryOptions() {
  return {
    queryKey: ['education-levels'],
    queryFn: () => educationLevelsQuery(),
    staleTime: 1000 * 60 * 60, // 1 hour (rarely changes)
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  }
}

// ===== TRACKS =====

export function tracksQueryOptions() {
  return {
    queryKey: ['tracks'],
    queryFn: () => tracksQuery(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  }
}

export function trackByIdQueryOptions(id: string) {
  return {
    queryKey: ['track', id],
    queryFn: () => trackByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  }
}

export const createTrackMutationOptions = {
  mutationFn: (data: CreateTrackInput) => createTrackMutation({ data }),
}

export const updateTrackMutationOptions = {
  mutationFn: (data: UpdateTrackInput) => updateTrackMutation({ data }),
}

export const deleteTrackMutationOptions = {
  mutationFn: (data: TrackIdInput) => deleteTrackMutation({ data }),
}

// ===== GRADES =====

export function gradesQueryOptions(trackId?: string) {
  return {
    queryKey: ['grades', { trackId }],
    queryFn: () => gradesQuery({ data: { trackId } }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  }
}

export function gradeByIdQueryOptions(id: string) {
  return {
    queryKey: ['grade', id],
    queryFn: () => gradeByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  }
}

export const createGradeMutationOptions = {
  mutationFn: (data: CreateGradeInput) => createGradeMutation({ data }),
}

export const updateGradeMutationOptions = {
  mutationFn: (data: UpdateGradeInput) => updateGradeMutation({ data }),
}

export const deleteGradeMutationOptions = {
  mutationFn: (data: GradeIdInput) => deleteGradeMutation({ data }),
}

export const bulkUpdateGradesOrderMutationOptions = {
  mutationFn: (data: Array<{ id: string, order: number }>) => bulkUpdateGradesOrderMutation({ data }),
}

// ===== SERIES =====

export function seriesQueryOptions(trackId?: string) {
  return {
    queryKey: ['series', { trackId }],
    queryFn: () => seriesQuery({ data: { trackId } }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  }
}

export function serieByIdQueryOptions(id: string) {
  return {
    queryKey: ['serie', id],
    queryFn: () => serieByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  }
}

export const createSerieMutationOptions = {
  mutationFn: (data: CreateSerieInput) => createSerieMutation({ data }),
}

export const updateSerieMutationOptions = {
  mutationFn: (data: UpdateSerieInput) => updateSerieMutation({ data }),
}

export const deleteSerieMutationOptions = {
  mutationFn: (data: SerieIdInput) => deleteSerieMutation({ data }),
}

export const bulkCreateSeriesMutationOptions = {
  mutationFn: (data: { series: CreateSerieInput[] }) => bulkCreateSeriesMutation({ data }),
}

// ===== SUBJECTS =====

export function subjectsQueryOptions(params: {
  category?: string
  search?: string
  page?: number
  limit?: number
}) {
  return {
    queryKey: ['subjects', params],
    queryFn: () => subjectsQuery({ data: params }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    placeholderData: keepPreviousData,
  }
}

export function subjectByIdQueryOptions(id: string) {
  return {
    queryKey: ['subject', id],
    queryFn: () => subjectByIdQuery({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!id,
  }
}

export const createSubjectMutationOptions = {
  mutationFn: (data: CreateSubjectInput) => createSubjectMutation({ data }),
}

export const updateSubjectMutationOptions = {
  mutationFn: (data: UpdateSubjectInput) => updateSubjectMutation({ data }),
}

export const deleteSubjectMutationOptions = {
  mutationFn: (data: SubjectIdInput) => deleteSubjectMutation({ data }),
}

export const bulkCreateSubjectsMutationOptions = {
  mutationFn: (data: { subjects: CreateSubjectInput[] }) => bulkCreateSubjectsMutation({ data }),
}

// ===== CATALOG STATS =====

export function catalogStatsQueryOptions() {
  return {
    queryKey: ['catalog-stats'],
    queryFn: () => catalogStatsQuery(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  }
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
