import { queryOptions } from '@tanstack/react-query'
import { getAvailableSchoolYearTemplates, getSchoolYears } from '@/school/functions/school-years'

export const schoolYearsKeys = {
  all: ['school-years'] as const,
  lists: () => [...schoolYearsKeys.all, 'list'] as const,
  templates: () => ['school-year-templates'] as const,
}

export function schoolYearsOptions() {
  return queryOptions({
    queryKey: schoolYearsKeys.lists(),
    queryFn: async () => {
      const result = await getSchoolYears()
      if (result.success)
        return result.data
      throw new Error(result.error)
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

export function schoolYearTemplatesOptions() {
  return queryOptions({
    queryKey: schoolYearsKeys.templates(),
    queryFn: async () => {
      const result = await getAvailableSchoolYearTemplates()
      if (result.success)
        return result.data
      throw new Error(result.error)
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}
