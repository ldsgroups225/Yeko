import { useQuery } from '@tanstack/react-query';

export type RoleSlug =
  | 'school_administrator'
  | 'academic_coordinator'
  | 'discipline_officer'
  | 'accountant'
  | 'cashier'
  | 'registrar';

// TODO: Replace with actual server function to get user role
async function getUserRole() {
  // Mock implementation - will be replaced with actual auth
  return {
    roleSlug: 'school_administrator' as RoleSlug,
    roleName: 'Administrateur Scolaire',
    permissions: {},
  };
}

export function useRole() {
  const { data: role, isLoading } = useQuery({
    queryKey: ['user-role'],
    queryFn: getUserRole,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    role: role?.roleSlug,
    roleName: role?.roleName,
    permissions: role?.permissions,
    isLoading,
  };
}
