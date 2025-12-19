import { queryOptions } from '@tanstack/react-query'
import { getSchoolProfile } from '@/school/functions/school-profile'

export const schoolProfileOptions = {
  detail: () =>
    queryOptions({
      queryKey: ['school-profile'],
      queryFn: () => getSchoolProfile(),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
}
