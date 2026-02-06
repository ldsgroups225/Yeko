import { QueryClient } from '@tanstack/react-query'

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
      },
    },
  })
  return {
    queryClient,
  }
}
