import { IconAlertCircle, IconDeviceFloppy, IconInfoCircle, IconLayoutGrid } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
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
  const t = useTranslations()
  const [editedCells, setEditedCells] = useState(() => new Map<string, number>())
  const queryClient = useQueryClient()

  const { data, isPending, error } = useQuery(
    schoolCoefficientsOptions.matrix({ schoolYearTemplateId, seriesId }),
  )

  const { subjects = [], grades = [], matrix = {} } = useMemo(() => {
    if (data) {
      return data
    }
    return { subjects: [], grades: [], matrix: {} }
  }, [data])

  const bulkUpdateMutation = useMutation({
    mutationKey: schoolMutationKeys.coefficients.update,
    mutationFn: (
      updates: { coefficientTemplateId: string, weightOverride: number }[],
    ) => bulkUpdateSchoolCoefficients({ data: { updates } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolCoefficientsKeys.all })
      toast.success(t.academic.coefficients.messages.updateSuccess())
      setEditedCells(new Map())
    },
    onError: () => {
      toast.error(t.academic.coefficients.messages.updateError())
    },
  })

  const deleteOverrideMutation = useMutation({
    mutationKey: schoolMutationKeys.coefficients.delete,
    mutationFn: (overrideId: string) =>
      deleteCoefficientOverride({ data: overrideId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolCoefficientsKeys.all })
      toast.success(t.academic.coefficients.messages.resetSuccess())
    },
    onError: () => {
      toast.error(t.academic.coefficients.messages.resetError())
    },
  })

  const handleCellEdit = (templateId: string, value: number) => {
    const newEdited = new Map(editedCells)
    newEdited.set(templateId, value)
    setEditedCells(newEdited)
  }

  const handleSaveChanges = () => {
    if (editedCells.size === 0) {
      toast.error(t.academic.coefficients.bulk.noChanges())
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
    toast.info(t.academic.coefficients.messages.changesDiscarded())
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <IconAlertCircle className="h-5 w-5" />
            {t.academic.coefficients.messages.matrixError()}
          </CardTitle>
          <CardDescription>{(error as Error).message}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isPending) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
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
              {editedCells.size}
              {' '}
              {t.academic.coefficients.bulk.changes()}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {t.academic.coefficients.bulk.savePrompt()}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDiscardChanges}
            >
              {t.academic.coefficients.bulk.discard()}
            </Button>
            <Button
              size="sm"
              onClick={handleSaveChanges}
              disabled={bulkUpdateMutation.isPending}
            >
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
              {t.academic.coefficients.bulk.saveChanges()}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Matrix Table */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <IconLayoutGrid className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{t.academic.coefficients.matrix.title()}</CardTitle>
              <CardDescription>
                {t.academic.coefficients.matrix.description()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-border/10 hover:bg-transparent">
                  <TableHead className="w-[200px] sticky left-0 bg-background/80 backdrop-blur-md z-20 border-r border-border/10 py-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                      {t.academic.coefficients.matrix.subject()}
                    </span>
                  </TableHead>
                  {grades.map(grade => (
                    <TableHead
                      key={grade.id}
                      className="text-center min-w-[120px] border-b border-border/10 py-4"
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-semibold text-foreground">{grade.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{grade.code}</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map(subject => (
                  <TableRow key={subject.id} className="border-border/5 hover:bg-white/5 transition-colors group">
                    <TableCell className="font-medium sticky left-0 bg-card/60 backdrop-blur-md z-10 border-r border-border/10 py-4 group-hover:bg-primary/5 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{subject.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {subject.shortName}
                        </span>
                      </div>
                    </TableCell>
                    {grades.map((grade) => {
                      const cell = matrix[subject.id]?.[grade.id]
                      if (!cell) {
                        return (
                          <TableCell
                            key={grade.id}
                            className="text-center"
                          >
                            <span className="text-muted-foreground/30 text-xs">—</span>
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
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <IconInfoCircle className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-foreground font-medium">{t.academic.coefficients.matrix.noData()}</p>
              <p className="text-sm text-muted-foreground max-w-[250px] mx-auto mt-1">
                {t.academic.coefficients.matrix.noDataDescription()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-sm border-t-0 rounded-t-none">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-6 text-xs font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary/20 border border-primary/40 ring-1 ring-primary/20 ring-offset-1 ring-offset-background" />
              <span className="text-muted-foreground">{t.academic.coefficients.legend.override()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border border-border/60 bg-white/5" />
              <span className="text-muted-foreground">{t.academic.coefficients.legend.template()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-accent/20 border border-accent/40 ring-1 ring-accent/20 ring-offset-1 ring-offset-background" />
              <span className="text-muted-foreground">{t.academic.coefficients.legend.edited()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
