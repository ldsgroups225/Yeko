import type { QueryClient, QueryKey } from '@tanstack/react-query'

/**
 * Snapshot of cached query data for rollback on mutation error.
 * Stores entries from all queries matching a partial key.
 */
export interface OptimisticSnapshot {
  entries: Array<[QueryKey, unknown]>
}

/**
 * Snapshots all queries matching `key`, then applies `updater` to each.
 * Returns a snapshot for rollback via `rollback()` in `onError`.
 *
 * @example
 * ```ts
 * onMutate: async (id) => {
 *   await queryClient.cancelQueries({ queryKey: studentsKeys.lists() })
 *   return snapshotAndUpdate(queryClient, studentsKeys.lists(), (old) => ({
 *     ...old,
 *     data: old.data.filter(s => s.student.id !== id),
 *     total: old.total - 1,
 *   }))
 * }
 * ```
 */
export function snapshotAndUpdate<T>(
  queryClient: QueryClient,
  key: QueryKey,
  updater: (old: T) => T,
): OptimisticSnapshot {
  const entries: Array<[QueryKey, unknown]> = queryClient
    .getQueriesData<T>({ queryKey: key })
    .map(([k, d]) => [k, d])

  queryClient.setQueriesData<T>(
    { queryKey: key },
    old => (old ? updater(old) : old),
  )

  return { entries }
}

/**
 * Restores all queries from a snapshot. Use in `onError` for rollback.
 *
 * @example
 * ```ts
 * onError: (err, _vars, context) => {
 *   rollback(queryClient, context)
 *   toast.error(err.message)
 * }
 * ```
 */
export function rollback(
  queryClient: QueryClient,
  snapshot: OptimisticSnapshot | undefined,
): void {
  if (!snapshot?.entries)
    return
  for (const [key, data] of snapshot.entries) {
    queryClient.setQueryData(key, data)
  }
}

/**
 * Invalidates multiple query keys. Use in `onSettled` to reconcile with server.
 *
 * @example
 * ```ts
 * onSettled: () => invalidateAll(queryClient, [studentsKeys.all])
 * ```
 */
export function invalidateAll(
  queryClient: QueryClient,
  keys: QueryKey[],
): void {
  for (const key of keys) {
    queryClient.invalidateQueries({ queryKey: key })
  }
}
