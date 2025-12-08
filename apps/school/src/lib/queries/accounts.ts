import { queryOptions } from '@tanstack/react-query'
import {
  getAccount,
  getAccountsList,
  getAccountsTreeData,
} from '@/school/functions/accounts'

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
      queryFn: () => getAccountsList({ data: filters }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  tree: (includeInactive = false) =>
    queryOptions({
      queryKey: accountsKeys.tree(),
      queryFn: () => getAccountsTreeData({ data: { includeInactive } }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: accountsKeys.detail(id),
      queryFn: () => getAccount({ data: id }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    }),
}
