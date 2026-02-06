import type { Role } from '@repo/data-ops'
import { queryOptions } from '@tanstack/react-query'
import {
  createPlatformRole,
  deletePlatformRole,
  getPlatformRoles,
  updatePlatformRole,
} from '@/core/functions/roles'

export const platformRolesKeys = {
  all: ['platform-roles'] as const,
  scoped: (scope: 'system' | 'school') => [...platformRolesKeys.all, scope] as const,
}

export const platformRolesMutationKeys = {
  create: ['platform-roles', 'create'] as const,
  update: ['platform-roles', 'update'] as const,
  delete: ['platform-roles', 'delete'] as const,
}

export interface RoleFormData {
  name: string
  slug: string
  description?: string
  scope: 'system' | 'school'
  permissions: Record<string, string[]>
}

export function platformRolesQueryOptions(scope: 'system' | 'school' = 'system') {
  return queryOptions({
    queryKey: platformRolesKeys.scoped(scope),
    queryFn: () => getPlatformRoles({ data: { scope } }),
    staleTime: 5 * 60 * 1000,
  })
}

export const createPlatformRoleMutationOptions = {
  mutationKey: platformRolesMutationKeys.create,
  mutationFn: (data: RoleFormData) => createPlatformRole({ data }),
}

export const updatePlatformRoleMutationOptions = {
  mutationKey: platformRolesMutationKeys.update,
  mutationFn: ({ id, updates }: { id: string; updates: Partial<Role> }) =>
    updatePlatformRole({ data: { id, updates } }),
}

export const deletePlatformRoleMutationOptions = {
  mutationKey: platformRolesMutationKeys.delete,
  mutationFn: (id: string) => deletePlatformRole({ data: { id } }),
}

export const platformRolesQueries = {
  scoped: platformRolesQueryOptions,
  create: createPlatformRoleMutationOptions,
  update: updatePlatformRoleMutationOptions,
  delete: deletePlatformRoleMutationOptions,
}
