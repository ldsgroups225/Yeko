import type { TeacherItem } from './types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import {
  classSubjectsKeys,
  classSubjectsOptions,
} from '@/lib/queries/class-subjects'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { teacherOptions } from '@/lib/queries/teachers'
import {
  assignTeacherToClassSubject,
  removeClassSubject,
} from '@/school/functions/class-subjects'
import { ClassSubjectManagerContext } from './class-subject-manager-context'

interface ClassSubjectManagerProviderProps {
  children: React.ReactNode
  classId: string
  className: string
}

export function ClassSubjectManagerProvider({
  children,
  classId,
  className,
}: ClassSubjectManagerProviderProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false)
  const [subjectToDelete, setSubjectToDelete] = useState<{ id: string, name: string } | null>(null)
  const [pendingAssignment, setPendingAssignment] = useState<{
    subjectId: string
    subjectName: string
    teacherId: string
    teacherName: string
  } | null>(null)

  const { data: subjectsResult, isPending } = useQuery(
    classSubjectsOptions.list({ classId }),
  )

  const { data: teachersResult } = useQuery({
    ...teacherOptions.list({}, { page: 1, limit: 100 }),
  })

  const deleteMutation = useMutation({
    mutationKey: schoolMutationKeys.classSubjects.delete,
    mutationFn: (data: { classId: string, subjectId: string }) =>
      removeClassSubject({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: classSubjectsKeys.list({ classId }),
      })
      toast.success(t.academic.classes.removeSubjectSuccess())
      setSubjectToDelete(null)
    },
    onError: () => {
      toast.error(t.academic.classes.removeSubjectError())
    },
  })

  const assignMutation = useMutation({
    mutationKey: schoolMutationKeys.classSubjects.assignTeacher,
    mutationFn: (data: { subjectId: string, teacherId: string }) =>
      assignTeacherToClassSubject({
        data: { classId, subjectId: data.subjectId, teacherId: data.teacherId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: classSubjectsKeys.list({ classId }),
      })
      toast.success(t.academic.grades.assignment.success())
      setPendingAssignment(null)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t.common.error())
    },
  })

  const state = {
    classId,
    className,
    subjects: subjectsResult || [],
    teachers: (teachersResult?.teachers as TeacherItem[]) || [],
    isPending,
    isDialogOpen,
    isCopyDialogOpen,
    subjectToDelete,
    pendingAssignment,
    isAssigning: assignMutation.isPending,
  }

  const actions = {
    setIsDialogOpen,
    setIsCopyDialogOpen,
    setSubjectToDelete,
    setPendingAssignment,
    handleDelete: () => {
      if (subjectToDelete) {
        deleteMutation.mutate({ classId, subjectId: subjectToDelete.id })
      }
    },
    handleAssign: () => {
      if (pendingAssignment) {
        assignMutation.mutate({
          subjectId: pendingAssignment.subjectId,
          teacherId: pendingAssignment.teacherId,
        })
      }
    },
  }

  return (
    <ClassSubjectManagerContext value={{ state, actions }}>
      {children}
    </ClassSubjectManagerContext>
  )
}
