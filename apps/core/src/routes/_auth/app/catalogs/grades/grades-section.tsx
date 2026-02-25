import type { Grade, Track } from '@repo/data-ops'
import { IconDeviceFloppy, IconDownload, IconEdit, IconPlus, IconSchool, IconTrash, IconX } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { DraggableGradeList } from '@/components/catalogs/draggable-grade-list'

interface GradesSectionProps {
  isCreating: boolean
  setIsCreating: (val: boolean) => void
  editingId: string | null
  setEditingId: (id: string | null) => void
  newTrackId: string
  setNewTrackId: (id: string) => void
  editTrackId: string
  setEditTrackId: (id: string) => void
  tracks: Track[] | undefined
  grades: Grade[] | undefined
  groupedGrades: { track: Track, grades: Grade[] }[]
  onCreate: (e: React.FormEvent<HTMLFormElement>) => void
  onUpdate: (e: React.FormEvent<HTMLFormElement>, id: string) => void
  onDelete: (grade: { id: string, name: string }) => void
  onExport: () => void
  onReorder: (reordered: Grade[]) => void
  isPending: {
    create: boolean
    update: boolean
    delete: boolean
  }
}

export function GradesSection({
  isCreating,
  setIsCreating,
  editingId,
  setEditingId,
  newTrackId,
  setNewTrackId,
  editTrackId,
  setEditTrackId,
  tracks,
  grades,
  groupedGrades,
  onCreate,
  onUpdate,
  onDelete,
  onExport,
  onReorder,
  isPending,
}: GradesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Niveau</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onExport} disabled={!grades || grades.length === 0}>
            <IconDownload className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button className="gap-2" onClick={() => setIsCreating(true)}>
            <IconPlus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Créer un Nouveau Niveau</CardTitle>
            <CardDescription>Ajouter un nouveau niveau d'étude</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onCreate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="grade-name">Nom *</Label>
                  <Input id="grade-name" name="name" placeholder="6ème" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade-code">Code *</Label>
                  <Input id="grade-code" name="code" placeholder="6EME" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade-order">Ordre *</Label>
                  <Input id="grade-order" name="order" type="number" placeholder="1" required />
                </div>
              </div>
              <div className="space-y-2">
                <Select value={newTrackId} onValueChange={val => val && setNewTrackId(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une filière">
                      {tracks?.find(t => t.id === newTrackId)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {tracks?.map(track => (
                      <SelectItem key={track.id} value={track.id}>
                        {track.name}
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
                <Button type="submit" disabled={isPending.create}>
                  <IconDeviceFloppy className="h-4 w-4 mr-2" />
                  {isPending.create ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {groupedGrades.map(({ track, grades: trackGrades }) => (
        <Card key={track.id}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <IconSchool className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{track.name}</CardTitle>
                <CardDescription>
                  {trackGrades.length}
                  {' '}
                  niveau(x) - Glissez pour réorganiser
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {trackGrades.length === 0
              ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucune niveau pour cette filière</p>
                )
              : editingId && trackGrades.some(g => g.id === editingId)
                ? (
                    <div className="space-y-4">
                      {trackGrades.map(grade => (
                        <div key={grade.id}>
                          {editingId === grade.id
                            ? (
                                <form onSubmit={e => onUpdate(e, grade.id)} className="border rounded-lg p-4 space-y-4">
                                  <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                      <Label htmlFor={`edit-grade-name-${grade.id}`}>Nom *</Label>
                                      <Input id={`edit-grade-name-${grade.id}`} name="name" defaultValue={grade.name} required />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor={`edit-grade-code-${grade.id}`}>Code *</Label>
                                      <Input id={`edit-grade-code-${grade.id}`} name="code" defaultValue={grade.code} required />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor={`edit-grade-order-${grade.id}`}>Ordre *</Label>
                                      <Input id={`edit-grade-order-${grade.id}`} name="order" type="number" defaultValue={grade.order} required />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Select value={editTrackId} onValueChange={val => val && setEditTrackId(val)}>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sélectionner une filière">
                                          {tracks?.find(t => t.id === editTrackId)?.name}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {tracks?.map(track => (
                                          <SelectItem key={track.id} value={track.id}>
                                            {track.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex nd gap-2">
                                    <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                                      <IconX className="h-4 w-4 mr-2" />
                                      Annuler
                                    </Button>
                                    <Button type="submit" disabled={isPending.update}>
                                      <IconDeviceFloppy className="h-4 w-4 mr-2" />
                                      {isPending.update ? 'Enregistrement...' : 'Enregistrer'}
                                    </Button>
                                  </div>
                                </form>
                              )
                            : (
                                <div className="flex items-center justify-between border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                                  <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                      <IconSchool className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold">{grade.name}</h3>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs">{grade.code}</Badge>
                                        <Badge variant="secondary" className="text-xs">
                                          Ordre:
                                          {grade.order}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setEditingId(grade.id)
                                        setEditTrackId(grade.trackId)
                                      }}
                                    >
                                      <IconEdit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => onDelete({ id: grade.id, name: grade.name })}>
                                      <IconTrash className="h-4 w-4" />
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
                      onReorder={onReorder}
                      onEdit={(id) => {
                        setEditingId(id)
                        const grade = trackGrades.find(g => g.id === id)
                        if (grade)
                          setEditTrackId(grade.trackId)
                      }}
                      onDelete={onDelete}
                    />
                  )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
