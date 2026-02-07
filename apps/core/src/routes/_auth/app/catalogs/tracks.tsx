import type { FormEvent } from 'react'
import type { CreateTrackInput, UpdateTrackInput } from '@/schemas/catalog'
import {
  IconAward,
  IconDeviceFloppy,
  IconEdit,
  IconPlus,
  IconSchool,
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
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  createTrackMutationOptions,
  deleteTrackMutationOptions,
  educationLevelsQueryOptions,
  tracksQueryOptions,
  updateTrackMutationOptions,
} from '@/integrations/tanstack-query/catalogs-options'
import { useLogger } from '@/lib/logger'
import { parseServerFnError } from '@/utils/error-handlers'

export const Route = createFileRoute('/_auth/app/catalogs/tracks')({
  component: TracksManagement,
})

function TracksManagement() {
  const { logger } = useLogger()
  const queryClient = useQueryClient()

  const [isCreating, setIsCreating] = useState(false)
  const [editingTrack, setEditingTrack] = useState<string | null>(null)
  const [deletingTrack, setDeletingTrack] = useState<{ id: string, name: string } | null>(null)
  const [newTrackLevelId, setNewTrackLevelId] = useState<string>('')
  const [editTrackLevelId, setEditTrackLevelId] = useState<string>('')

  const { data: educationLevels, isPending: levelsPending } = useQuery(educationLevelsQueryOptions())
  const { data: tracks, isPending: tracksPending } = useQuery(tracksQueryOptions())

  const createMutation = useMutation({
    ...createTrackMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
      setNewTrackLevelId('')
      setIsCreating(false)
      toast.success('Filière créée avec succès')
      logger.info('Track created successfully')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la création de la filière')
      toast.error(message)
      logger.error('Failed to create track', error)
    },
  })

  const updateMutation = useMutation({
    ...updateTrackMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
      setEditingTrack(null)
      toast.success('Filière mise à jour avec succès')
      logger.info('Track updated successfully')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la mise à jour de la filière')
      toast.error(message)
      logger.error('Failed to update track', error)
    },
  })

  const deleteMutation = useMutation({
    ...deleteTrackMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
      setDeletingTrack(null)
      toast.success('Filière supprimée avec succès')
      logger.info('Track deleted successfully')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la suppression de la filière')
      toast.error(message)
      logger.error('Failed to delete track', error)
    },
  })

  useEffect(() => {
    logger.info('Tracks management page viewed', {
      page: 'tracks-management',
      timestamp: new Date().toISOString(),
    })
  }, [logger])

  const handleCreate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: CreateTrackInput = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      educationLevelId: Number.parseInt(newTrackLevelId),
    }
    createMutation.mutate(data)
  }

  const handleUpdate = (e: FormEvent<HTMLFormElement>, trackId: string) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: UpdateTrackInput = {
      id: trackId,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      educationLevelId: Number.parseInt(editTrackLevelId),
    }
    updateMutation.mutate(data)
  }

  const handleDelete = () => {
    if (deletingTrack) {
      deleteMutation.mutate({ id: deletingTrack.id })
    }
  }

  const groupedTracks = useMemo(() => {
    if (!tracks || !educationLevels)
      return []

    return educationLevels.map(level => ({
      level,
      tracks: tracks.filter(t => t.educationLevelId === level.id),
    }))
  }, [tracks, educationLevels])

  if (levelsPending || tracksPending) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Filières</h1>
          <p className="text-muted-foreground">
            Gérer les filières éducatives (Enseignement Général, Technique, etc.)
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreating(true)}>
          <IconPlus className="h-4 w-4" />
          Ajouter une Filière
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Créer une Nouvelle Filière</CardTitle>
            <CardDescription>Ajouter une nouvelle filière éducative</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enseignement Général"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    name="code"
                    placeholder="GENERAL"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Select
                  value={newTrackLevelId}
                  onValueChange={val => val && setNewTrackLevelId(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un niveau">
                      {educationLevels?.find(l => String(l.id) === newTrackLevelId)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels?.map(level => (
                      <SelectItem key={level.id} value={String(level.id)}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      {/* Tracks by Education Level */}
      {groupedTracks.map(({ level, tracks: levelTracks }) => (
        <Card key={level.id}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <IconSchool className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{level.name}</CardTitle>
                <CardDescription>
                  {levelTracks.length}
                  {' '}
                  filière(s)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {levelTracks.length === 0
                ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune filière pour ce niveau
                    </p>
                  )
                : (
                    levelTracks.map(track => (
                      <div key={track.id}>
                        {editingTrack === track.id
                          ? (
                              <form
                                onSubmit={e => handleUpdate(e, track.id)}
                                className="border rounded-lg p-4 space-y-4"
                              >
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label htmlFor={`edit-name-${track.id}`}>Nom *</Label>
                                    <Input
                                      id={`edit-name-${track.id}`}
                                      name="name"
                                      defaultValue={track.name}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`edit-code-${track.id}`}>Code *</Label>
                                    <Input
                                      id={`edit-code-${track.id}`}
                                      name="code"
                                      defaultValue={track.code}
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Select
                                    value={editTrackLevelId}
                                    onValueChange={val => val && setEditTrackLevelId(val)}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Sélectionner un niveau">
                                        {educationLevels?.find(l => String(l.id) === editTrackLevelId)?.name}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {educationLevels?.map(level => (
                                        <SelectItem key={level.id} value={String(level.id)}>
                                          {level.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingTrack(null)}
                                  >
                                    <IconX className="h-4 w-4 mr-2" />
                                    Annuler
                                  </Button>
                                  <Button type="submit" disabled={updateMutation.isPending}>
                                    <IconDeviceFloppy className="h-4 w-4 mr-2" />
                                    {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                                  </Button>
                                </div>
                              </form>
                            )
                          : (
                              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <IconAward className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">{track.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {track.code}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        Créé le
                                        {' '}
                                        {new Date(track.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingTrack(track.id)
                                      setEditTrackLevelId(String(track.educationLevelId))
                                    }}
                                  >
                                    <IconEdit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeletingTrack({ id: track.id, name: track.name })}
                                    disabled={deleteMutation.isPending}
                                  >
                                    <IconTrash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                      </div>
                    ))
                  )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deletingTrack}
        onOpenChange={open => !open && setDeletingTrack(null)}
        title="Supprimer la filière"
        description={`Êtes-vous sûr de vouloir supprimer la filière "${deletingTrack?.name}" ? Cette action est irréversible.`}
        confirmText={deletingTrack?.name}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
