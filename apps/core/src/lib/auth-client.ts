import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient()

export const { useSession, signIn, signOut } = authClient

// Enhanced useSession with React Query caching
export function useCachedSession() {
  return useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const session = await authClient.getSession()
      return session
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  })
}

// Helper to invalidate auth cache
export function useInvalidateAuth() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: ['auth'] })
  }
}

// Enhanced sign out with cache invalidation
export async function signOutWithCache() {
  await signOut()
  // Cache will be invalidated automatically by refetchOnWindowFocus
}
