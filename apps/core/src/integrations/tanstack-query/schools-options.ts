import {
  bulkUpdateSchools,
  createSchool,
  deleteSchool,
  getSchoolById,
  getSchools,
  updateSchool,
} from '@/core/functions/schools'

export function schoolsQueryOptions(params: {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'inactive' | 'suspended'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  return {
    queryKey: ['schools', params],
    queryFn: () => getSchools({ data: params }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  }
}

export function schoolQueryOptions(id: string) {
  return {
    queryKey: ['school', id],
    queryFn: () => getSchoolById({ data: { id } }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!id,
  }
}

export const createSchoolMutationOptions = {
  mutationFn: (data: any) => createSchool({ data }),
  onSuccess: (data: any) => {
    console.warn('School created successfully:', data)
    // Invalidate schools list cache
    // This will be handled in the component with queryClient
  },
  onError: (error: any) => {
    console.error('Failed to create school:', error)
  },
  onSettled: () => {
    // This will be handled in the component
  },
}

export const updateSchoolMutationOptions = {
  mutationFn: (data: any) => updateSchool({ data }),
  onSuccess: (data: any) => {
    console.warn('School updated successfully:', data)
  },
  onError: (error: any) => {
    console.error('Failed to update school:', error)
  },
}

export const deleteSchoolMutationOptions = {
  mutationFn: (data: any) => deleteSchool({ data }),
  onSuccess: (data: any) => {
    console.warn('School deleted successfully:', data)
  },
  onError: (error: any) => {
    console.error('Failed to delete school:', error)
  },
}

export const bulkUpdateSchoolsMutationOptions = {
  mutationFn: (data: any) => bulkUpdateSchools({ data }),
  onSuccess: (data: any) => {
    console.warn('Schools bulk updated successfully:', data)
  },
  onError: (error: any) => {
    console.error('Failed to bulk update schools:', error)
  },
}

export const schoolQueries = {
  list: schoolsQueryOptions,
  byId: schoolQueryOptions,
  create: createSchoolMutationOptions,
  update: updateSchoolMutationOptions,
  delete: deleteSchoolMutationOptions,
  bulkUpdate: bulkUpdateSchoolsMutationOptions,
}
