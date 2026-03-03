import { useMutationState } from '@tanstack/react-query'

/**
 * Returns true if any mutation with the given key is currently pending.
 * Use to prevent duplicate submits or show global loading indicators.
 *
 * @example
 * ```tsx
 * import { schoolMutationKeys } from '@/lib/queries/keys'
 *
 * const isDeleting = useIsMutationPending(schoolMutationKeys.students.delete)
 * <Button disabled={isDeleting}>Delete</Button>
 * ```
 */
export function useIsMutationPending(mutationKey: readonly unknown[]): boolean {
  const pending = useMutationState({
    filters: { mutationKey, status: 'pending' },
    select: () => true,
  })
  return pending.length > 0
}

/**
 * Returns the variables of all pending mutations matching the given key.
 * Useful for showing optimistic UI for pending items (simplified pattern).
 *
 * @example
 * ```tsx
 * const pendingPayments = usePendingVariables<PaymentFormData>(
 *   schoolMutationKeys.payments.create,
 * )
 * // Render pending payments with reduced opacity
 * ```
 */
export function usePendingVariables<TVars>(
  mutationKey: readonly unknown[],
): TVars[] {
  return useMutationState({
    filters: { mutationKey, status: 'pending' },
    select: mutation => mutation.state.variables as TVars,
  })
}
