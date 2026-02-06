import { checkStorageConfigured } from '@/core/functions/storage'

export const storageKeys = {
  all: ['storage'] as const,
  config: () => [...storageKeys.all, 'config'] as const,
}

export function storageConfigQueryOptions() {
  return {
    queryKey: storageKeys.config(),
    queryFn: async () => {
      const result = await checkStorageConfigured()
      return result.configured
    },
    staleTime: 1000 * 60 * 60, // 1 hour (config rarely changes)
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  }
}

export const storageQueries = {
  config: storageConfigQueryOptions,
}
