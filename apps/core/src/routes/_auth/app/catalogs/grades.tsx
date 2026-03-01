import type { Grade } from '@repo/data-ops'
import type { CreateGradeInput, CreateSerieInput, UpdateGradeInput, UpdateSerieInput } from '@/schemas/catalog'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CatalogListSkeleton, CatalogStatsSkeleton } from '@/components/catalogs/catalog-skeleton'
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
import { parseServerFnError } from '@/utils/error-handlers'
import { GradesSection } from './grades/grades-section'
import { GradesStats } from './grades/grades-stats'
import { SeriesSection } from './grades/series-section'

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

  const [newGradeTrackId, setNewGradeTrackId] = useState<string>('')
  const [editGradeTrackId, setEditGradeTrackId] = useState<string>('')
  const [newSerieTrackId, setNewSerieTrackId] = useState<string>('')
  const [editSerieTrackId, setEditSerieTrackId] = useState<string>('')

  const [deletingGrade, setDeletingGrade] = useState<{ id: string, name: string } | null>(null)
  const [deletingSerie, setDeletingSerie] = useState<{ id: string, name: string } | null>(null)

  const { data: tracks, isPending: tracksPending } = useQuery(tracksQueryOptions())
  const { data: grades, isPending: gradesPending } = useQuery(gradesQueryOptions())
  const { data: series, isPending: seriesPending } = useQuery(seriesQueryOptions())

  const createGradeMutation = useMutation({
    ...createGradeMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] })
      setNewGradeTrackId('')
      setIsCreatingGrade(false)
      toast.success('Niveau créée avec succès')
      logger.info('Grade created successfully')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la création du niveau')
      toast.error(message)
      logger.error('Failed to create grade', error)
    },
  })

  const updateGradeMutation = useMutation({
    ...updateGradeMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] })
      setEditGradeTrackId('')
      setEditingGrade(null)
      toast.success('Niveau mise à jour avec succès')
      logger.info('Grade updated successfully')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la mise à jour du niveau')
      toast.error(message)
      logger.error('Failed to update grade', error)
    },
  })

  const deleteGradeMutation = useMutation({
    ...deleteGradeMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] })
      setDeletingGrade(null)
      toast.success('Niveau supprimée avec succès')
      logger.info('Grade deleted successfully')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la suppression du niveau')
      toast.error(message)
      logger.error('Failed to delete grade', error)
    },
  })

  const bulkUpdateGradesOrderMutation = useMutation({
    ...bulkUpdateGradesOrderMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] })
      toast.success('Ordre des niveaux mis à jour')
      logger.info('Grades reordered successfully')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la réorganisation des niveaux')
      toast.error(message)
      logger.error('Failed to reorder grades', error)
    },
  })

  const createSerieMutation = useMutation({
    ...createSerieMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] })
      setNewSerieTrackId('')
      setIsCreatingSerie(false)
      toast.success('Série créée avec succès')
      logger.info('Serie created successfully')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la création de la série')
      toast.error(message)
      logger.error('Failed to create serie', error)
    },
  })

  const bulkCreateSeriesMutation = useMutation({
    ...bulkCreateSeriesMutationOptions,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['series'] })
      toast.success(`${data.length} séries importées avec succès`)
      logger.info('Series imported successfully')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de l\'import des séries')
      toast.error(message)
      logger.error('Failed to import series', error)
    },
  })

  const updateSerieMutation = useMutation({
    ...updateSerieMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] })
      setEditSerieTrackId('')
      setEditingSerie(null)
      toast.success('Série mise à jour avec succès')
      logger.info('Serie updated successfully')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la mise à jour de la série')
      toast.error(message)
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
      const message = parseServerFnError(error, 'Erreur lors de la suppression de la série')
      toast.error(message)
      logger.error('Failed to delete serie', error)
    },
  })

  useEffect(() => {
    logger.info('Grades management page viewed', {
      page: 'grades-management',
      timestamp: new Date().toISOString(),
    })
  }, [logger])

  const handleCreateGrade = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: CreateGradeInput = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      order: Number.parseInt(formData.get('order') as string),
      trackId: newGradeTrackId,
    }
    createGradeMutation.mutate(data)
  }

  const handleUpdateGrade = (e: React.FormEvent<HTMLFormElement>, gradeId: string) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: UpdateGradeInput = {
      id: gradeId,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      order: Number.parseInt(formData.get('order') as string),
      trackId: editGradeTrackId,
    }
    updateGradeMutation.mutate(data)
  }

  const handleCreateSerie = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: CreateSerieInput = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      trackId: newSerieTrackId,
    }
    createSerieMutation.mutate(data)
  }

  const handleUpdateSerie = (e: React.FormEvent<HTMLFormElement>, serieId: string) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: UpdateSerieInput = {
      id: serieId,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      trackId: editSerieTrackId,
    }
    updateSerieMutation.mutate(data)
  }

  const handleReorderGrades = async (reorderedGrades: Grade[]) => {
    const updates = reorderedGrades.map(grade => ({
      id: grade.id,
      order: grade.order,
    }))
    bulkUpdateGradesOrderMutation.mutate(updates)
  }

  const handleExportGrades = async () => {
    if (grades && grades.length > 0) {
      await exportGradesToExcel(grades)
      logger.info('Grades exported to Excel')
    }
  }

  const handleExportSeries = async () => {
    if (series && series.length > 0) {
      await exportSeriesToExcel(series)
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
        bulkCreateSeriesMutation.mutate({ series: seriesToCreate })
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

  if (tracksPending || gradesPending || seriesPending) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="bg-muted h-8 w-64 animate-pulse rounded-sm" />
          <div className="bg-muted h-4 w-96 animate-pulse rounded-sm" />
        </div>
        <CatalogStatsSkeleton />
        <CatalogListSkeleton count={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Niveaux et Séries</h1>
          <p className="text-muted-foreground">
            Gérer les niveaux d'étude (6ème à Terminale) et les séries académiques (A, C, D, etc.)
          </p>
        </div>
      </div>

      <GradesStats
        gradesCount={grades?.length || 0}
        seriesCount={series?.length || 0}
        tracksCount={tracks?.length || 0}
      />

      <GradesSection
        isCreating={isCreatingGrade}
        setIsCreating={setIsCreatingGrade}
        editingId={editingGrade}
        setEditingId={setEditingGrade}
        newTrackId={newGradeTrackId}
        setNewTrackId={setNewGradeTrackId}
        editTrackId={editGradeTrackId}
        setEditTrackId={setEditGradeTrackId}
        tracks={tracks}
        grades={grades}
        groupedGrades={groupedGrades}
        onCreate={handleCreateGrade}
        onUpdate={handleUpdateGrade}
        onDelete={setDeletingGrade}
        onExport={handleExportGrades}
        onReorder={handleReorderGrades}
        isPending={{
          create: createGradeMutation.isPending,
          update: updateGradeMutation.isPending,
          delete: deleteGradeMutation.isPending,
        }}
      />

      <SeriesSection
        isCreating={isCreatingSerie}
        setIsCreating={setIsCreatingSerie}
        editingId={editingSerie}
        setEditingId={setEditingSerie}
        newTrackId={newSerieTrackId}
        setNewTrackId={setNewSerieTrackId}
        editTrackId={editSerieTrackId}
        setEditTrackId={setEditSerieTrackId}
        tracks={tracks}
        series={series}
        groupedSeries={groupedSeries}
        onCreate={handleCreateSerie}
        onUpdate={handleUpdateSerie}
        onDelete={setDeletingSerie}
        onExport={handleExportSeries}
        onImport={handleImportSeries}
        isPending={{
          create: createSerieMutation.isPending,
          update: updateSerieMutation.isPending,
          delete: deleteSerieMutation.isPending,
        }}
      />

      <DeleteConfirmationDialog
        open={!!deletingGrade}
        onOpenChange={open => !open && setDeletingGrade(null)}
        title="Supprimer le niveau"
        description={`Êtes-vous sûr de vouloir supprimer le niveau "${deletingGrade?.name}" ? Cette action est irréversible.`}
        confirmText={deletingGrade?.name}
        onConfirm={() => {
          if (deletingGrade)
            deleteGradeMutation.mutate({ id: deletingGrade.id })
        }}
        isPending={deleteGradeMutation.isPending}
      />

      <DeleteConfirmationDialog
        open={!!deletingSerie}
        onOpenChange={open => !open && setDeletingSerie(null)}
        title="Supprimer la série"
        description={`Êtes-vous sûr de vouloir supprimer la série "${deletingSerie?.name}" ? Cette action est irréversible.`}
        confirmText={deletingSerie?.name}
        onConfirm={() => {
          if (deletingSerie)
            deleteSerieMutation.mutate({ id: deletingSerie.id })
        }}
        isPending={deleteSerieMutation.isPending}
      />
    </div>
  )
}
