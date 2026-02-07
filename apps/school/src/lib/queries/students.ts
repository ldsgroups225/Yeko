import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import {
  createStudent,
  deleteStudent,
  exportStudents,
  generateMatricule,
  getStudentById,
  getStudents,
  getStudentStatistics,
  updateStudent,
  updateStudentStatus,
} from '@/school/functions/students'
import { schoolMutationKeys } from './keys'

export const studentsKeys = {
  all: ['students'] as const,
  lists: () => [...studentsKeys.all, 'list'] as const,
  list: (filters: StudentFilters) => [...studentsKeys.lists(), filters] as const,
  details: () => [...studentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentsKeys.details(), id] as const,
  statistics: () => [...studentsKeys.all, 'statistics'] as const,
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
      queryFn: async () => {
        const result = await getStudents({ data: filters })
        if (result.success === true) {
          return result.data
        }
        throw new Error('error' in result ? result.error : 'Failed to fetch students')
      },

      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      placeholderData: keepPreviousData,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: studentsKeys.detail(id),
      queryFn: async () => {
        const result = await getStudentById({ data: id })
        if (result.success === true) {
          return result.data
        }
        throw new Error('error' in result ? result.error : 'Failed to fetch student')
      },

      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),

  statistics: () =>
    queryOptions({
      queryKey: studentsKeys.statistics(),
      queryFn: async () => {
        const result = await getStudentStatistics()
        if (result && 'success' in result && result.success) {
          return result.data
        }
        throw new Error(result && 'error' in result ? result.error : 'Failed to fetch statistics')
      },
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  export: (filters: StudentFilters = {}) =>
    queryOptions({
      queryKey: studentsKeys.export(filters),
      queryFn: async () => {
        const result = await exportStudents({ data: filters })
        if (result && 'success' in result && result.success) {
          return result.data
        }
        throw new Error(result && 'error' in result ? result.error : 'Failed to export students')
      },
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
      enabled: false,
    }),

  generateMatricule: () =>
    queryOptions({
      queryKey: studentsKeys.matricule(),
      queryFn: async () => {
        const result = await generateMatricule()
        if (result && typeof result === 'object' && 'success' in result && result.success) {
          return result.data
        }
        throw new Error(result && typeof result === 'object' && 'error' in result ? result.error : 'Failed to generate matricule')
      },
      staleTime: 0,
      gcTime: 0,
    }),
}

// Student mutations
export const studentsMutations = {
  create: {
    mutationKey: schoolMutationKeys.students.create,
    mutationFn: (data: Parameters<typeof createStudent>[0]['data']) => createStudent({ data }),
  },
  update: {
    mutationKey: schoolMutationKeys.students.update,
    mutationFn: (data: Parameters<typeof updateStudent>[0]['data']) => updateStudent({ data }),
  },
  delete: {
    mutationKey: schoolMutationKeys.students.delete,
    mutationFn: (id: string) => deleteStudent({ data: id }),
  },
  updateStatus: {
    mutationKey: schoolMutationKeys.students.update, // Reusing student update key
    mutationFn: (data: Parameters<typeof updateStudentStatus>[0]['data']) => updateStudentStatus({ data }),
  },
  generateMatricule: {
    mutationKey: schoolMutationKeys.students.generateMatricule,
    mutationFn: () => generateMatricule(),
  },
}
