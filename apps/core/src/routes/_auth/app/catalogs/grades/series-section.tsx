import type { Serie, Track } from '@repo/data-ops'
import { IconAward, IconDeviceFloppy, IconDownload, IconEdit, IconPlus, IconTrash, IconUpload, IconX } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { AnimatePresence, domMax, LazyMotion, m } from 'motion/react'

interface SeriesSectionProps {
  isCreating: boolean
  setIsCreating: (val: boolean) => void
  editingId: string | null
  setEditingId: (id: string | null) => void
  newTrackId: string
  setNewTrackId: (id: string) => void
  editTrackId: string
  setEditTrackId: (id: string) => void
  tracks: Track[] | undefined
  series: Serie[] | undefined
  groupedSeries: { track: Track, series: Serie[] }[]
  onCreate: (e: React.FormEvent<HTMLFormElement>) => void
  onUpdate: (e: React.FormEvent<HTMLFormElement>, id: string) => void
  onDelete: (serie: { id: string, name: string }) => void
  onExport: () => void
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void
  isPending: {
    create: boolean
    update: boolean
    delete: boolean
  }
}

export function SeriesSection({
  isCreating,
  setIsCreating,
  editingId,
  setEditingId,
  newTrackId,
  setNewTrackId,
  editTrackId,
  setEditTrackId,
  tracks,
  series,
  groupedSeries,
  onCreate,
  onUpdate,
  onDelete,
  onExport,
  onImport,
  isPending,
}: SeriesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Séries</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onExport} disabled={!series || series.length === 0}>
            <IconDownload className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={onImport}
            />
            <Button variant="outline" size="sm">
              <IconUpload className="h-4 w-4 mr-2" />
              Importer
            </Button>
          </div>
          <Button className="gap-2" onClick={() => setIsCreating(true)}>
            <IconPlus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Créer une Nouvelle Série</CardTitle>
            <CardDescription>Ajouter une nouvelle série académique</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onCreate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="serie-name">Nom *</Label>
                  <Input id="serie-name" name="name" placeholder="Série C" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serie-code">Code *</Label>
                  <Input id="serie-code" name="code" placeholder="C" required />
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

      {groupedSeries.map(({ track, series: trackSeries }) => (
        <Card key={track.id}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <IconAward className="h-5 w-5 text-secondary" />
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
              <LazyMotion features={domMax}>
                <AnimatePresence mode="popLayout">
                  {trackSeries.length === 0
                    ? (
                        <m.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-sm text-muted-foreground text-center py-4"
                        >
                          Aucune série pour cette filière
                        </m.p>
                      )
                    : (
                        trackSeries.map(serie => (
                          <m.div
                            key={serie.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            {editingId === serie.id
                              ? (
                                  <form onSubmit={e => onUpdate(e, serie.id)} className="border rounded-lg p-4 space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div className="space-y-2">
                                        <Label htmlFor={`edit-serie-name-${serie.id}`}>Nom *</Label>
                                        <Input id={`edit-serie-name-${serie.id}`} name="name" defaultValue={serie.name} required />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor={`edit-serie-code-${serie.id}`}>Code *</Label>
                                        <Input id={`edit-serie-code-${serie.id}`} name="code" defaultValue={serie.code} required />
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
                                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                                        <IconAward className="h-5 w-5 text-secondary" />
                                      </div>
                                      <div>
                                        <h3 className="font-semibold">{serie.name}</h3>
                                        <Badge variant="outline" className="text-xs mt-1">{serie.code}</Badge>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setEditingId(serie.id)
                                          setEditTrackId(serie.trackId)
                                        }}
                                      >
                                        <IconEdit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" onClick={() => onDelete({ id: serie.id, name: serie.name })}>
                                        <IconTrash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                          </m.div>
                        ))
                      )}
                </AnimatePresence>
              </LazyMotion>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
