import type { FormEvent } from 'react'
import type { CreateCoefficientTemplateInput } from '@/schemas/coefficients'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { CatalogListSkeleton, CatalogStatsSkeleton } from '@/components/catalogs/catalog-skeleton'
import { COEFFICIENT_MESSAGES } from '@/constants/coefficients'
import { gradesQueryOptions, seriesQueryOptions, subjectsQueryOptions } from '@/integrations/tanstack-query/catalogs-options'
import {
  bulkCreateCoefficientsMutationOptions,
  bulkUpdateCoefficientsMutationOptions,
  coefficientStatsQueryOptions,
  coefficientTemplatesQueryOptions,
  copyCoefficientsMutationOptions,
  createCoefficientTemplateMutationOptions,
  deleteCoefficientTemplateMutationOptions,
  validateCoefficientImportMutationOptions,
} from '@/integrations/tanstack-query/coefficients-options'
import { schoolYearTemplatesQueryOptions } from '@/integrations/tanstack-query/programs-options'
import { exportCoefficientsToExcel, generateCoefficientTemplate, parseCoefficientsExcel } from '@/lib/excel/coefficients-excel'
import { useLogger } from '@/lib/logger'
import { parseServerFnError } from '@/utils/error-handlers'

import { CoefficientsFilters } from './coefficients/coefficients-filters'
import { CoefficientsForm } from './coefficients/coefficients-form'
import { CoefficientsHeader } from './coefficients/coefficients-header'
import { CoefficientsListView } from './coefficients/coefficients-list-view'
import { CoefficientsMatrixView } from './coefficients/coefficients-matrix-view'
import { CoefficientsStats } from './coefficients/coefficients-stats'

export const Route = createFileRoute('/_auth/app/catalogs/coefficients')({
  component: CoefficientsCatalog,
})

