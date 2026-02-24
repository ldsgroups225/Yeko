import type { AssignmentItem, SubjectItem, TeacherItem } from './types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import {
  assignTeacherToClassSubject,
  getAssignmentMatrix,
  removeTeacherFromClassSubject,
} from '@/school/functions/class-subjects'
import { getAllSubjects } from '@/school/functions/subjects'
import { getTeachers } from '@/school/functions/teachers'
import { AssignmentMatrixContext } from './assignment-matrix-context'

export function AssignmentMatrixProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations()
  const { schoolYearId } = useSchoolYearContext()
  const queryClient = useQueryClient()
  const [editingCell, setEditingCell] = useState<{
    classId: string
    subjectId: string
  } | null>(null)

  const { data: matrixResult, isPending: isPendingMatrix } = useQuery({
    queryKey: ['assignmentMatrix', schoolYearId],
    queryFn: () => getAssignmentMatrix({ data: schoolYearId! }),
    enabled: !!schoolYearId,
  })

  const { data: teachersResult } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => getTeachers({ data: {} }),
  })

  const { data: subjectsResult } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => getAllSubjects({ data: {} }),
  })

  const matrixData = useMemo(() =>
    matrixResult?.success ? (matrixResult.data as AssignmentItem[]) : [], [matrixResult])

  const teachers = useMemo(() =>
    teachersResult?.success ? (teachersResult.data.teachers as TeacherItem[]) : [], [teachersResult])

  const subjects = useMemo(() =>
    subjectsResult?.success ? (subjectsResult.data.subjects as SubjectItem[]) : [], [subjectsResult])

  const classes = useMemo(() => [
    ...new Map(
      matrixData.map(item => [
        item.classId,
        { id: item.classId, name: item.className },
      ]),
    ).values(),
  ], [matrixData])

  const assignmentMap = useMemo(() => {
    const map = new Map<string, { teacherId: string | null, teacherName: string | null }>()
    matrixData.forEach((item) => {
      if (item.subjectId) {
        map.set(`${item.classId}-${item.subjectId}`, {
          teacherId: item.teacherId,
          teacherName: item.teacherName,
        })
      }
    })
    return map
  }, [matrixData])

  const assignMutation = useMutation({
    mutationKey: schoolMutationKeys.classSubjects.assignTeacher,
    mutationFn: (data: {
      classId: string
      subjectId: string
      teacherId: string
    }) => assignTeacherToClassSubject({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignmentMatrix'] })
      toast.success(t.assignmentMatrix.assignedSuccess())
      setEditingCell(null)
    },
    onError: (error: Error) => {
      if (error.message.includes('not qualified')) {
        toast.error(t.assignmentMatrix.errorNotQualified())
      }
      else if (error.message.includes('permission')) {
        toast.error(t.common.errorPermission())
      }
      else {
        toast.error(error.message || t.common.error())
      }
    },
  })

  const removeMutation = useMutation({
    mutationKey: schoolMutationKeys.teachers.unassign,
    mutationFn: (data: { classId: string, subjectId: string }) =>
      removeTeacherFromClassSubject({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignmentMatrix'] })
      toast.success(t.assignmentMatrix.removedSuccess())
    },
    onError: (error: Error) => {
      if (error.message.includes('permission')) {
        toast.error(t.common.errorPermission())
      }
      else {
        toast.error(error.message || t.common.error())
      }
    },
  })

  const teacherWorkload = useMemo(() => {
    const map = new Map<string, number>()
    matrixData.forEach((item) => {
      if (item.teacherId && item.hoursPerWeek) {
        const current = map.get(item.teacherId) || 0
        map.set(item.teacherId, current + item.hoursPerWeek)
      }
    })
    return map
  }, [matrixData])

  const isTeacherOverloaded = (teacherId: string) => {
    return (teacherWorkload.get(teacherId) || 0) > 30
  }

  const contextValue = {
    state: {
      matrixData,
      teachers,
      subjects,
      classes,
      editingCell,
      isPending: isPendingMatrix,
      assignmentMap,
    },
    actions: {
      setEditingCell,
      assignTeacher: (data: any) => assignMutation.mutate(data),
      removeTeacher: (data: any) => removeMutation.mutate(data),
      isTeacherOverloaded,
    },
  }

  return (
    <AssignmentMatrixContext value={contextValue}>
      {children}
    </AssignmentMatrixContext>
  )
}
