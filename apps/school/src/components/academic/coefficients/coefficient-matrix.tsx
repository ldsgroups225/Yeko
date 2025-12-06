import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Save } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  schoolCoefficientsKeys,
  schoolCoefficientsOptions,
} from '@/lib/queries/school-coefficients'
import {
  bulkUpdateSchoolCoefficients,
  deleteCoefficientOverride,
} from '@/school/functions/school-coefficients'
import { CoefficientCell } from './coefficient-cell'

interface CoefficientMatrixProps {
  schoolYearTemplateId: string
  seriesId?: string | null
}

export function CoefficientMatrix({
  schoolYearTemplateId,
  seriesId,
}: CoefficientMatrixProps) {
  const { t } = useTranslation()
  const [editedCells, setEditedCells] = useState(() => new Map<string, number>())
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery(
    schoolCoefficientsOptions.matrix({ schoolYearTemplateId, seriesId }),
  )

  const bulkUpdateMutation = useMutation({
    mutationFn: (
      updates: { coefficientTemplateId: string, weightOverride: number }[],
    ) => bulkUpdateSchoolCoefficients({ data: { updates } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolCoefficientsKeys.all })
      toast.success(t('academic.coefficients.messages.updateSuccess'))
      setEditedCells(new Map())
    },
    onError: () => {
      toast.error(t('academic.coefficients.messages.updateError'))
    },
  })

  const deleteOverrideMutation = useMutation({
    mutationFn: (overrideId: string) =>
      deleteCoefficientOverride({ data: overrideId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolCoefficientsKeys.all })
      toast.success(t('academic.coefficients.messages.resetSuccess'))
    },
    onError: () => {
      toast.error(t('academic.coefficients.messages.resetError'))
    },
  })

  const handleCellEdit = (templateId: string, value: number) => {
    const newEdited = new Map(editedCells)
    newEdited.set(templateId, value)
    setEditedCells(newEdited)
  }

  const handleSaveChanges = () => {
    if (editedCells.size === 0) {
      toast.error(t('academic.coefficients.bulk.noChanges'))
      return
    }

    const updates = Array.from(editedCells.entries()).map(
      ([templateId, weight]) => ({
        coefficientTemplateId: templateId,
        weightOverride: weight,
      }),
    )

    bulkUpdateMutation.mutate(updates)
  }

  const handleResetCell = (overrideId: string) => {
    deleteOverrideMutation.mutate(overrideId)
  }

  const handleDiscardChanges = () => {
    setEditedCells(new Map())
    toast.info(t('academic.coefficients.messages.changesDiscarded'))
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {t('academic.coefficients.messages.matrixError')}
          </CardTitle>
          <CardDescription>{(error as Error).message}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const { subjects = [], grades = [], matrix = {} } = data || {}

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      {editedCells.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {t('academic.coefficients.bulk.changes', {
                count: editedCells.size,
              })}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {t('academic.coefficients.bulk.savePrompt')}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDiscardChanges}
            >
              {t('academic.coefficients.bulk.discard')}
            </Button>
            <Button
              size="sm"
              onClick={handleSaveChanges}
              disabled={bulkUpdateMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {t('academic.coefficients.bulk.saveChanges')}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('academic.coefficients.matrix.title')}</CardTitle>
          <CardDescription>
            {t('academic.coefficients.matrix.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] sticky left-0 bg-background z-10">
                    {t('academic.coefficients.matrix.subject')}
                  </TableHead>
                  {grades.map(grade => (
                    <TableHead
                      key={grade.id}
                      className="text-center min-w-[100px]"
                    >
                      {grade.name}
                      <div className="text-xs text-muted-foreground font-normal">
                        (
                        {grade.code}
                        )
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map(subject => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium sticky left-0 bg-background z-10">
                      <div>
                        <div>{subject.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {subject.shortName}
                        </div>
                      </div>
                    </TableCell>
                    {grades.map((grade) => {
                      const cell = matrix[subject.id]?.[grade.id]
                      if (!cell) {
                        return (
                          <TableCell
                            key={grade.id}
                            className="text-center text-muted-foreground"
                          >
                            —
                          </TableCell>
                        )
                      }

                      const editedValue = editedCells.get(cell.templateId)
                      const displayValue = editedValue ?? cell.effectiveWeight

                      return (
                        <TableCell key={grade.id} className="p-2">
                          <CoefficientCell
                            templateId={cell.templateId}
                            templateWeight={cell.templateWeight}
                            effectiveWeight={displayValue}
                            isOverride={cell.isOverride}
                            overrideId={cell.overrideId}
                            isEdited={editedCells.has(cell.templateId)}
                            onEdit={value =>
                              handleCellEdit(cell.templateId, value)}
                            onReset={() =>
                              cell.overrideId && handleResetCell(cell.overrideId)}
                          />
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Empty State */}
          {subjects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>{t('academic.coefficients.matrix.noData')}</p>
              <p className="text-sm">
                {t('academic.coefficients.matrix.noDataDescription')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-primary bg-primary/10" />
              <span>{t('academic.coefficients.legend.override')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border" />
              <span>{t('academic.coefficients.legend.template')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-amber-500 bg-amber-500/10" />
              <span>{t('academic.coefficients.legend.edited')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