function CoefficientsCatalog() {
  const { logger } = useLogger()
  const queryClient = useQueryClient()

  const [isCreating, setIsCreating] = useState(false)
  const [newCoefYear, setNewCoefYear] = useState<string>('')
  const [newCoefSubject, setNewCoefSubject] = useState<string>('')
  const [newCoefGrade, setNewCoefGrade] = useState<string>('')
  const [newCoefSeries, setNewCoefSeries] = useState<string>('__none__')
  const [deletingCoefficient, setDeletingCoefficient] = useState<{ id: string, name: string } | null>(null)
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [seriesFilter, setSeriesFilter] = useState<string>('all')
  const [editingCells, setEditingCells] = useState<Record<string, number>>({})
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix')
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch data
  const { data: schoolYears, isPending: yearsPending } = useQuery(schoolYearTemplatesQueryOptions())
  const { data: subjects } = useQuery(subjectsQueryOptions({ limit: 100 }))
  const { data: grades } = useQuery(gradesQueryOptions())
  const { data: seriesData } = useQuery(seriesQueryOptions())
  const { data: stats, isPending: statsPending } = useQuery(coefficientStatsQueryOptions())

  const queryParams = useMemo(() => ({
    schoolYearTemplateId: yearFilter === 'all' ? undefined : yearFilter,
    gradeId: gradeFilter === 'all' ? undefined : gradeFilter,
    seriesId: seriesFilter === 'all' ? undefined : seriesFilter,
    limit: 200,
  }), [yearFilter, gradeFilter, seriesFilter])

  const { data: coefficientsData, isPending: coefficientsPending } = useQuery(
    coefficientTemplatesQueryOptions(queryParams),
  )

  // Mutations
  const createMutation = useMutation({
    ...createCoefficientTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coefficient-templates'] })
      queryClient.invalidateQueries({ queryKey: ['coefficient-stats'] })
      setIsCreating(false)
      setNewCoefYear('')
      setNewCoefSubject('')
      setNewCoefGrade('')
      setNewCoefSeries('__none__')
      toast.success(COEFFICIENT_MESSAGES.CREATED)
    },
    onError: (error) => {
      const message = parseServerFnError(error, COEFFICIENT_MESSAGES.ERROR_CREATE)
      toast.error(message)
    },
  })

  const deleteMutation = useMutation({
    ...deleteCoefficientTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coefficient-templates'] })
      queryClient.invalidateQueries({ queryKey: ['coefficient-stats'] })
      setDeletingCoefficient(null)
      toast.success(COEFFICIENT_MESSAGES.DELETED)
    },
    onError: (error) => {
      const message = parseServerFnError(error, COEFFICIENT_MESSAGES.ERROR_DELETE)
      toast.error(message)
    },
  })

  const bulkUpdateMutation = useMutation({
    ...bulkUpdateCoefficientsMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coefficient-templates'] })
      setEditingCells({})
      toast.success(COEFFICIENT_MESSAGES.BULK_UPDATED)
    },
    onError: (error) => {
      const message = parseServerFnError(error, COEFFICIENT_MESSAGES.ERROR_BULK_UPDATE)
      toast.error(message)
    },
  })

  const bulkCreateMutation = useMutation({ ...bulkCreateCoefficientsMutationOptions })
  const validateImportMutation = useMutation({ ...validateCoefficientImportMutationOptions })
  const copyMutation = useMutation({
    ...copyCoefficientsMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coefficient-templates'] })
      queryClient.invalidateQueries({ queryKey: ['coefficient-stats'] })
      toast.success(COEFFICIENT_MESSAGES.COPIED)
    },
    onError: (error) => {
      const message = parseServerFnError(error, COEFFICIENT_MESSAGES.ERROR_COPY)
      toast.error(message)
    },
  })

  useEffect(() => {
    logger.info('Coefficients catalog page viewed')
  }, [logger])

  const handleCreate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const seriesIdValue = formData.get('seriesId') as string
    const data: CreateCoefficientTemplateInput = {
      weight: Number.parseInt(formData.get('weight') as string),
      schoolYearTemplateId: formData.get('schoolYearTemplateId') as string,
      subjectId: formData.get('subjectId') as string,
      gradeId: formData.get('gradeId') as string,
      seriesId: seriesIdValue === '__none__' ? null : seriesIdValue || null,
    }
    createMutation.mutate(data)
  }

  const handleDelete = () => {
    if (deletingCoefficient) {
      deleteMutation.mutate({ id: deletingCoefficient.id })
    }
  }

  const handleCellEdit = (coefficientId: string, newWeight: number) => {
    setEditingCells(prev => ({ ...prev, [coefficientId]: newWeight }))
  }

  const handleSaveChanges = () => {
    const updates = Object.entries(editingCells).map(([id, weight]) => ({ id, weight }))
    if (updates.length > 0) {
      bulkUpdateMutation.mutate(updates)
    }
  }

  const handleCopyFromPreviousYear = () => {
    if (!schoolYears || schoolYears.length < 2) {
      toast.error('Impossible de trouver les années scolaires')
      return
    }
    const activeYear = schoolYears.find(y => y.isActive)
    const previousYear = schoolYears.find(y => !y.isActive)
    if (!activeYear || !previousYear) {
      toast.error('Impossible de trouver les années scolaires')
      return
    }
    copyMutation.mutate({ sourceYearId: previousYear.id, targetYearId: activeYear.id })
  }

  const handleExport = async () => {
    if (!coefficientsData?.coefficients.length) {
      toast.error('Aucun coefficient à exporter')
      return
    }
    try {
      await exportCoefficientsToExcel(coefficientsData.coefficients, `coefficients-${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Coefficients exportés avec succès')
    }
    catch {
      toast.error('Erreur lors de l\'exportation')
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      await generateCoefficientTemplate()
      toast.success('Modèle téléchargé avec succès')
    }
    catch {
      toast.error('Erreur lors du téléchargement du modèle')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file)
      return
    setIsImporting(true)
    try {
      const { data, errors } = await parseCoefficientsExcel(file)
      if (errors.length > 0 || data.length === 0) {
        toast.error('Erreurs ou aucune donnée dans le fichier')
        return
      }

      const subjectMap = new Map(subjects?.subjects.map(s => [s.name.toLowerCase().trim(), s.id]))
      const gradeMap = new Map(grades?.map(g => [g.name.toLowerCase().trim(), g.id]))
      const seriesMap = new Map(seriesData?.map(s => [s.name.toLowerCase().trim(), s.id]))
      const yearMap = new Map(schoolYears?.map(y => [y.name.trim(), y.id]))

      const mappedData = data.map((row) => {
        const subjectId = subjectMap.get(row['Matière'].toLowerCase().trim())
        const gradeId = gradeMap.get(row.Classe.toLowerCase().trim())
        const seriesId = row['Série'] ? seriesMap.get(row['Série'].toLowerCase().trim()) : null
        const yearId = yearMap.get(row['Année Scolaire'].trim())
        if (!yearId || !subjectId || !gradeId)
          return null
        return { weight: row.Coefficient, schoolYearTemplateId: yearId, subjectId, gradeId, seriesId: seriesId || null }
      }).filter((item): item is NonNullable<typeof item> => item !== null)

      if (mappedData.length === 0) {
        toast.error('Données invalides ou incomplètes')
        return
      }

      toast.loading('Validation...')
      const validationResult = await validateImportMutation.mutateAsync({ data: mappedData })
      toast.dismiss()

      if (!validationResult.valid) {
        toast.error('Erreurs de validation')
        return
      }

      toast.loading('Importation...')
      await bulkCreateMutation.mutateAsync({ coefficients: mappedData })
      toast.dismiss()
      toast.success('Import réussi')
      queryClient.invalidateQueries({ queryKey: ['coefficient-templates'] })
      queryClient.invalidateQueries({ queryKey: ['coefficient-stats'] })
    }
    catch {
      toast.dismiss()
      toast.error('Erreur lors de l\'import')
    }
    finally {
      setIsImporting(false)
      if (fileInputRef.current)
        fileInputRef.current.value = ''
    }
  }

  const matrixData = useMemo(() => {
    if (!coefficientsData || !subjects || !grades)
      return null
    const gradeOrderById = new Map(grades.map(grade => [grade.id, grade.order]))
    const columnKeys = new Set<string>()
    const columnInfo: Record<string, any> = {}

    coefficientsData.coefficients.forEach((coef) => {
      if (!coef.grade?.id)
        return
      const key = coef.series?.id ? `${coef.grade.id}__${coef.series.id}` : coef.grade.id
      columnKeys.add(key)
      columnInfo[key] = { gradeId: coef.grade.id, gradeName: coef.grade.name, seriesId: coef.series?.id, seriesName: coef.series?.name }
    })

    const sortedColumns = Array.from(columnKeys).sort((a, b) => {
      const orderA = gradeOrderById.get(columnInfo[a].gradeId) || 0
      const orderB = gradeOrderById.get(columnInfo[b].gradeId) || 0
      if (orderA !== orderB)
        return orderA - orderB
      return (columnInfo[a].seriesName || '').localeCompare(columnInfo[b].seriesName || '')
    })

    const matrix: Record<string, any> = {}
    coefficientsData.coefficients.forEach((coef) => {
      if (!coef.grade?.id || !coef.subject?.name)
        return
      const columnKey = coef.series?.id ? `${coef.grade.id}__${coef.series.id}` : coef.grade.id
      if (!matrix[coef.subject.name])
        matrix[coef.subject.name] = {}
      matrix[coef.subject.name][columnKey] = { id: coef.id, weight: editingCells[coef.id] ?? coef.weight }
    })
    return { matrix, columns: sortedColumns, columnInfo }
  }, [coefficientsData, subjects, grades, editingCells])

  if (yearsPending || statsPending) {
    return (
      <div className="space-y-6">
        <CatalogStatsSkeleton />
        <CatalogListSkeleton count={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <CoefficientsHeader
        onDownloadTemplate={handleDownloadTemplate}
        onImportClick={() => fileInputRef.current?.click()}
        onExport={handleExport}
        onCopyFromPreviousYear={handleCopyFromPreviousYear}
        onAddCoefficient={() => setIsCreating(true)}
        isImporting={isImporting}
        isCopyPending={copyMutation.isPending}
        hasCoefficients={!!coefficientsData?.coefficients.length}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
      />

      <CoefficientsStats
        total={stats?.total || 0}
        activeYearName={schoolYears?.find(y => y.isActive)?.name || 'Aucune'}
        pendingChangesCount={Object.keys(editingCells).length}
      />

      {isCreating && (
        <CoefficientsForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
          isPending={createMutation.isPending}
          schoolYears={schoolYears || []}
          subjects={subjects?.subjects || []}
          grades={grades || []}
          seriesData={seriesData || []}
          newCoefYear={newCoefYear}
          setNewCoefYear={setNewCoefYear}
          newCoefSubject={newCoefSubject}
          setNewCoefSubject={setNewCoefSubject}
          newCoefGrade={newCoefGrade}
          setNewCoefGrade={setNewCoefGrade}
          newCoefSeries={newCoefSeries}
          setNewCoefSeries={setNewCoefSeries}
        />
      )}

      <CoefficientsFilters
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        gradeFilter={gradeFilter}
        setGradeFilter={setGradeFilter}
        seriesFilter={seriesFilter}
        setSeriesFilter={setSeriesFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        schoolYears={schoolYears || []}
        grades={grades || []}
        seriesData={seriesData || []}
        editingCellsCount={Object.keys(editingCells).length}
        onSaveChanges={handleSaveChanges}
        isBulkUpdating={bulkUpdateMutation.isPending}
      />

      {viewMode === 'matrix'
        ? (
            <CoefficientsMatrixView matrixData={matrixData} onCellEdit={handleCellEdit} />
          )
        : (
            <CoefficientsListView
              isPending={coefficientsPending}
              coefficients={coefficientsData?.coefficients || []}
              onDelete={coef => setDeletingCoefficient({ id: coef.id, name: `${coef.subject?.name} - ${coef.grade?.name}` })}
            />
          )}

      <DeleteConfirmationDialog
        open={!!deletingCoefficient}
        onOpenChange={open => !open && setDeletingCoefficient(null)}
        title="Supprimer le coefficient"
        description={`Êtes-vous sûr de vouloir supprimer "${deletingCoefficient?.name}" ?`}
        confirmText={deletingCoefficient?.name}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
