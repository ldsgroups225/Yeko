import type { Grade } from '@repo/data-ops'
import type { FormEvent } from 'react'
import type { CreateGradeInput, CreateSerieInput, UpdateGradeInput, UpdateSerieInput } from '@/schemas/catalog'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  Award,
  Download,
  Edit,
  GraduationCap,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CatalogListSkeleton, CatalogStatsSkeleton } from '@/components/catalogs/catalog-skeleton'
import { DraggableGradeList } from '@/components/catalogs/draggable-grade-list'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  bulkCreateSeriesMutationOptions,
  bulkUpdateGradesOrderMutationOptions,
  createGradeMutationOptions,
  createSerieMutationOptions,
  deleteGradeMutationOptions,
  deleteSerieMutationOptions,
  gradesQueryOptions,
  seriesQueryOptions,
  tracksQueryOptions,
  updateGradeMutationOptions,
  updateSerieMutationOptions,
} from '@/integrations/tanstack-query/catalogs-options'
import { exportGradesToExcel, exportSeriesToExcel, importSeriesFromExcel } from '@/lib/catalog-csv'
import { useLogger } from '@/lib/logger'

export const Route = createFileRoute('/_auth/app/catalogs/grades')({
  component: GradesManagement,
})

function GradesManagement() {
  const { logger } = useLogger()
  const queryClient = useQueryClient()

  const [isCreatingGrade, setIsCreatingGrade] = useState(false)
  const [isCreatingSerie, setIsCreatingSerie] = useState(false)
  const [editingGrade, setEditingGrade] = useState<string | null>(null)
  const [editingSerie, setEditingSerie] = useState<string | null>(null)

  const [deletingGrade, setDeletingGrade] = useState<{ id: string, name: string } | null>(null)
  const [deletingSerie, setDeletingSerie] = useState<{ id: string, name: string } | null>(null)

  const { data: tracks, isLoading: tracksLoading } = useQuery(tracksQueryOptions())
  const { data: grades, isLoading: gradesLoading } = useQuery(gradesQueryOptions())
  const { data: series, isLoading: seriesLoading } = useQuery(seriesQueryOptions())

  const createGradeMutation = useMutation({
    ...createGradeMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] })
      setIsCreatingGrade(false)
      toast.success('Classe créée avec succès')
      logger.info('Grade created successfully')
    },
    onError: (error) => {
      toast.error('Erreur lors de la création de la classe')
      logger.error('Failed to create grade', error)
    },
  })

  const updateGradeMutation = useMutation({
    ...updateGradeMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] })
      setEditingGrade(null)
      toast.success('Classe mise à jour avec succès')
      logger.info('Grade updated successfully')
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour de la classe')
      logger.error('Failed to update grade', error)
    },
  })

  const deleteGradeMutation = useMutation({
    ...deleteGradeMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] })
      setDeletingGrade(null)
      toast.success('Classe supprimée avec succès')
      logger.info('Grade deleted successfully')
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression de la classe')
      logger.error('Failed to delete grade', error)
    },
  })

  const bulkUpdateGradesOrderMutation = useMutation({
    ...bulkUpdateGradesOrderMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] })
      toast.success('Ordre des classes mis à jour')
      logger.info('Grades reordered successfully')
    },
    onError: (error) => {
      toast.error('Erreur lors de la réorganisation des classes')
      logger.error('Failed to reorder grades', error)
    },
  })

  const createSerieMutation = useMutation({
    ...createSerieMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] })
      setIsCreatingSerie(false)
      toast.success('Série créée avec succès')
      logger.info('Serie created successfully')
    },
    onError: (error) => {
      toast.error('Erreur lors de la création de la série')
      logger.error('Failed to create serie', error)
    },
  })

  const bulkCreateSeriesMutation = useMutation({
    ...bulkCreateSeriesMutationOptions,
    onSuccess: (data: any[]) => {
      queryClient.invalidateQueries({ queryKey: ['series'] })
      toast.success(`${data.length} séries importées avec succès`)
      logger.info('Series imported successfully')
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'import des séries')
      logger.error('Failed to import series', error)
    },
  })

  const updateSerieMutation = useMutation({
    ...updateSerieMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] })
      setEditingSerie(null)
      toast.success('Série mise à jour avec succès')
      logger.info('Serie updated successfully')
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour de la série')
      logger.error('Failed to update serie', error)
    },
  })

  const deleteSerieMutation = useMutation({
    ...deleteSerieMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] })
      setDeletingSerie(null)
      toast.success('Série supprimée avec succès')
      logger.info('Serie deleted successfully')
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression de la série')
      logger.error('Failed to delete serie', error)
    },
  })

  useEffect(() => {
    logger.info('Grades management page viewed', {
      page: 'grades-management',
      timestamp: new Date().toISOString(),
    })
  }, [logger])

  const handleCreateGrade = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: CreateGradeInput = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      order: Number.parseInt(formData.get('order') as string),
      trackId: formData.get('trackId') as string,
    }
    createGradeMutation.mutate(data)
  }

  const handleUpdateGrade = (e: FormEvent<HTMLFormElement>, gradeId: string) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: UpdateGradeInput = {
      id: gradeId,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      order: Number.parseInt(formData.get('order') as string),
      trackId: formData.get('trackId') as string,
    }
    updateGradeMutation.mutate(data)
  }

  const handleDeleteGrade = () => {
    if (deletingGrade) {
      deleteGradeMutation.mutate({ id: deletingGrade.id })
    }
  }

  const handleCreateSerie = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: CreateSerieInput = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      trackId: formData.get('trackId') as string,
    }
    createSerieMutation.mutate(data)
  }

  const handleUpdateSerie = (e: FormEvent<HTMLFormElement>, serieId: string) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: UpdateSerieInput = {
      id: serieId,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      trackId: formData.get('trackId') as string,
    }
    updateSerieMutation.mutate(data)
  }

  const handleDeleteSerie = () => {
    if (deletingSerie) {
      deleteSerieMutation.mutate({ id: deletingSerie.id })
    }
  }

  const handleReorderGrades = async (reorderedGrades: Grade[]) => {
    const updates = reorderedGrades.map(grade => ({
      id: grade.id,
      order: grade.order,
    }))
    bulkUpdateGradesOrderMutation.mutate(updates)
  }

  const handleExportGrades = () => {
    if (grades && grades.length > 0) {
      exportGradesToExcel(grades)
      logger.info('Grades exported to Excel')
    }
  }

  const handleExportSeries = () => {
    if (series && series.length > 0) {
      exportSeriesToExcel(series)
      logger.info('Series exported to Excel')
    }
  }

  const handleImportSeries = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file)
      return

    try {
      const importedSeries = await importSeriesFromExcel(file)
      logger.info(`Imported ${importedSeries.length} series from Excel`)

      const seriesToCreate = importedSeries
        .filter(s => s.name && s.code && s.trackId)
        .map(s => s as CreateSerieInput)

      if (seriesToCreate.length > 0) {
        bulkCreateSeriesMutation.mutate(seriesToCreate)
      }
    }
    catch (error) {
      logger.error('Failed to import series', error as Error)
      toast.error('Erreur lors de l\'import du fichier')
    }
    finally {
      e.target.value = ''
    }
  }

  const groupedGrades = useMemo(() => {
    if (!grades || !tracks)
      return []

    return tracks.map(track => ({
      track,
      grades: grades.filter(g => g.trackId === track.id).sort((a, b) => a.order - b.order),
    }))
  }, [grades, tracks])

  const groupedSeries = useMemo(() => {
    if (!series || !tracks)
      return []

    return tracks.map(track => ({
      track,
      series: series.filter(s => s.trackId === track.id),
    }))
  }, [series, tracks])

  if (tracksLoading || gradesLoading || seriesLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded" />
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
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Classes et Séries</h1>
          <p className="text-muted-foreground">
            Gérer les niveaux de classe (6ème à Terminale) et les séries académiques (C, D, A, etc.)
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grades?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Niveaux de classe</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Séries</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{series?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Séries académiques</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filières</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tracks?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Filières disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Grades Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Classes</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportGrades} disabled={!grades || grades.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button className="gap-2" onClick={() => setIsCreatingGrade(true)}>
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* Create Grade Form */}
        {isCreatingGrade && (
          <Card>
            <CardHeader>
              <CardTitle>Créer une Nouvelle Classe</CardTitle>
              <CardDescription>Ajouter un nouveau niveau de classe</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGrade} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="grade-name">Nom *</Label>
                    <Input
                      id="grade-name"
                      name="name"
                      placeholder="6ème"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade-code">Code *</Label>
                    <Input
                      id="grade-code"
                      name="code"
                      placeholder="6EME"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade-order">Ordre *</Label>
                    <Input
                      id="grade-order"
                      name="order"
                      type="number"
                      placeholder="1"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade-trackId">Filière *</Label>
                  <select
                    id="grade-trackId"
                    name="trackId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Sélectionner une filière</option>
                    {tracks?.map(track => (
                      <option key={track.id} value={track.id}>
                        {track.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreatingGrade(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createGradeMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {createGradeMutation.isPending ? 'Création...' : 'Créer'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Grades by Track */}
        {groupedGrades.map(({ track, grades: trackGrades }) => (
          <Card key={track.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>{track.name}</CardTitle>
                  <CardDescription>
                    {trackGrades.length}
                    {' '}
                    classe(s) - Glissez pour réorganiser
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {trackGrades.length === 0
                ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune classe pour cette filière
                    </p>
                  )
                : editingGrade && trackGrades.some(g => g.id === editingGrade)
                  ? (
                      <div className="space-y-4">
                        {trackGrades.map(grade => (
                          <div key={grade.id}>
                            {editingGrade === grade.id
                              ? (
                                  <form
                                    onSubmit={e => handleUpdateGrade(e, grade.id)}
                                    className="border rounded-lg p-4 space-y-4"
                                  >
                                    <div className="grid gap-4 md:grid-cols-3">
                                      <div className="space-y-2">
                                        <Label htmlFor={`edit-grade-name-${grade.id}`}>Nom *</Label>
                                        <Input
                                          id={`edit-grade-name-${grade.id}`}
                                          name="name"
                                          defaultValue={grade.name}
                                          required
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor={`edit-grade-code-${grade.id}`}>Code *</Label>
                                        <Input
                                          id={`edit-grade-code-${grade.id}`}
                                          name="code"
                                          defaultValue={grade.code}
                                          required
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor={`edit-grade-order-${grade.id}`}>Ordre *</Label>
                                        <Input
                                          id={`edit-grade-order-${grade.id}`}
                                          name="order"
                                          type="number"
                                          defaultValue={grade.order}
                                          required
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor={`edit-grade-track-${grade.id}`}>Filière *</Label>
                                      <select
                                        id={`edit-grade-track-${grade.id}`}
                                        name="trackId"
                                        defaultValue={grade.trackId}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        required
                                      >
                                        {tracks?.map(track => (
                                          <option key={track.id} value={track.id}>
                                            {track.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="flex nd gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingGrade(null)}
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Annuler
                                      </Button>
                                      <Button type="submit" disabled={updateGradeMutation.isPending}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {updateGradeMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                                      </Button>
                                    </div>
                                  </form>
                                )
                              : (
                                  <div className="flex items-center justify-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                      <div className="flex h-10 w-10 items-center justify-center roundedue-50 dark:bg-blue-950">
                                        <GraduationCap className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div>
                                        <h3 className="font-semibold">{grade.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Badge variant="outline" className="text-xs">
                                            {grade.code}
                                          </Badge>
                                          <Badge variant="secondary" className="text-xs">
                                            Ordre:
                                            {' '}
                                            {grade.order}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditingGrade(grade.id)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeletingGrade({ id: grade.id, name: grade.name })}
                                        disabled={deleteGradeMutation.isPending}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                          </div>
                        ))}
                      </div>
                    )
                  : (
                      <DraggableGradeList
                        grades={trackGrades}
                        onReorder={handleReorderGrades}
                        onEdit={setEditingGrade}
                        onDelete={setDeletingGrade}
                      />
                    )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Series Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Séries</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportSeries} disabled={!series || series.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImportSeries}
              />
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </Button>
            </div>
            <Button className="gap-2" onClick={() => setIsCreatingSerie(true)}>
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* Create Serie Form */}
        {isCreatingSerie && (
          <Card>
            <CardHeader>
              <CardTitle>Créer une Nouvelle Série</CardTitle>
              <CardDescription>Ajouter une nouvelle série académique</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSerie} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="serie-name">Nom *</Label>
                    <Input
                      id="serie-name"
                      name="name"
                      placeholder="Série C"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serie-code">Code *</Label>
                    <Input
                      id="serie-code"
                      name="code"
                      placeholder="C"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serie-trackId">Filière *</Label>
                  <select
                    id="serie-trackId"
                    name="trackId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Sélectionner une filière</option>
                    {tracks?.map(track => (
                      <option key={track.id} value={track.id}>
                        {track.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreatingSerie(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createSerieMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {createSerieMutation.isPending ? 'Création...' : 'Créer'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Series by Track */}
        {groupedSeries.map(({ track, series: trackSeries }) => (
          <Card key={track.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>{track.name}</CardTitle>
                  <CardDescription>
                    {trackSeries.length}
                    {' '}
                    série(s)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {trackSeries.length === 0
                    ? (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-sm text-muted-foreground text-center py-4"
                        >
                          Aucune série pour cette filière
                        </motion.p>
                      )
                    : (
                        trackSeries.map(serie => (
                          <motion.div
                            key={serie.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            {editingSerie === serie.id
                              ? (
                                  <form
                                    onSubmit={e => handleUpdateSerie(e, serie.id)}
                                    className="border rounded-lg p-4 space-y-4"
                                  >
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div className="space-y-2">
                                        <Label htmlFor={`edit-serie-name-${serie.id}`}>Nom *</Label>
                                        <Input
                                          id={`edit-serie-name-${serie.id}`}
                                          name="name"
                                          defaultValue={serie.name}
                                          required
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor={`edit-serie-code-${serie.id}`}>Code *</Label>
                                        <Input
                                          id={`edit-serie-code-${serie.id}`}
                                          name="code"
                                          defaultValue={serie.code}
                                          required
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor={`edit-serie-track-${serie.id}`}>Filière *</Label>
                                      <select
                                        id={`edit-serie-track-${serie.id}`}
                                        name="trackId"
                                        defaultValue={serie.trackId}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        required
                                      >
                                        {tracks?.map(track => (
                                          <option key={track.id} value={track.id}>
                                            {track.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingSerie(null)}
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Annuler
                                      </Button>
                                      <Button type="submit" disabled={updateSerieMutation.isPending}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {updateSerieMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                                      </Button>
                                    </div>
                                  </form>
                                )
                              : (
                                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950">
                                        <Award className="h-5 w-5 text-purple-600" />
                                      </div>
                                      <div>
                                        <h3 className="font-semibold">{serie.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Badge variant="outline" className="text-xs">
                                            {serie.code}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditingSerie(serie.id)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeletingSerie({ id: serie.id, name: serie.name })}
                                        disabled={deleteSerieMutation.isPending}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                          </motion.div>
                        ))
                      )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialogs */}
      <DeleteConfirmationDialog
        open={!!deletingGrade}
        onOpenChange={open => !open && setDeletingGrade(null)}
        title="Supprimer la classe"
        description={`Êtes-vous sûr de vouloir supprimer la classe "${deletingGrade?.name}" ? Cette action est irréversible.`}
        confirmText={deletingGrade?.name}
        onConfirm={handleDeleteGrade}
        isLoading={deleteGradeMutation.isPending}
      />

      <DeleteConfirmationDialog
        open={!!deletingSerie}
        onOpenChange={open => !open && setDeletingSerie(null)}
        title="Supprimer la série"
        description={`Êtes-vous sûr de vouloir supprimer la série "${deletingSerie?.name}" ? Cette action est irréversible.`}
        confirmText={deletingSerie?.name}
        onConfirm={handleDeleteSerie}
        isLoading={deleteSerieMutation.isPending}
      />
    </div>
  )
}
