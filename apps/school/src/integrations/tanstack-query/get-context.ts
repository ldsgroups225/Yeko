import { QueryClient } from '@tanstack/react-query'

function isIgnorableQueryError(error: unknown) {
  if (error instanceof DOMException) {
    return error.name === 'AbortError'
      || error.message.toLowerCase().includes('aborted')
  }

  if (error instanceof TypeError) {
    const message = error.message.toLowerCase()
    return message.includes('networkerror')
      || message.includes('failed to fetch')
      || message.includes('fetch resource')
  }

  if (error instanceof Error) {
    return error.message.toLowerCase().includes('aborted')
  }

  return false
}

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (isIgnorableQueryError(error))
            return false

          return failureCount < 3
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  })
  return {
    queryClient,
  }
}
