import type { GradeType } from '@/schemas/grade'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { classSubjectsKeys } from '@/lib/queries/class-subjects'
import { gradesKeys } from '@/lib/queries/grades'
import { schoolMutationKeys } from '@/lib/queries/keys'
import {
  assignTeacherToClassSubject,
} from '@/school/functions/class-subjects'
import {
  createBulkGrades,
  deleteDraftGrades,
  submitGradesForValidation,
  updateGrade,
} from '@/school/functions/student-grades'

interface MutationParams {
  classId: string
  subjectId: string
  termId: string
  gradeType: GradeType
  gradeDate?: string
  description?: string
  onSaveSuccess: () => void
  onSubmissionSuccess: () => void
  onResetSuccess: () => void
}

export function useGradeEntryMutations({
  classId,
  subjectId,
  termId,
  gradeType,
  gradeDate,
  description,
  onSaveSuccess,
  onSubmissionSuccess,
  onResetSuccess,
}: MutationParams) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationKey: schoolMutationKeys.grades.save,
    mutationFn: (params: { id: string, value: number }) =>
      updateGrade({ data: { id: params.id, value: params.value } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradesKeys.byClass(classId, subjectId, termId),
      })
    },
  })

  const createBulkMutation = useMutation({
    mutationKey: schoolMutationKeys.grades.bulkSave,
    mutationFn: (params: Parameters<typeof createBulkGrades>[0]['data']) =>
      createBulkGrades({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradesKeys.byClass(classId, subjectId, termId),
      })
      onSaveSuccess()
    },
  })

  const submitMutation = useMutation({
    mutationKey: schoolMutationKeys.grades.publish,
    mutationFn: (params: { gradeIds: string[] }) =>
      submitGradesForValidation({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradesKeys.byClass(classId, subjectId, termId),
      })
      toast.success(t.academic.grades.actions.submitSuccess())
      onSubmissionSuccess()
    },
  })

  const effectiveGradeDate = gradeDate ?? new Date().toISOString().slice(0, 10)

  const deleteDraftMutation = useMutation({
    mutationKey: schoolMutationKeys.grades.delete,
    mutationFn: () =>
      deleteDraftGrades({
        data: {
          classId,
          subjectId,
          termId,
          type: gradeType,
          gradeDate: effectiveGradeDate,
          description: description || undefined,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gradesKeys.byClass(classId, subjectId, termId),
      })
      onResetSuccess()
    },
  })

  const assignMutation = useMutation({
    mutationKey: schoolMutationKeys.classSubjects.assignTeacher,
    mutationFn: (newTeacherId: string) =>
      assignTeacherToClassSubject({
        data: {
          classId,
          subjectId,
          teacherId: newTeacherId,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: classSubjectsKeys.list({ classId }),
      })
      toast.success(t.common.success())
    },
    onError: () => {
      toast.error(t.common.error())
    },
  })

  return {
    updateMutation,
    createBulkMutation,
    submitMutation,
    deleteDraftMutation,
    assignMutation,
  }
}
