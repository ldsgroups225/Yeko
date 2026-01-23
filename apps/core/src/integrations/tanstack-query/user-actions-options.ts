import type { RemoveUserInput, SuspendUserInput } from "@/schemas/user";
import { removeUser, suspendUser } from "@/core/functions/suspend-remove-user";

export const suspendUserMutationOptions = {
  mutationFn: (data: SuspendUserInput) => suspendUser({ data }),
  onSuccess: () => {
    console.warn("User suspended successfully");
  },
  onError: (error: Error) => {
    console.error("Failed to suspend user:", error);
  },
};

export const removeUserMutationOptions = {
  mutationFn: (data: RemoveUserInput) => removeUser({ data }),
  onSuccess: () => {
    console.warn("User removed successfully");
  },
  onError: (error: Error) => {
    console.error("Failed to remove user:", error);
  },
};

export const userMutations = {
  suspend: suspendUserMutationOptions,
  remove: removeUserMutationOptions,
};
