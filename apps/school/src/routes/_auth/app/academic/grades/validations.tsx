import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Filter } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { GradeValidationCard, GradeValidationDialog } from '@/components/grades'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSchoolContext } from '@/hooks/use-school-context'
import { authClient } from '@/lib/auth-client'
import { gradesKeys, gradesOptions } from '@/lib/queries/grades'
import {
  getSubmittedGradeIds,
  rejectGrades,
  validateGrades,
} from '@/school/functions/student-grades'
import { generateUUID } from '@/utils/generateUUID'

interface PendingValidation {
  classId: string
  className: string
  gradeName: string
  subjectId: string
  subjectName: string
  termId: string
  teacherId: string
  teacherName: string
  pendingCount: number
  submittedAt: Date
}

export const Route = createFileRoute('/_auth/app/academic/grades/validations')({
  component: GradeValidationsPage,
})

function GradeValidationsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { schoolId } = useSchoolContext()
  const session = authClient.useSession()
  const userId = session.data?.user?.id
  const [selectedValidation, setSelectedValidation] = useState<PendingValidation | null>(null)
  const [dialogMode, setDialogMode] = useState<'validate' | 'reject'>('validate')
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: pendingValidations, isLoading } = useQuery(
    gradesOptions.pending(schoolId ?? ''),
  )

  const validateMutation = useMutation({
    mutationFn: (params: { gradeIds: string[], userId: string, comment?: string }) =>
      validateGrades({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradesKeys.all })
      setDialogOpen(false)
      setSelectedValidation(null)
      toast.success(t('academic.grades.validations.validateSuccess'))
    },
    onError: () => {
      toast.error(t('academic.grades.errors.saveError'))
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (params: { gradeIds: string[], userId: string, reason: string }) =>
      rejectGrades({ data: params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradesKeys.all })
      setDialogOpen(false)
      setSelectedValidation(null)
      toast.success(t('academic.grades.validations.rejectSuccess'))
    },
    onError: () => {
      toast.error(t('academic.grades.errors.saveError'))
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

  const handleConfirm = async (reason?: string) => {
    if (!selectedValidation || !userId)
      return

    try {
      // Fetch actual grade IDs for the validation batch
      const gradeIds = await getSubmittedGradeIds({
        data: {
          classId: selectedValidation.classId,
          subjectId: selectedValidation.subjectId,
          termId: selectedValidation.termId,
        },
      })

      if (gradeIds.length === 0) {
        toast.error(t('academic.grades.validations.noValidations'))
        return
      }

      if (dialogMode === 'validate') {
        validateMutation.mutate({
          gradeIds,
          userId,
          comment: reason,
        })
      }
      else {
        rejectMutation.mutate({
          gradeIds,
          userId,
          reason: reason!,
        })
      }
    }
    catch {
      toast.error(t('academic.grades.errors.loadError'))
    }
  }

  const isMutating = validateMutation.isPending || rejectMutation.isPending

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.academic'), href: '/app/academic' },
          { label: t('nav.grades'), href: '/app/academic/grades' },
          { label: t('academic.grades.validations.title') },
        ]}
      />

      <div className="flex items-center gap-4">
        <Link to="/app/academic/grades">
          <Button variant="ghost" size="icon" aria-label={t('common.back')}>
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{t('academic.grades.validations.title')}</h1>
          <p className="text-muted-foreground">
            {t('academic.grades.validations.description')}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 size-4" />
          {t('academic.grades.filters.title')}
        </Button>
      </div>

      {isLoading
        ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map(() => (
                <Skeleton key={generateUUID()} className="h-32 w-full" />
              ))}
            </div>
          )
        : pendingValidations && pendingValidations.length > 0
          ? (
              <div className="space-y-4">
                {(pendingValidations as PendingValidation[]).map(validation => (
                  <GradeValidationCard
                    key={`${validation.classId}-${validation.subjectId}-${validation.termId}`}
                    validation={validation}
                    onViewDetails={() => {
                    // TODO: Navigate to detail view
                    }}
                    onValidate={() => handleValidate(validation)}
                    onReject={() => handleReject(validation)}
                    isLoading={isMutating}
                  />
                ))}
              </div>
            )
          : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-lg font-medium">{t('academic.grades.validations.noValidations')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('academic.grades.validations.allValidated')}
                  </p>
                </CardContent>
              </Card>
            )}

      <GradeValidationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        gradeCount={selectedValidation?.pendingCount ?? 0}
        onConfirm={handleConfirm}
        isLoading={isMutating}
      />
    </div>
  )
}
