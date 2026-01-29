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
  const { data: result, isLoading } = useQuery({
    queryKey: ['user-role'],
    queryFn: () => getCurrentUserRole(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const roleData = result?.success ? result.data : null

  return {
    role: roleData?.roleSlug as RoleSlug | undefined,
    roleName: roleData?.roleName,
    permissions: roleData?.permissions,
    isLoading,
  }
}
