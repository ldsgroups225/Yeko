import type { FormEvent } from 'react'
import type { CreateProgramTemplateChapterInput, UpdateProgramTemplateChapterInput } from '@/schemas/programs'
import {
  IconArrowLeft,
  IconBook,
  IconCalendar,
  IconClock,
  IconDeviceFloppy,
  IconEdit,
  IconFileText,
  IconHistory,
  IconPlus,
  IconTrash,
  IconUpload,
  IconX,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Textarea } from '@workspace/ui/components/textarea'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  bulkCreateChaptersMutationOptions,
  createProgramTemplateChapterMutationOptions,
  deleteProgramTemplateChapterMutationOptions,
  getProgramVersionsQueryOptions,
  programTemplateByIdQueryOptions,
  programTemplateChaptersQueryOptions,
  publishProgramMutationOptions,
  restoreProgramVersionMutationOptions,
  updateProgramTemplateChapterMutationOptions,
  updateProgramTemplateMutationOptions,
} from '@/integrations/tanstack-query/programs-options'
import { useLogger } from '@/lib/logger'
import { parseServerFnError } from '@/utils/error-handlers'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/app/catalogs/programs/$programId')({
  component: ProgramDetails,
})

function ProgramDetails() {
  const { programId } = Route.useParams()
  const { logger } = useLogger()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [isCreatingChapter, setIsCreatingChapter] = useState(false)
  const [editingChapter, setEditingChapter] = useState<string | null>(null)
  const [deletingChapter, setDeletingChapter] = useState<{ id: string, title: string } | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importContent, setImportContent] = useState('')

  const { data: program, isLoading: programLoading } = useQuery(programTemplateByIdQueryOptions(programId))
  const { data: chapters, isLoading: chaptersLoading } = useQuery(programTemplateChaptersQueryOptions(programId))
  const { data: versions = [] } = useQuery(getProgramVersionsQueryOptions(programId))

  const updateProgramMutation = useMutation({
    ...updateProgramTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-template', programId] })
      queryClient.invalidateQueries({ queryKey: ['program-templates'] })
      toast.success('Programme mis à jour')
    },
  })

  const publishMutation = useMutation({
    ...publishProgramMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-template', programId] })
      queryClient.invalidateQueries({ queryKey: ['program-versions', programId] })
      toast.success('Programme publié avec succès')
    },
  })

  const restoreMutation = useMutation({
    ...restoreProgramVersionMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-template', programId] })
      queryClient.invalidateQueries({ queryKey: ['program-template-chapters', programId] })
      queryClient.invalidateQueries({ queryKey: ['program-versions', programId] })
      setShowHistory(false)
      toast.success('Version restaurée avec succès')
    },
  })

  const bulkImportMutation = useMutation({
    ...bulkCreateChaptersMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-template-chapters', programId] })
      queryClient.invalidateQueries({ queryKey: ['program-stats'] })
      setShowImport(false)
      setImportContent('')
      toast.success('Chapitres importés avec succès')
    },
  })

  const createChapterMutation = useMutation({
    ...createProgramTemplateChapterMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-template-chapters', programId] })
      queryClient.invalidateQueries({ queryKey: ['program-stats'] })
      setIsCreatingChapter(false)
      toast.success('Chapitre créé avec succès')
      logger.info('Program chapter created')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la création du chapitre')
      toast.error(message)
      logger.error('Failed to create chapter', error)
    },
  })

  const updateChapterMutation = useMutation({
    ...updateProgramTemplateChapterMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-template-chapters', programId] })
      setEditingChapter(null)
      toast.success('Chapitre mis à jour avec succès')
      logger.info('Program chapter updated')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la mise à jour du chapitre')
      toast.error(message)
      logger.error('Failed to update chapter', error)
    },
  })

  const deleteChapterMutation = useMutation({
    ...deleteProgramTemplateChapterMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-template-chapters', programId] })
      queryClient.invalidateQueries({ queryKey: ['program-stats'] })
      setDeletingChapter(null)
      toast.success('Chapitre supprimé avec succès')
      logger.info('Program chapter deleted')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la suppression du chapitre')
      toast.error(message)
      logger.error('Failed to delete chapter', error)
    },
  })

  useEffect(() => {
    logger.info('Program details page viewed', {
      page: 'program-details',
      programId,
      timestamp: new Date().toISOString(),
    })
  }, [logger, programId])

  const handleCreateChapter = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: CreateProgramTemplateChapterInput = {
      title: formData.get('title') as string,
      objectives: formData.get('objectives') as string || undefined,
      order: Number.parseInt(formData.get('order') as string),
      durationHours: formData.get('durationHours') ? Number.parseInt(formData.get('durationHours') as string) : undefined,
      programTemplateId: programId,
    }
    createChapterMutation.mutate(data)
  }

  const handleUpdateChapter = (e: FormEvent<HTMLFormElement>, chapterId: string) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: UpdateProgramTemplateChapterInput = {
      id: chapterId,
      title: formData.get('title') as string,
      objectives: formData.get('objectives') as string || undefined,
      order: Number.parseInt(formData.get('order') as string),
      durationHours: formData.get('durationHours') ? Number.parseInt(formData.get('durationHours') as string) : undefined,
      programTemplateId: programId,
    }
    updateChapterMutation.mutate(data)
  }

  const handleDeleteChapter = () => {
    if (deletingChapter) {
      deleteChapterMutation.mutate({ id: deletingChapter.id })
    }
  }

  const handleStatusChange = (newStatus: 'draft' | 'published' | 'archived') => {
    if (newStatus === 'published') {
      publishMutation.mutate({ id: programId })
    }
    else {
      updateProgramMutation.mutate({ id: programId, status: newStatus })
    }
  }

  const handleImport = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Simple CSV parsing: Title, Objectives, Duration
    const lines = importContent.split('\n').filter(line => line.trim())
    const newChapters = lines.map((line, index) => {
      const [title, objectives, duration] = line.split(',').map(s => s.trim())
      return {
        title: title || `Chapitre ${index + 1}`,
        objectives: objectives || undefined,
        durationHours: duration ? Number.parseInt(duration) : undefined,
        order: (chapters?.length || 0) + index + 1,
      }
    })

    bulkImportMutation.mutate({
      programTemplateId: programId,
      chapters: newChapters,
    })
  }

  const totalDuration = chapters?.reduce((sum: any, ch: any) => sum + (ch.durationHours || 0), 0) || 0

  if (programLoading || chaptersLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-96" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map(() => (
            <Card key={generateUUID()}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <IconBook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">Programme non trouvé</h3>
        <p className="text-muted-foreground mb-4">Le programme demandé n'existe pas.</p>
        <Button onClick={() => navigate({ to: '/app/catalogs/programs' })}>
          Retour aux programmes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/app/catalogs/programs' })}
        >
          <IconArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{program.name}</h1>
            <Select
              value={program.status}
              onValueChange={val => handleStatusChange(val as 'draft' | 'published' | 'archived')}
              disabled={publishMutation.isPending || updateProgramMutation.isPending}
            >
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="published">Publié</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <span>{program.subject?.name}</span>
            <span>•</span>
            <span>{program.grade?.name}</span>
            <span>•</span>
            <span>{program.schoolYearTemplate?.name}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowHistory(true)}>
            <IconHistory className="h-4 w-4 mr-2" />
            Historique
          </Button>
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <IconUpload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <Button onClick={() => setIsCreatingChapter(true)}>
            <IconPlus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chapitres</CardTitle>
            <IconFileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chapters?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total chapitres</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durée Totale</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDuration}
              h
            </div>
            <p className="text-xs text-muted-foreground">Heures de cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Année Scolaire</CardTitle>
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{program.schoolYearTemplate?.name}</div>
            <p className="text-xs text-muted-foreground">
              {program.schoolYearTemplate?.isActive ? 'Active' : 'Inactive'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create Chapter Form */}
      {isCreatingChapter && (
        <Card>
          <CardHeader>
            <CardTitle>Créer un Nouveau Chapitre</CardTitle>
            <CardDescription>Ajouter un chapitre au programme</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateChapter} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chapter-title">Titre *</Label>
                <Input
                  id="chapter-title"
                  name="title"
                  placeholder="Chapitre 1: Introduction aux fonctions"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapter-objectives">Objectifs</Label>
                <Textarea
                  id="chapter-objectives"
                  name="objectives"
                  placeholder="Décrire les objectifs pédagogiques de ce chapitre..."
                  rows={4}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="chapter-order">Ordre *</Label>
                  <Input
                    id="chapter-order"
                    name="order"
                    type="number"
                    min="1"
                    defaultValue={(chapters?.length || 0) + 1}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chapter-duration">Durée (heures)</Label>
                  <Input
                    id="chapter-duration"
                    name="durationHours"
                    type="number"
                    min="0"
                    placeholder="8"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreatingChapter(false)}>
                  <IconX className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button type="submit" disabled={createChapterMutation.isPending}>
                  <IconDeviceFloppy className="h-4 w-4 mr-2" />
                  {createChapterMutation.isPending ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Chapters List */}
      <Card>
        <CardHeader>
          <CardTitle>Chapitres du Programme</CardTitle>
          <CardDescription>
            Glissez pour réorganiser les chapitres
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!chapters || chapters.length === 0
            ? (
                <div className="text-center py-8">
                  <IconFileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Aucun chapitre</h3>
                  <p className="text-muted-foreground mb-4">
                    Commencez par ajouter le premier chapitre de ce programme.
                  </p>
                  <Button onClick={() => setIsCreatingChapter(true)}>
                    <IconPlus className="h-4 w-4 mr-2" />
                    Ajouter un Chapitre
                  </Button>
                </div>
              )
            : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {chapters.map((chapter: any) => (
                      <motion.div
                        key={chapter.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        {editingChapter === chapter.id
                          ? (
                              <form
                                onSubmit={e => handleUpdateChapter(e, chapter.id)}
                                className="border rounded-lg p-4 space-y-4"
                              >
                                <div className="space-y-2">
                                  <Label htmlFor={`edit-title-${chapter.id}`}>Titre *</Label>
                                  <Input
                                    id={`edit-title-${chapter.id}`}
                                    name="title"
                                    defaultValue={chapter.title}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`edit-objectives-${chapter.id}`}>Objectifs</Label>
                                  <Textarea
                                    id={`edit-objectives-${chapter.id}`}
                                    name="objectives"
                                    defaultValue={chapter.objectives || ''}
                                    rows={4}
                                  />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label htmlFor={`edit-order-${chapter.id}`}>Ordre *</Label>
                                    <Input
                                      id={`edit-order-${chapter.id}`}
                                      name="order"
                                      type="number"
                                      min="1"
                                      defaultValue={chapter.order}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`edit-duration-${chapter.id}`}>Durée (heures)</Label>
                                    <Input
                                      id={`edit-duration-${chapter.id}`}
                                      name="durationHours"
                                      type="number"
                                      min="0"
                                      defaultValue={chapter.durationHours || ''}
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingChapter(null)}
                                  >
                                    <IconX className="h-4 w-4 mr-2" />
                                    Annuler
                                  </Button>
                                  <Button type="submit" disabled={updateChapterMutation.isPending}>
                                    <IconDeviceFloppy className="h-4 w-4 mr-2" />
                                    {updateChapterMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                                  </Button>
                                </div>
                              </form>
                            )
                          : (
                              <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                <div className="flex items-start gap-4 flex-1">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                                    <span className="text-sm font-semibold text-primary">{chapter.order}</span>
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold">{chapter.title}</h3>
                                    {chapter.objectives && (
                                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                        {chapter.objectives}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                      {chapter.durationHours && (
                                        <Badge variant="outline" className="text-xs">
                                          <IconClock className="h-3 w-3 mr-1" />
                                          {chapter.durationHours}
                                          h
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingChapter(chapter.id)}
                                  >
                                    <IconEdit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeletingChapter({ id: chapter.id, title: chapter.title })}
                                  >
                                    <IconTrash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
        </CardContent>
      </Card>

      {/* History Dialog */}
      {showHistory && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-background border rounded-lg shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Historique des Versions</CardTitle>
                <CardDescription>Voir et restaurer les versions précédentes</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)}>
                <IconX className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {!versions || (versions as any[]).length === 0
                ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune version disponible. Publiez le programme pour créer une version.
                    </div>
                  )
                : (
                    <div className="space-y-4">
                      {(versions as any[]).map((version: any) => (
                        <div key={version.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-semibold">
                              Version
                              {version.versionNumber}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(version.createdAt).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {((version.snapshotData as any).chapters?.length as number) || 0}
                              {' '}
                              chapitres
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => restoreMutation.mutate({ versionId: version.id })}
                            disabled={restoreMutation.isPending}
                          >
                            Restaurer
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
            </CardContent>
          </div>
        </Card>
      )}

      {/* Import Dialog */}
      {showImport && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-background border rounded-lg shadow-lg">
            <CardHeader>
              <CardTitle>Importer des Chapitres</CardTitle>
              <CardDescription>Collez le contenu CSV (Titre, Objectifs, Durée)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleImport} className="space-y-4">
                <Textarea
                  value={importContent}
                  onChange={e => setImportContent(e.target.value)}
                  placeholder="Introduction, Objectifs du chapitre, 4&#10;Fonctions affines, Étude des fonctions, 6"
                  rows={10}
                  className="font-mono text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowImport(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={!importContent || bulkImportMutation.isPending}>
                    {bulkImportMutation.isPending ? 'Importation...' : 'Importer'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deletingChapter}
        onOpenChange={open => !open && setDeletingChapter(null)}
        title="Supprimer le chapitre"
        description={`Êtes-vous sûr de vouloir supprimer le chapitre "${deletingChapter?.title}" ? Cette action est irréversible.`}
        confirmText={deletingChapter?.title}
        onConfirm={handleDeleteChapter}
        isLoading={deleteChapterMutation.isPending}
      />
    </div>
  )
}
