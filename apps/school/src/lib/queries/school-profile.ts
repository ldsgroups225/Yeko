import { queryOptions } from '@tanstack/react-query'
import { getSchoolProfile } from '@/school/functions/school-profile'

export const schoolProfileOptions = {
  detail: () =>
    queryOptions({
      queryKey: ['school-profile'],
      queryFn: async () => {
      const res = await getSchoolProfile()
      if (!res.success)
        throw new Error(res.error)
      return res.data
    },
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
}
