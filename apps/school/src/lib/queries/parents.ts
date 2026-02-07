import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import {
  autoMatchParents,
  createParent,
  deleteParent,
  getParentById,
  getParents,
  linkParentToStudent,
  sendParentInvitation,
  unlinkParentFromStudent,
  updateParent,
} from '@/school/functions/parents'
import { schoolMutationKeys } from './keys'

export const parentsKeys = {
  all: ['parents'] as const,
  lists: () => [...parentsKeys.all, 'list'] as const,
  list: (filters: ParentFilters) => [...parentsKeys.lists(), filters] as const,
  details: () => [...parentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...parentsKeys.details(), id] as const,
  autoMatch: () => [...parentsKeys.all, 'auto-match'] as const,
}

export interface ParentFilters {
  search?: string
  invitationStatus?: 'pending' | 'sent' | 'accepted' | 'expired'
  page?: number
  limit?: number
}

export const parentsOptions = {
  list: (filters: ParentFilters = {}) =>
    queryOptions({
      queryKey: parentsKeys.list(filters),
      queryFn: async () => {
        const res = await getParents({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      placeholderData: keepPreviousData,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: parentsKeys.detail(id),
      queryFn: async () => {
        const res = await getParentById({ data: id })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),

  autoMatch: () =>
    queryOptions({
      queryKey: parentsKeys.autoMatch(),
      queryFn: async () => {
        const res = await autoMatchParents()
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 0, // Always fresh
      gcTime: 5 * 60 * 1000,
      enabled: false, // Manual trigger only
    }),
}

// Parent mutations
export const parentsMutations = {
  create: {
    mutationKey: schoolMutationKeys.parents.create,
    mutationFn: (data: Parameters<typeof createParent>[0]['data']) => createParent({ data }),
  },
  update: {
    mutationKey: schoolMutationKeys.parents.update,
    mutationFn: (data: Parameters<typeof updateParent>[0]['data']) => updateParent({ data }),
  },
  delete: {
    mutationKey: schoolMutationKeys.parents.delete,
    mutationFn: (id: string) => deleteParent({ data: id }),
  },
  linkToStudent: {
    mutationKey: schoolMutationKeys.parents.link,
    mutationFn: (data: Parameters<typeof linkParentToStudent>[0]['data']) => linkParentToStudent({ data }),
  },
  unlinkFromStudent: {
    mutationKey: schoolMutationKeys.parents.unlink,
    mutationFn: (data: Parameters<typeof unlinkParentFromStudent>[0]['data']) => unlinkParentFromStudent({ data }),
  },
  sendInvitation: {
    mutationKey: schoolMutationKeys.parents.invite,
    mutationFn: (parentId: string) => sendParentInvitation({ data: parentId }),
  },
  autoMatch: {
    mutationKey: schoolMutationKeys.parents.autoMatch,
    mutationFn: () => autoMatchParents(),
  },
}
