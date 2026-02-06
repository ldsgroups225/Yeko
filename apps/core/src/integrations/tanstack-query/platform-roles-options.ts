import { queryOptions } from '@tanstack/react-query'
import { getPlatformRoles } from '@/core/functions/roles'

export const platformRolesKeys = {
  all: ['platform-roles'] as const,
}

export function platformRolesQueryOptions(scope: 'system' | 'school' = 'system') {
  return queryOptions({
    queryKey: [...platformRolesKeys.all, scope],
    queryFn: () => getPlatformRoles({ data: { scope } }),
  })
}
