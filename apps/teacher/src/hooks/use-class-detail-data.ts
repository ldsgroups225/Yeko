import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  classDetailsQueryOptions,
  classStatsQueryOptions,
  classStudentsQueryOptions,
} from '@/lib/queries/classes'
import { teacherClassesQueryOptions } from '@/lib/queries/dashboard'
import {
  unpublishedCountQueryOptions,
  unpublishedNoteQueryOptions,
} from '@/lib/queries/local-notes'

interface UseClassDetailDataParams {
  classId: string
  schoolId: string
  schoolYearId?: string
  teacherId?: string
  searchQuery: string
}

export function useClassDetailData({
  classId,
  schoolId,
  schoolYearId,
  teacherId,
  searchQuery,
}: UseClassDetailDataParams) {
  const { data: classData, isPending: classPending } = useQuery({
    ...classDetailsQueryOptions({
      classId,
      schoolYearId: schoolYearId ?? '',
    }),
    enabled: !!schoolYearId,
  })

  const { data: studentsData, isPending: studentsPending } = useQuery({
    ...classStudentsQueryOptions({
      classId,
      schoolYearId: schoolYearId ?? '',
      searchQuery: searchQuery || undefined,
    }),
    enabled: !!schoolYearId,
  })

  const { data: statsData, isPending: statsPending } = useQuery({
    ...classStatsQueryOptions({
      classId,
      schoolYearId: schoolYearId ?? '',
    }),
    enabled: !!schoolYearId,
  })

  const { data: teacherClassesData } = useQuery({
    ...teacherClassesQueryOptions({
      teacherId: teacherId ?? '',
      schoolId,
      schoolYearId: schoolYearId ?? '',
    }),
    enabled: !!teacherId && !!schoolYearId,
  })

  const { data: unpublishedNote, refetch: refetchUnpublished } = useQuery(
    unpublishedNoteQueryOptions({
      classId,
      schoolId,
      teacherId: teacherId ?? '',
    }),
  )

  const { data: unpublishedCount = 0 } = useQuery(
    unpublishedCountQueryOptions({
      classId,
      schoolId,
      teacherId: teacherId ?? '',
    }),
  )

  const classInfo = classData?.class
  const students = useMemo(() => studentsData?.students ?? [], [studentsData?.students])
  const teacherClassInfo = teacherClassesData?.classes.find(c => c.id === classId)
  const teacherSubjects = teacherClassInfo?.subjects ?? []
  const classStats = statsData?.stats || { average: null, count: students.length }

  return {
    classInfo,
    students,
    teacherSubjects,
    classStats,
    unpublishedNote,
    unpublishedCount,
    refetchUnpublished,
    isPending: classPending || studentsPending || statsPending,
  }
}
