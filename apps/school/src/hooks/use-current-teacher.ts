import { useQuery } from '@tanstack/react-query'

import { authClient } from '@/lib/auth-client'
import { getCurrentTeacher } from '@/school/functions/teachers'

export const currentTeacherKeys = {
  all: ['currentTeacher'] as const,
  byUser: (userId: string) => [...currentTeacherKeys.all, userId] as const,
}

export function useCurrentTeacher() {
  const session = authClient.useSession()
  const userId = session.data?.user?.id

  return useQuery({
    queryKey: currentTeacherKeys.byUser(userId ?? ''),
    queryFn: () => getCurrentTeacher({ data: { userId: userId! } }),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes - teacher doesn't change often
    gcTime: 30 * 60 * 1000,
  })
}
