import { queryOptions } from '@tanstack/react-query'
import {
  createNewAccount,
  deleteExistingAccount,
  getAccount,
  getAccountsList,
  getAccountsTreeData,
  updateExistingAccount,
} from '@/school/functions/accounts'
import { schoolMutationKeys } from './keys'

export const accountsKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountsKeys.all, 'list'] as const,
  list: (filters: AccountFilters) => [...accountsKeys.lists(), filters] as const,
  tree: () => [...accountsKeys.all, 'tree'] as const,
  details: () => [...accountsKeys.all, 'detail'] as const,
  detail: (id: string) => [...accountsKeys.details(), id] as const,
}

export interface AccountFilters {
  type?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  status?: 'active' | 'inactive'
  isHeader?: boolean
}

export const accountsOptions = {
  list: (filters: AccountFilters = {}) =>
    queryOptions({
      queryKey: accountsKeys.list(filters),
      queryFn: async () => {
        const res = await getAccountsList({ data: filters })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  tree: (includeInactive = false) =>
    queryOptions({
      queryKey: accountsKeys.tree(),
      queryFn: async () => {
        const res = await getAccountsTreeData({ data: { includeInactive } })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: accountsKeys.detail(id),
      queryFn: async () => {
        const res = await getAccount({ data: id })
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),
}

// Accounts mutations
export const accountsMutations = {
  create: {
    mutationKey: schoolMutationKeys.accounts.create,
    mutationFn: (data: Parameters<typeof createNewAccount>[0]['data']) => createNewAccount({ data }),
  },
  update: {
    mutationKey: schoolMutationKeys.accounts.update,
    mutationFn: (data: Parameters<typeof updateExistingAccount>[0]['data']) => updateExistingAccount({ data }),
  },
  delete: {
    mutationKey: schoolMutationKeys.accounts.delete,
    mutationFn: (id: string) => deleteExistingAccount({ data: id }),
  },
}
