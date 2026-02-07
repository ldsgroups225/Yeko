import type { SchoolSubjectsFilters } from '@/schemas/school-subject'
import { queryOptions } from '@tanstack/react-query'
import {
  addSubjectsToSchool,
  checkSubjectInUseForUI,
  deleteSchoolSubject,
  getAvailableCoreSubjects,
  getSchoolSubjectById,
  getSchoolSubjects,
  getSubjectUsageStats,
  toggleSchoolSubjectStatus,
} from '@/school/functions/school-subjects'
import { schoolMutationKeys } from './keys'

// ===== SCHOOL SUBJECTS QUERY OPTIONS =====

export const schoolSubjectsKeys = {
  all: ['school-subjects'] as const,
  lists: () => [...schoolSubjectsKeys.all, 'list'] as const,
  list: (filters: SchoolSubjectsFilters) => [...schoolSubjectsKeys.lists(), filters] as const,
  details: () => [...schoolSubjectsKeys.all, 'detail'] as const,
  detail: (id: string) => [...schoolSubjectsKeys.details(), id] as const,
  available: () => [...schoolSubjectsKeys.all, 'available'] as const,
  availableFiltered: (filters: { category?: string, search?: string }) =>
    [...schoolSubjectsKeys.available(), filters] as const,
  usage: () => [...schoolSubjectsKeys.all, 'usage'] as const,
  usageStats: (subjectId?: string) => [...schoolSubjectsKeys.usage(), subjectId] as const,
  inUse: () => [...schoolSubjectsKeys.all, 'in-use'] as const,
  inUseCheck: (subjectId: string) => [...schoolSubjectsKeys.inUse(), subjectId] as const,
}

export const schoolSubjectsOptions = {
  /**
   * List school subjects with pagination and filters
   */
  list: (filters: SchoolSubjectsFilters = {}) =>
    queryOptions({
      queryKey: schoolSubjectsKeys.list(filters),
      queryFn: async () => {
        const res = await getSchoolSubjects({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    }),

  /**
   * Get a single school subject by ID
   */
  detail: (id: string) =>
    queryOptions({
      queryKey: schoolSubjectsKeys.detail(id),
      queryFn: async () => {
        const res = await getSchoolSubjectById({ data: id })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),

  /**
   * Get Core subjects available to add
   */
  available: (filters: { category?: string, search?: string, schoolYearId?: string } = {}) =>
    queryOptions({
      queryKey: schoolSubjectsKeys.availableFiltered(filters),
      queryFn: async () => {
        const res = await getAvailableCoreSubjects({
          data: {
            ...filters,
            category: filters.category as 'Scientifique' | 'Littéraire' | 'Sportif' | 'Autre' | undefined,
          },
        })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  /**
   * Get subject usage statistics
   */
  usageStats: (subjectId?: string) =>
    queryOptions({
      queryKey: schoolSubjectsKeys.usageStats(subjectId),
      queryFn: async () => {
        const res = await getSubjectUsageStats({ data: { subjectId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  /**
   * IconCheck if a subject is in use
   */
  inUse: (subjectId: string, schoolYearId?: string) =>
    queryOptions({
      queryKey: schoolSubjectsKeys.inUseCheck(subjectId),
      queryFn: async () => {
        const res = await checkSubjectInUseForUI({ data: { subjectId, schoolYearId } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 1 * 60 * 1000, // 1 minute - shorter since this is used for validation
      gcTime: 5 * 60 * 1000,
      enabled: !!subjectId,
    }),
}

// School subjects mutations
export const schoolSubjectsMutations = {
  import: {
    mutationKey: schoolMutationKeys.schoolSubjects.import,
    mutationFn: (data: Parameters<typeof addSubjectsToSchool>[0]['data']) => addSubjectsToSchool({ data }),
  },
  toggleStatus: {
    mutationKey: schoolMutationKeys.schoolSubjects.toggleStatus,
    mutationFn: (data: Parameters<typeof toggleSchoolSubjectStatus>[0]['data']) => toggleSchoolSubjectStatus({ data }),
  },
  delete: {
    mutationKey: schoolMutationKeys.schoolSubjects.delete,
    mutationFn: (id: string) => deleteSchoolSubject({ data: id }),
  },
}
