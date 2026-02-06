import type { RemoveUserInput, SuspendUserInput } from '@/schemas/user'
import { removeUser, suspendUser } from '@/core/functions/suspend-remove-user'

export const userActionsMutationKeys = {
  suspend: ['users', 'suspend'] as const,
  remove: ['users', 'remove'] as const,
}

export const suspendUserMutationOptions = {
  mutationKey: userActionsMutationKeys.suspend,
  mutationFn: (data: SuspendUserInput) => suspendUser({ data }),
}

export const removeUserMutationOptions = {
  mutationKey: userActionsMutationKeys.remove,
  mutationFn: (data: RemoveUserInput) => removeUser({ data }),
}

export const userMutations = {
  suspend: suspendUserMutationOptions,
  remove: removeUserMutationOptions,
}
