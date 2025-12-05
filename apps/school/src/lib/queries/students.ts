import { queryOptions } from '@tanstack/react-query'
import {
  exportStudents,
  generateMatricule,
  getStudentById,
  getStudents,
  getStudentStatistics,
} from '@/school/functions/students'

export const studentsKeys = {
  all: ['students'] as const,
  lists: () => [...studentsKeys.all, 'list'] as const,
  list: (filters: StudentFilters) => [...studentsKeys.lists(), filters] as const,
  details: () => [...studentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentsKeys.details(), id] as const,
  statistics: (schoolYearId?: string) => [...studentsKeys.all, 'statistics', schoolYearId] as const,
  export: (filters: StudentFilters) => [...studentsKeys.all, 'export', filters] as const,
  matricule: () => [...studentsKeys.all, 'matricule'] as const,
}

export interface StudentFilters {
  classId?: string
  gradeId?: string
  schoolYearId?: string
  status?: 'active' | 'graduated' | 'transferred' | 'withdrawn'
  gender?: 'M' | 'F' | 'other'
  search?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'matricule' | 'dob' | 'enrollmentDate' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export const studentsOptions = {
  list: (filters: StudentFilters = {}) =>
    queryOptions({
      queryKey: studentsKeys.list(filters),
      queryFn: () => getStudents({ data: filters }),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: studentsKeys.detail(id),
      queryFn: () => getStudentById({ data: id }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),

  statistics: (schoolYearId?: string) =>
    queryOptions({
      queryKey: studentsKeys.statistics(schoolYearId),
      queryFn: () => getStudentStatistics({ data: schoolYearId }),
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000,
    }),

  export: (filters: StudentFilters = {}) =>
    queryOptions({
      queryKey: studentsKeys.export(filters),
      queryFn: () => exportStudents({ data: filters }),
      staleTime: 0, // Always fresh for exports
      gcTime: 5 * 60 * 1000,
      enabled: false, // Manual trigger only
    }),

  generateMatricule: () =>
    queryOptions({
      queryKey: studentsKeys.matricule(),
      queryFn: () => generateMatricule(),
      staleTime: 0, // Always generate fresh
      gcTime: 0,
    }),
}
