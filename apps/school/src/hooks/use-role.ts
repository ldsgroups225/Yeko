import { useQuery } from '@tanstack/react-query'
import { getCurrentUserRole } from '@/school/functions/users'

export type RoleSlug
  = | 'school_administrator'
    | 'academic_coordinator'
    | 'discipline_officer'
    | 'accountant'
    | 'cashier'
    | 'registrar'

export function useRole() {
  const { data: role, isLoading } = useQuery({
    queryKey: ['user-role'],
    queryFn: () => getCurrentUserRole(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    role: role?.roleSlug as RoleSlug | undefined,
    roleName: role?.roleName,
    permissions: role?.permissions,
    isLoading,
  }
}
