import type { FormEvent } from 'react'
import type { CreateCoefficientTemplateInput } from '@/schemas/coefficients'
import {
  IconAlertTriangle,
  IconCalculator,
  IconCopy,
  IconDeviceFloppy,
  IconDownload,
  IconFileDownload,
  IconFileUpload,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { CatalogListSkeleton, CatalogStatsSkeleton } from '@/components/catalogs/catalog-skeleton'
import { COEFFICIENT_LIMITS, COEFFICIENT_MESSAGES } from '@/constants/coefficients'
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
  const { data: schoolYears, isLoading: yearsLoading } = useQuery(schoolYearTemplatesQueryOptions())
  const { data: subjects } = useQuery(subjectsQueryOptions({ limit: 100 }))
  const { data: grades } = useQuery(gradesQueryOptions())
  const { data: seriesData } = useQuery(seriesQueryOptions())
  const { data: stats, isLoading: statsLoading } = useQuery(coefficientStatsQueryOptions())

  const queryParams = useMemo(() => ({
    schoolYearTemplateId: yearFilter === 'all' ? undefined : yearFilter,
    gradeId: gradeFilter === 'all' ? undefined : gradeFilter,
    seriesId: seriesFilter === 'all' ? undefined : seriesFilter,
    limit: 200,
  }), [yearFilter, gradeFilter, seriesFilter])

  const { data: coefficientsData, isLoading: coefficientsLoading } = useQuery(
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
      logger.info('Coefficient template created')
    },
    onError: (error: any) => {
      const isDuplicate = error?.message?.includes('unique') || error?.message?.includes('duplicate')
      const message = parseServerFnError(error, isDuplicate ? COEFFICIENT_MESSAGES.ERROR_DUPLICATE : COEFFICIENT_MESSAGES.ERROR_CREATE)
      toast.error(message)
      logger.error('Failed to create coefficient template', error)
    },
  })

  const deleteMutation = useMutation({
    ...deleteCoefficientTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coefficient-templates'] })
      queryClient.invalidateQueries({ queryKey: ['coefficient-stats'] })
      setDeletingCoefficient(null)
      toast.success(COEFFICIENT_MESSAGES.DELETED)
      logger.info('Coefficient template deleted')
    },
    onError: (error) => {
      const message = parseServerFnError(error, COEFFICIENT_MESSAGES.ERROR_DELETE)
      toast.error(message)
      logger.error('Failed to delete coefficient template', error)
    },
  })

  const bulkUpdateMutation = useMutation({
    ...bulkUpdateCoefficientsMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coefficient-templates'] })
      setEditingCells({})
      toast.success(COEFFICIENT_MESSAGES.BULK_UPDATED)
      logger.info('Coefficients bulk updated')
    },
    onError: (error) => {
      const message = parseServerFnError(error, COEFFICIENT_MESSAGES.ERROR_BULK_UPDATE)
      toast.error(message)
      logger.error('Failed to bulk update coefficients', error)
    },
  })

  const bulkCreateMutation = useMutation({
    ...bulkCreateCoefficientsMutationOptions,
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de l\'import des coefficients')
      toast.error(message)
      logger.error('Failed to bulk create coefficients', error)
    },
  })

  const validateImportMutation = useMutation({
    ...validateCoefficientImportMutationOptions,
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la validation')
      toast.error(message)
      logger.error('Failed to validate coefficient import', error)
    },
  })

  const copyMutation = useMutation({
    ...copyCoefficientsMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coefficient-templates'] })
      queryClient.invalidateQueries({ queryKey: ['coefficient-stats'] })
      toast.success(COEFFICIENT_MESSAGES.COPIED)
      logger.info('Coefficients copied from previous year')
    },
    onError: (error) => {
      const message = parseServerFnError(error, COEFFICIENT_MESSAGES.ERROR_COPY)
      toast.error(message)
      logger.error('Failed to copy coefficients', error)
    },
  })

  useEffect(() => {
    logger.info('Coefficients catalog page viewed', {
      page: 'coefficients-catalog',
      timestamp: new Date().toISOString(),
    })
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

    const activeYear = schoolYears.find((y: any) => y.isActive)
    const previousYear = schoolYears.find((y: any) => !y.isActive)

    if (!activeYear || !previousYear) {
      toast.error('Impossible de trouver les années scolaires')
      return
    }

    copyMutation.mutate({
      sourceYearId: previousYear.id,
      targetYearId: activeYear.id,
    })
  }

  const handleExport = async () => {
    if (!coefficientsData || coefficientsData.coefficients.length === 0) {
      toast.error('Aucun coefficient à exporter')
      return
    }

    try {
      await exportCoefficientsToExcel(
        coefficientsData.coefficients,
        `coefficients-${new Date().toISOString().split('T')[0]}.xlsx`,
      )
      toast.success('Coefficients exportés avec succès')
      logger.info('Coefficients exported to Excel')
    }
    catch (error) {
      toast.error('Erreur lors de l\'exportation')
      logger.error('Failed to export coefficients', error instanceof Error ? error : new Error(String(error)))
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      await generateCoefficientTemplate()
      toast.success('Modèle téléchargé avec succès')
      logger.info('Coefficient template downloaded')
    }
    catch (error) {
      toast.error('Erreur lors du téléchargement du modèle')
      logger.error('Failed to download template', error instanceof Error ? error : new Error(String(error)))
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file)
      return

    setIsImporting(true)

    try {
      const { data, errors } = await parseCoefficientsExcel(file)

      if (errors.length > 0) {
        toast.error(`Erreurs trouvées: ${errors.length}`, {
          description: errors.slice(0, 3).join(', '),
        })
        logger.error('Excel import validation errors', new Error(errors.join('; ')))
        setIsImporting(false)
        return
      }

      if (data.length === 0) {
        toast.error('Aucune donnée trouvée dans le fichier')
        setIsImporting(false)
        return
      }

      // Create lookup maps for name-to-ID mapping
      const subjectMap = new Map<string, string>(subjects?.subjects.map(s => [s.name.toLowerCase().trim(), s.id]) || [])
      const gradeMap = new Map<string, string>(grades?.map(g => [g.name.toLowerCase().trim(), g.id]) || [])
      const seriesMap = new Map<string, string>(seriesData?.map(s => [s.name.toLowerCase().trim(), s.id]) || [])
      const yearMap = new Map<string, string>(schoolYears?.map((y: { name: string, id: string }) => [y.name.trim(), y.id]) || [])

      // Map Excel data to coefficient IDs
      const mappingErrors: string[] = []
      const mappedData = data.map((row, index) => {
        const rowNum = index + 1
        const subjectId = subjectMap.get(row['Matière'].toLowerCase().trim())
        const gradeId = gradeMap.get(row.Classe.toLowerCase().trim())
        const seriesId = row['Série'] ? seriesMap.get(row['Série'].toLowerCase().trim()) : null
        const yearId = yearMap.get(row['Année Scolaire'].trim())

        if (!yearId) {
          mappingErrors.push(`Ligne ${rowNum}: Année scolaire "${row['Année Scolaire']}" introuvable`)
        }
        if (!subjectId) {
          mappingErrors.push(`Ligne ${rowNum}: Matière "${row['Matière']}" introuvable`)
        }
        if (!gradeId) {
          mappingErrors.push(`Ligne ${rowNum}: Classe "${row.Classe}" introuvable`)
        }
        if (row['Série'] && !seriesId) {
          mappingErrors.push(`Ligne ${rowNum}: Série "${row['Série']}" introuvable`)
        }

        if (!yearId || !subjectId || !gradeId) {
          return null
        }

        return {
          weight: row.Coefficient,
          schoolYearTemplateId: yearId,
          subjectId,
          gradeId,
          seriesId: seriesId || null,
        }
      }).filter((item): item is NonNullable<typeof item> => item !== null)

      // Show mapping errors if any
      if (mappingErrors.length > 0) {
        toast.error(`Erreurs de mapping: ${mappingErrors.length}`, {
          description: mappingErrors.slice(0, 3).join('\n'),
        })
        logger.error('Excel mapping errors', new Error(mappingErrors.join('; ')))
        setIsImporting(false)
        return
      }

      // Validate mapped data against database
      toast.loading('Validation en cours...')
      const validationResult = await validateImportMutation.mutateAsync({ data: mappedData })

      if (!validationResult.valid) {
        toast.dismiss()
        toast.error(`Erreurs de validation: ${validationResult.errors.length}`, {
          description: validationResult.errors.slice(0, 3).map(e => `Ligne ${e.row}: ${e.message}`).join('\n'),
        })
        logger.error('Coefficient validation errors', new Error(JSON.stringify(validationResult.errors)))
        setIsImporting(false)
        return
      }

      toast.dismiss()

      // Bulk create coefficients
      toast.loading(`Import de ${mappedData.length} coefficients en cours...`)
      await bulkCreateMutation.mutateAsync({ coefficients: mappedData })

      toast.dismiss()
      toast.success(`${mappedData.length} coefficients importés avec succès`)
      logger.info('Coefficients imported successfully', { count: mappedData.length })

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['coefficient-templates'] })
      queryClient.invalidateQueries({ queryKey: ['coefficient-stats'] })
    }
    catch (error) {
      toast.dismiss()
      toast.error('Erreur lors de l\'import')
      logger.error('Failed to import coefficients', error instanceof Error ? error : new Error(String(error)))
    }
    finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Build matrix data with proper grade+series handling
  const matrixData = useMemo(() => {
    if (!coefficientsData || !subjects || !grades)
      return null

    // Build unique column keys from actual data (grade or grade+series)
    const columnKeys = new Set<string>()
    const columnInfo: Record<string, { gradeId: string, gradeName: string, seriesId?: string, seriesName?: string }> = {}

    coefficientsData.coefficients.forEach((coef: any) => {
      const gradeName = coef.grade?.name || 'Unknown'
      const key = coef.series ? `${coef.grade?.id}__${coef.series.id}` : coef.grade?.id
      columnKeys.add(key)
      columnInfo[key] = {
        gradeId: coef.grade?.id,
        gradeName,
        seriesId: coef.series?.id,
        seriesName: coef.series?.name,
      }
    })

    // Sort columns by grade order then series name
    const sortedColumns = Array.from(columnKeys).sort((a, b) => {
      const infoA = columnInfo[a]
      const infoB = columnInfo[b]
      const gradeA = grades.find(g => g.id === infoA?.gradeId)
      const gradeB = grades.find(g => g.id === infoB?.gradeId)
      const orderDiff = (gradeA?.order || 0) - (gradeB?.order || 0)
      if (orderDiff !== 0)
        return orderDiff
      return (infoA?.seriesName || '').localeCompare(infoB?.seriesName || '')
    })

    // Build matrix: subject -> columnKey -> coefficient
    const matrix: Record<string, Record<string, { id: string, weight: number }>> = {}

    coefficientsData.coefficients.forEach((coef: any) => {
      const subjectName = coef.subject?.name || 'Unknown'
      const columnKey = coef.series ? `${coef.grade?.id}__${coef.series.id}` : coef.grade?.id

      const subjectMatrix = matrix[subjectName] || {}
      subjectMatrix[columnKey] = {
        id: coef.id,
        weight: editingCells[coef.id] ?? coef.weight,
      }
      matrix[subjectName] = subjectMatrix
    })

    return { matrix, columns: sortedColumns, columnInfo }
  }, [coefficientsData, subjects, grades, editingCells])

  const activeYear = schoolYears?.find((y: any) => y.isActive)

  if (yearsLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <CatalogStatsSkeleton />
        <CatalogListSkeleton count={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coefficients</h1>
          <p className="text-muted-foreground">
            Gérer les coefficients des matières pour le calcul des moyennes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <IconFileDownload className="h-4 w-4 mr-2" />
            Modèle
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportClick} disabled={isImporting}>
            <IconFileUpload className="h-4 w-4 mr-2" />
            {isImporting ? 'Import...' : 'Importer'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!coefficientsData || coefficientsData.coefficients.length === 0}>
            <IconDownload className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" onClick={handleCopyFromPreviousYear} disabled={copyMutation.isPending}>
            <IconCopy className="h-4 w-4 mr-2" />
            Copier Année Précédente
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <IconPlus className="h-4 w-4 mr-2" />
            Nouveau Coefficient
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coefficients</CardTitle>
            <IconCalculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Configurations actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Année Active</CardTitle>
            <IconCalculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeYear?.name || 'Aucune'}</div>
            <p className="text-xs text-muted-foreground">Année scolaire en cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modifications</CardTitle>
            <IconDeviceFloppy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(editingCells).length}</div>
            <p className="text-xs text-muted-foreground">En attente de sauvegarde</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Créer un Nouveau Coefficient</CardTitle>
            <CardDescription>Ajouter un coefficient pour une matière et une classe</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="coef-year">Année Scolaire *</Label>
                  <Select
                    name="schoolYearTemplateId"
                    required
                    value={newCoefYear}
                    onValueChange={val => val && setNewCoefYear(val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner">
                        {newCoefYear
                          ? (() => {
                              const year = schoolYears?.find(y => y.id === newCoefYear)
                              return year
                                ? (
                                    <div className="flex items-center gap-2">
                                      <span>{year.name}</span>
                                      {year.isActive && <Badge variant="secondary" className="text-[10px] h-4">Active</Badge>}
                                    </div>
                                  )
                                : undefined
                            })()
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {schoolYears?.map(year => (
                        <SelectItem key={year.id} value={year.id}>
                          <div className="flex items-center gap-2">
                            <span>{year.name}</span>
                            {year.isActive && <Badge variant="secondary" className="text-[10px] h-4">Active</Badge>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coef-subject">Matière *</Label>
                  <Select name="subjectId" required value={newCoefSubject} onValueChange={val => val && setNewCoefSubject(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la matière">
                        {newCoefSubject
                          ? subjects?.subjects.find(s => s.id === newCoefSubject)?.name
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coef-grade">Classe *</Label>
                  <Select name="gradeId" required value={newCoefGrade} onValueChange={val => val && setNewCoefGrade(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la classe">
                        {newCoefGrade
                          ? grades?.find(g => g.id === newCoefGrade)?.name
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {grades?.map(grade => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coef-series">Série (optionnel)</Label>
                  <Select name="seriesId" defaultValue="__none__" value={newCoefSeries} onValueChange={val => val && setNewCoefSeries(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Aucune">
                        {newCoefSeries === '__none__'
                          ? 'Aucune'
                          : seriesData?.find(s => s.id === newCoefSeries)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Aucune</SelectItem>
                      {seriesData?.map(serie => (
                        <SelectItem key={serie.id} value={serie.id}>
                          {serie.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coef-weight">Coefficient *</Label>
                  <Input
                    id="coef-weight"
                    name="weight"
                    type="number"
                    min={COEFFICIENT_LIMITS.MIN}
                    max={COEFFICIENT_LIMITS.MAX}
                    required
                    placeholder={String(COEFFICIENT_LIMITS.DEFAULT)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Entre
                    {' '}
                    {COEFFICIENT_LIMITS.MIN}
                    {' '}
                    et
                    {' '}
                    {COEFFICIENT_LIMITS.MAX}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  <IconX className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  <IconDeviceFloppy className="h-4 w-4 mr-2" />
                  {createMutation.isPending ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters & View Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filtres</CardTitle>
              <CardDescription>Filtrer les coefficients par année, classe ou série</CardDescription>
            </div>
            <Tabs value={viewMode} onValueChange={v => setViewMode(v as 'matrix' | 'list')}>
              <TabsList>
                <TabsTrigger value="matrix">Matrice</TabsTrigger>
                <TabsTrigger value="list">Liste</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={yearFilter} onValueChange={val => val && setYearFilter(val)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Année">
                  {yearFilter === 'all'
                    ? 'Toutes les années'
                    : (() => {
                        const year = schoolYears?.find((y: any) => y.id === yearFilter)
                        return year
                          ? (
                              <div className="flex items-center gap-2">
                                <span>{year.name}</span>
                                {year.isActive && <Badge variant="secondary" className="text-[10px] h-4">Active</Badge>}
                              </div>
                            )
                          : undefined
                      })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les années</SelectItem>
                {schoolYears?.map((year: any) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={gradeFilter} onValueChange={val => val && setGradeFilter(val)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Classe">
                  {gradeFilter === 'all'
                    ? 'Toutes les classes'
                    : grades?.find(g => g.id === gradeFilter)?.name || undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                {grades?.map(grade => (
                  <SelectItem key={grade.id} value={grade.id}>
                    {grade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={seriesFilter} onValueChange={val => val && setSeriesFilter(val)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Série">
                  {seriesFilter === 'all'
                    ? 'Toutes les séries'
                    : seriesData?.find(s => s.id === seriesFilter)?.name || undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les séries</SelectItem>
                {seriesData?.map(serie => (
                  <SelectItem key={serie.id} value={serie.id}>
                    {serie.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {Object.keys(editingCells).length > 0 && (
              <Button onClick={handleSaveChanges} disabled={bulkUpdateMutation.isPending} className="ml-auto">
                <IconDeviceFloppy className="h-4 w-4 mr-2" />
                Enregistrer (
                {Object.keys(editingCells).length}
                )
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Matrix View */}
      {viewMode === 'matrix' && matrixData && (
        <Card>
          <CardHeader>
            <CardTitle>Vue Matrice</CardTitle>
            <CardDescription>Cliquez sur un coefficient pour le modifier</CardDescription>
          </CardHeader>
          <CardContent>
            {matrixData.columns.length === 0
              ? (
                  <div className="text-center py-8">
                    <IconCalculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Aucun coefficient trouvé</h3>
                    <p className="text-muted-foreground">
                      Commencez par créer votre premier coefficient.
                    </p>
                  </div>
                )
              : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 bg-muted sticky left-0 z-10">Matière</th>
                          {matrixData.columns.map((columnKey) => {
                            const info = matrixData.columnInfo[columnKey]
                            return (
                              <th key={columnKey} className="text-center p-3 bg-muted min-w-24">
                                <div className="flex flex-col">
                                  <span>{info?.gradeName}</span>
                                  {info?.seriesName && (
                                    <span className="text-xs font-normal text-muted-foreground">
                                      {info.seriesName}
                                    </span>
                                  )}
                                </div>
                              </th>
                            )
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(matrixData.matrix).map(([subjectName, columnCoefs], index) => (
                          <tr key={subjectName} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                            <td className="font-medium p-3 border-r sticky left-0 bg-background">
                              {subjectName}
                            </td>
                            {matrixData.columns.map((columnKey) => {
                              const coef = columnCoefs[columnKey]
                              return (
                                <td key={columnKey} className="text-center p-3">
                                  {coef
                                    ? (
                                        <div className="flex flex-col items-center gap-1">
                                          <Input
                                            type="number"
                                            value={coef.weight}
                                            onChange={e => handleCellEdit(coef.id, Number.parseInt(e.target.value))}
                                            className={`w-16 mx-auto text-center ${coef.weight === 0 ? 'border-secondary' : ''}`}
                                            min={COEFFICIENT_LIMITS.MIN}
                                            max={COEFFICIENT_LIMITS.MAX}
                                          />
                                          {coef.weight === 0 && (
                                            <div className="flex items-center gap-1 text-xs text-secondary">
                                              <IconAlertTriangle className="h-3 w-3" />
                                              <span>Coef 0</span>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                      )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Liste des Coefficients</CardTitle>
            <CardDescription>
              {coefficientsData?.pagination.total || 0}
              {' '}
              coefficient(s) au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {coefficientsLoading
              ? (
                  <CatalogListSkeleton count={5} />
                )
              : !coefficientsData || coefficientsData.coefficients.length === 0
                  ? (
                      <div className="text-center py-8">
                        <IconCalculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">Aucun coefficient trouvé</h3>
                        <p className="text-muted-foreground">
                          Commencez par créer votre premier coefficient.
                        </p>
                      </div>
                    )
                  : (
                      <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                          {coefficientsData.coefficients.map((coef: any) => (
                            <motion.div
                              key={coef.id}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                  <span className="text-lg font-bold text-primary">{coef.weight}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">{coef.subject?.name}</h3>
                                    <Badge variant="outline">{coef.grade?.name}</Badge>
                                    {coef.series && (
                                      <Badge variant="secondary">{coef.series.name}</Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {coef.schoolYearTemplate?.name}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingCoefficient({
                                  id: coef.id,
                                  name: `${coef.subject?.name} - ${coef.grade?.name}`,
                                })}
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deletingCoefficient}
        onOpenChange={open => !open && setDeletingCoefficient(null)}
        title="Supprimer le coefficient"
        description={`Êtes-vous sûr de vouloir supprimer le coefficient "${deletingCoefficient?.name}" ? Cette action est irréversible.`}
        confirmText={deletingCoefficient?.name}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
