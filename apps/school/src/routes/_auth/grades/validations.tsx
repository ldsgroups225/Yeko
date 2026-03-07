import type { PendingValidation } from '@repo/data-ops/index'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { GradeValidationDialog } from '@/components/grades/grade-validation-dialog'
import { useSchoolContext } from '@/hooks/use-school-context'
import { useTranslations } from '@/i18n'
import { authClient } from '@/lib/auth-client'
import { gradesKeys, gradesOptions } from '@/lib/queries/grades'
import { schoolMutationKeys } from '@/lib/queries/keys'
import {
  getSubmittedGradeIds,
  rejectGrades,
  validateGrades,
} from '@/school/functions/student-grades'
import { getUserIdFromAuthUserId } from '@/school/functions/users'
import { GradingDetailsSheet } from './grading-validations/-grading-details-sheet'
import { GradingFilters } from './grading-validations/-grading-filters'
import { GradingValidationsTable } from './grading-validations/-grading-validations-table'

export const Route = createFileRoute('/_auth/grades/validations')({
  component: GradeValidationsPage,
})

function getValidationRowId(validation: PendingValidation): string {
  return JSON.stringify([
    validation.classId,
    validation.subjectId,
    validation.termId,
    validation.gradeType,
    validation.gradeDate,
    validation.description ?? '__NULL_DESCRIPTION__',
    validation.teacherId ?? '__NULL_TEACHER__',
    validation.submittedAt ? new Date(validation.submittedAt).toISOString() : '',
  ])
}

