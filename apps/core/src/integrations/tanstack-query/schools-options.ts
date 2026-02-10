import type { School } from '@repo/data-ops/drizzle/core-schema'
import type {
  BulkUpdateSchoolsInput,
  CreateSchoolInput,
  ImportSchoolsInput,
  SchoolIdInput,
  UpdateSchoolInput,
} from '@/schemas/school'
import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import {
  bulkCreateSchools,
  bulkUpdateSchools,
  createSchool,
  deleteSchool,
  getSchoolById,
  getSchools,
  updateSchool,
} from '@/core/functions/schools'

export const schoolsKeys = {
  all: ['schools'] as const,
  lists: () => [...schoolsKeys.all, 'list'] as const,
  list: (params: SchoolsQueryParams) => [...schoolsKeys.lists(), params] as const,
  details: () => [...schoolsKeys.all, 'detail'] as const,
  detail: (id: string) => [...schoolsKeys.details(), id] as const,
}

export const schoolsMutationKeys = {
  create: ['schools', 'create'] as const,
  update: ['schools', 'update'] as const,
  delete: ['schools', 'delete'] as const,
  bulkUpdate: ['schools', 'bulkUpdate'] as const,
  bulkCreate: ['schools', 'bulkCreate'] as const,
}

export interface SchoolsQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'inactive' | 'suspended'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function schoolsQueryOptions(params: SchoolsQueryParams) {
  return queryOptions<{
    data: School[]
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>({
    queryKey: schoolsKeys.list(params),
    queryFn: () => getSchools({ data: params }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

export function schoolQueryOptions(id: string) {
  return queryOptions<School | null>({
    queryKey: schoolsKeys.detail(id),
    queryFn: () => getSchoolById({ data: { id } }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!id,
  })
}

export const createSchoolMutationOptions = {
  mutationKey: schoolsMutationKeys.create,
  mutationFn: (data: CreateSchoolInput) => createSchool({ data }),
}

export const updateSchoolMutationOptions = {
  mutationKey: schoolsMutationKeys.update,
  mutationFn: (data: UpdateSchoolInput) => updateSchool({ data }),
}

export const deleteSchoolMutationOptions = {
  mutationKey: schoolsMutationKeys.delete,
  mutationFn: (data: SchoolIdInput) => deleteSchool({ data }),
}

export const bulkUpdateSchoolsMutationOptions = {
  mutationKey: schoolsMutationKeys.bulkUpdate,
  mutationFn: (data: BulkUpdateSchoolsInput) => bulkUpdateSchools({ data }),
}

export const bulkCreateSchoolsMutationOptions = {
  mutationKey: schoolsMutationKeys.bulkCreate,
  mutationFn: (data: ImportSchoolsInput) => bulkCreateSchools({ data }),
}

export const schoolQueries = {
  list: schoolsQueryOptions,
  byId: schoolQueryOptions,
  create: createSchoolMutationOptions,
  update: updateSchoolMutationOptions,
  delete: deleteSchoolMutationOptions,
  bulkUpdate: bulkUpdateSchoolsMutationOptions,
  bulkCreate: bulkCreateSchoolsMutationOptions,
}
