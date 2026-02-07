import { queryOptions } from '@tanstack/react-query'
import {
  getSchoolProfile,
  updateSchoolLogo,
  updateSchoolProfile,
  updateSchoolSettings,
} from '@/school/functions/school-profile'
import { schoolMutationKeys } from './keys'

export const schoolProfileKeys = {
  all: ['school-profile'] as const,
  detail: () => [...schoolProfileKeys.all, 'detail'] as const,
}

export const schoolProfileOptions = {
  detail: () =>
    queryOptions({
      queryKey: schoolProfileKeys.detail(),
      queryFn: async () => {
        const res = await getSchoolProfile()
        if (!res.success)
          throw new Error(res.error)
        return res.data
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    }),
}

// School profile mutations
export const schoolProfileMutations = {
  update: {
    mutationKey: schoolMutationKeys.schoolProfile.update,
    mutationFn: (data: Parameters<typeof updateSchoolProfile>[0]['data']) => updateSchoolProfile({ data }),
  },
  updateSettings: {
    mutationKey: schoolMutationKeys.schoolProfile.updateSettings,
    mutationFn: (data: Parameters<typeof updateSchoolSettings>[0]['data']) => updateSchoolSettings({ data }),
  },
  updateLogo: {
    mutationKey: schoolMutationKeys.schoolProfile.updateLogo,
    mutationFn: (data: Parameters<typeof updateSchoolLogo>[0]['data']) => updateSchoolLogo({ data }),
  },
}