function GradeValidationsPage() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { schoolId, isPending: contextPending } = useSchoolContext()
  const session = authClient.useSession()
  const userId = session.data?.user?.id
  const [selectedValidation, setSelectedValidation]
    = useState<PendingValidation | null>(null)
  const [dialogMode, setDialogMode] = useState<'validate' | 'reject'>(
    'validate',
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isConfirmingAction, setIsConfirmingAction] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [detailValidation, setDetailValidation] = useState<PendingValidation | null>(null)

  const { data: pendingValidationsResult, isPending } = useQuery(
    gradesOptions.pending(schoolId ?? ''),
  )

  const pendingValidations = pendingValidationsResult || []
  const filteredValidations = (
    (pendingValidations as PendingValidation[]) || []
  ).filter(
    v =>
      v.className.toLowerCase().includes(search.toLowerCase())
      || v.subjectName.toLowerCase().includes(search.toLowerCase())
      || v.teacherName.toLowerCase().includes(search.toLowerCase())
      || v.gradeName.toLowerCase().includes(search.toLowerCase()),
  )

  const validateMutation = useMutation({
    mutationKey: schoolMutationKeys.grades.validate,
    mutationFn: (params: {
      gradeIds: string[]
      userId: string
      comment?: string
    }) => validateGrades({ data: params }),
    onSuccess: () => {
      const pendingKey = schoolId ? gradesKeys.pending(schoolId) : gradesKeys.all
      queryClient.invalidateQueries({ queryKey: pendingKey })
      setDialogOpen(false)
      setSelectedValidation(null)
      setSelectedRows([])
      toast.success(t.academic.grades.validations.validateSuccess())
    },
    onError: () => {
      toast.error(t.academic.grades.errors.saveError())
    },
  })

  const rejectMutation = useMutation({
    mutationKey: schoolMutationKeys.grades.reject,
    mutationFn: (params: {
      gradeIds: string[]
      userId: string
      reason: string
    }) => rejectGrades({ data: params }),
    onSuccess: () => {
      const pendingKey = schoolId ? gradesKeys.pending(schoolId) : gradesKeys.all
      queryClient.invalidateQueries({ queryKey: pendingKey })
      setDialogOpen(false)
      setSelectedValidation(null)
      setSelectedRows([])
      toast.success(t.academic.grades.validations.rejectSuccess())
    },
    onError: () => {
      toast.error(t.academic.grades.errors.saveError())
    },
  })

  const handleValidate = (validation: PendingValidation) => {
    setSelectedValidation(validation)
    setDialogMode('validate')
    setDialogOpen(true)
  }

  const handleReject = (validation: PendingValidation) => {
    setSelectedValidation(validation)
    setDialogMode('reject')
    setDialogOpen(true)
  }

  const handleViewDetails = (validation: PendingValidation) => {
    setDetailValidation(validation)
    setIsSheetOpen(true)
  }

  const { data: studentGradesData, isPending: isLoadingGrades } = useQuery({
    ...gradesOptions.byClass({
      classId: detailValidation?.classId ?? '',
      subjectId: detailValidation?.subjectId ?? '',
      termId: detailValidation?.termId ?? '',
      teacherId: detailValidation?.teacherId ?? undefined,
      type: detailValidation?.gradeType ?? undefined,
      gradeDate: detailValidation?.gradeDate ?? undefined,
      description: detailValidation?.description ?? undefined,
      status: 'submitted',
      submittedAt: detailValidation?.submittedAt ? new Date(detailValidation.submittedAt).toISOString() : undefined,
    }),
    enabled: !!detailValidation && isSheetOpen,
  })

  const handleBulkValidate = async () => {
    if (selectedRows.length === 0 || !userId)
      return

    setDialogMode('validate')
    setDialogOpen(true)
    setSelectedValidation(null)
  }

  const handleBulkReject = async () => {
    if (selectedRows.length === 0 || !userId)
      return

    setDialogMode('reject')
    setDialogOpen(true)
    setSelectedValidation(null)
  }

  const handleConfirm = async (reason?: string) => {
    if (!userId)
      return

    setIsConfirmingAction(true)
    try {
      const userResult = await getUserIdFromAuthUserId({
        data: { authUserId: userId },
      })
      if (!userResult.success || !userResult.data) {
        toast.error(t.common.error())
        return
      }
      const internalUserId = userResult.data

      let gradeIds: string[] = []

      if (selectedValidation) {
        const result = await getSubmittedGradeIds({
          data: {
            classId: selectedValidation.classId,
            subjectId: selectedValidation.subjectId,
            termId: selectedValidation.termId,
            teacherId: selectedValidation.teacherId ?? undefined,
            gradeType: selectedValidation.gradeType,
            gradeDate: selectedValidation.gradeDate,
            description: selectedValidation.description ?? undefined,
            submittedAt: selectedValidation.submittedAt
              ? new Date(selectedValidation.submittedAt).toISOString()
              : undefined,
          },
        })

        if (result.success) {
          gradeIds = result.data
        }
        else {
          toast.error(typeof result.error === 'string' ? result.error : t.common.error())
          return
        }
      }
      else if (selectedRows.length > 0) {
        const selectedValidations = filteredValidations.filter(v =>
          selectedRows.includes(getValidationRowId(v)),
        )
        const promises = selectedValidations.map(validation =>
          getSubmittedGradeIds({
            data: {
              classId: validation.classId,
              subjectId: validation.subjectId,
              termId: validation.termId,
              teacherId: validation.teacherId ?? undefined,
              gradeType: validation.gradeType,
              gradeDate: validation.gradeDate,
              description: validation.description ?? undefined,
              submittedAt: validation.submittedAt
                ? new Date(validation.submittedAt).toISOString()
                : undefined,
            },
          }),
        )
        const results = await Promise.all(promises)

        gradeIds = results
          .filter(r => r.success)
          .flatMap(r => r.data)

        if (results.some(r => !r.success)) {
          toast.error(t.academic.grades.errors.loadError())
        }
      }

      if (gradeIds.length === 0) {
        toast.error(t.academic.grades.validations.noValidations())
        return
      }

      if (dialogMode === 'validate') {
        await validateMutation.mutateAsync({
          gradeIds,
          userId: internalUserId,
          comment: reason,
        })
      }
      else {
        if (!reason) {
          toast.error(t.academic.grades.validations.rejectReason())
          return
        }
        await rejectMutation.mutateAsync({
          gradeIds,
          userId: internalUserId,
          reason,
        })
      }
    }
    catch {
      toast.error(t.academic.grades.errors.loadError())
    }
    finally {
      setIsConfirmingAction(false)
    }
  }

  const isMutating = validateMutation.isPending || rejectMutation.isPending
  const isDialogActionPending = isConfirmingAction || isMutating

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(
        filteredValidations.map(v => getValidationRowId(v)),
      )
    }
    else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => (prev.includes(id) ? prev : [...prev, id]))
    }
    else {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id))
    }
  }

  const totalPendingSelected = selectedRows.reduce((sum, rowId) => {
    const val = filteredValidations.find(
      v => getValidationRowId(v) === rowId,
    )
    return sum + (val?.pendingCount || 0)
  }, 0)

  return (
    <div className="space-y-8">
      <GradingFilters
        search={search}
        setSearch={setSearch}
        onFilterClick={() => {}}
        selectedRows={selectedRows}
        totalPendingSelected={totalPendingSelected}
        onBulkReject={handleBulkReject}
        onBulkValidate={handleBulkValidate}
        t={t}
      />

      <GradingValidationsTable
        isPending={isPending || contextPending}
        filteredValidations={filteredValidations}
        selectedRows={selectedRows}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        onValidate={handleValidate}
        onReject={handleReject}
        onViewDetails={handleViewDetails}
        getRowId={getValidationRowId}
        t={t}
      />

      <GradeValidationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        gradeCount={
          selectedValidation
            ? selectedValidation.pendingCount
            : totalPendingSelected
        }
        onConfirm={handleConfirm}
        isPending={isDialogActionPending}
      />

      <GradingDetailsSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        detailValidation={detailValidation}
        studentGradesData={studentGradesData}
        isLoadingGrades={isLoadingGrades}
        onValidate={handleValidate}
        onReject={handleReject}
        t={t}
      />
    </div>
  )
}
