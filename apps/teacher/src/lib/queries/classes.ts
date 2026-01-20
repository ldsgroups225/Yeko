/**
 * Class Queries
 * TanStack Query options for class management
 */
import { queryOptions } from '@tanstack/react-query'

import { getClassDetails, getClassStats, getClassStudents, getTeacherClasses } from '@/teacher/functions/classes'

// Options for getting teacher's classes
export function teacherClassesQueryOptions(params: {
  teacherId: string
  schoolYearId: string
  schoolId?: string
}) {
  return queryOptions({
    queryKey: ['classes', 'teacher', params.teacherId, params.schoolYearId, params.schoolId],
    queryFn: () => getTeacherClasses({ data: params }),
    staleTime: 10 * 60 * 1000, // 10 minutes - classes don't change often
  })
}

// Options for getting class details
export function classDetailsQueryOptions(params: {
  classId: string
  schoolYearId: string
}) {
  return queryOptions({
    queryKey: ['classes', 'details', params.classId],
    queryFn: () => getClassDetails({ data: params }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Options for getting class students
export function classStudentsQueryOptions(params: {
  classId: string
  schoolYearId: string
  searchQuery?: string
}) {
  return queryOptions({
    queryKey: ['classes', 'students', params.classId, params.searchQuery],
    queryFn: () => getClassStudents({ data: params }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Options for getting class statistics
export function classStatsQueryOptions(params: {
  classId: string
  schoolYearId: string
}) {
  return queryOptions({
    queryKey: ['classes', 'stats', params.classId],
    queryFn: () => getClassStats({ data: params }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
