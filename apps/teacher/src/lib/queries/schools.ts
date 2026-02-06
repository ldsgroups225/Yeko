import { queryOptions } from '@tanstack/react-query'
import { getCurrentTermFn, getTeacherSchoolsQuery } from '@/teacher/functions/schools'

export const schoolsKeys = {
  all: ['teacher', 'schools'] as const,
  list: (userId: string) => [...schoolsKeys.all, userId] as const,
  terms: () => ['schools', 'current-term'] as const,
  currentTerm: (schoolYearId: string) => [...schoolsKeys.terms(), schoolYearId] as const,
}

export function teacherSchoolsQueryOptions(userId: string) {
  return queryOptions({
    queryKey: schoolsKeys.list(userId),
    queryFn: () => getTeacherSchoolsQuery({ data: { userId } }),
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: !!userId,
  })
}

export function currentTermQueryOptions(schoolYearId: string) {
  return queryOptions({
    queryKey: schoolsKeys.currentTerm(schoolYearId),
    queryFn: () => getCurrentTermFn({ data: { schoolYearId } }),
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: !!schoolYearId,
  })
}
