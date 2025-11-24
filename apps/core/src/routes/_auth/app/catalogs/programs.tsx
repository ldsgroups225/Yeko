import type { FormEvent } from 'react'
import type {
  CreateProgramTemplateInput,
  CreateSchoolYearTemplateInput,
} from '@/schemas/programs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Copy,
  Database,
  FileText,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CatalogListSkeleton, CatalogStatsSkeleton } from '@/components/catalogs/catalog-skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { gradesQueryOptions, subjectsQueryOptions } from '@/integrations/tanstack-query/catalogs-options'
import {
  cloneProgramTemplateMutationOptions,
  createProgramTemplateMutationOptions,
  createSchoolYearTemplateMutationOptions,
  deleteProgramTemplateMutationOptions,
  programStatsQueryOptions,
  programTemplatesQueryOptions,
  schoolYearTemplatesQueryOptions,
} from '@/integrations/tanstack-query/programs-options'
import { useLogger } from '@/lib/logger'

export const Route = createFileRoute('/_auth/app/catalogs/programs')({
  component: ProgramsCatalog,
})

function ProgramsCatalog() {
  const { logger } = useLogger()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [isCreatingYear, setIsCreatingYear] = useState(false)
  const [isCreatingProgram, setIsCreatingProgram] = useState(false)
  const [deletingProgram, setDeletingProgram] = useState<{ id: string, name: string } | null>(null)
  const [cloningProgram, setCloningProgram] = useState<{ id: string, name: string } | null>(null)

  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')

  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 500)

  // Fetch data
  const { data: schoolYears, isLoading: yearsLoading } = useQuery(schoolYearTemplatesQueryOptions())
  const { data: subjects } = useQuery(subjectsQueryOptions({ limit: 100 }))
  const { data: grades } = useQuery(gradesQueryOptions())
  const { data: stats, isLoading: statsLoading } = useQuery(programStatsQueryOptions())

  const queryParams = useMemo(() => ({
    schoolYearTemplateId: yearFilter === 'all' ? undefined : yearFilter,
    subjectId: subjectFilter === 'all' ? undefined : subjectFilter,
    gradeId: gradeFilter === 'all' ? undefined : gradeFilter,
    status: statusFilter === 'all' ? undefined : (statusFilter as 'draft' | 'published' | 'archived'),
    search: debouncedSearch || undefined,
    page,
    limit: 20,
  }), [yearFilter, subjectFilter, gradeFilter, statusFilter, debouncedSearch, page])

  const { data: programsData, isLoading: programsLoading } = useQuery(programTemplatesQueryOptions(queryParams))

  // Mutations
  const createYearMutation = useMutation({
    ...createSchoolYearTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-year-templates'] })
      queryClient.invalidateQueries({ queryKey: ['program-stats'] })
      setIsCreatingYear(false)
      toast.success('Année scolaire créée avec succès')
      logger.info('School year template created')
    },
    onError: (error) => {
      toast.error('Erreur lors de la création de l\'année scolaire')
      logger.error('Failed to create school year template', error)
    },
  })

  const createProgramMutation = useMutation({
    ...createProgramTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-templates'] })
      queryClient.invalidateQueries({ queryKey: ['program-stats'] })
      setIsCreatingProgram(false)
      setPage(1)
      toast.success('Programme créé avec succès')
      logger.info('Program template created')
    },
    onError: (error) => {
      toast.error('Erreur lors de la création du programme')
      logger.error('Failed to create program template', error)
    },
  })

  const deleteProgramMutation = useMutation({
    ...deleteProgramTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-templates'] })
      queryClient.invalidateQueries({ queryKey: ['program-stats'] })
      setDeletingProgram(null)
      toast.success('Programme supprimé avec succès')
      logger.info('Program template deleted')
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression du programme')
      logger.error('Failed to delete program template', error)
    },
  })

  const cloneProgramMutation = useMutation({
    ...cloneProgramTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-templates'] })
      queryClient.invalidateQueries({ queryKey: ['program-stats'] })
      setCloningProgram(null)
      toast.success('Programme cloné avec succès')
      logger.info('Program template cloned')
    },
    onError: (error) => {
      toast.error('Erreur lors du clonage du programme')
      logger.error('Failed to clone program template', error)
    },
  })

  useEffect(() => {
    logger.info('Programs catalog page viewed', {
      page: 'programs-catalog',
      timestamp: new Date().toISOString(),
    })
  }, [logger])

  const handleCreateYear = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: CreateSchoolYearTemplateInput = {
      name: formData.get('name') as string,
      isActive: formData.get('isActive') === 'true',
    }
    createYearMutation.mutate(data)
  }

  const handleCreateProgram = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: CreateProgramTemplateInput = {
      name: formData.get('name') as string,
      schoolYearTemplateId: formData.get('schoolYearTemplateId') as string,
      subjectId: formData.get('subjectId') as string,
      gradeId: formData.get('gradeId') as string,
      status: 'draft',
    }
    createProgramMutation.mutate(data)
  }

  const handleDeleteProgram = () => {
    if (deletingProgram) {
      deleteProgramMutation.mutate({ id: deletingProgram.id })
    }
  }

  const handleCloneProgram = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!cloningProgram)
      return

    const formData = new FormData(e.currentTarget)
    cloneProgramMutation.mutate({
      id: cloningProgram.id,
      newSchoolYearTemplateId: formData.get('newSchoolYearTemplateId') as string,
      newName: formData.get('newName') as string,
    })
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Programmes Ministériels</h1>
          <p className="text-muted-foreground">
            Gérer les modèles de programmes et curricula pour différentes matières et classes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCreatingYear(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Nouvelle Année
          </Button>
          <Button onClick={() => setIsCreatingProgram(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer un Programme
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programmes</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.programs || 0}</div>
            <p className="text-xs text-muted-foreground">Modèles actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chapitres</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.chapters || 0}</div>
            <p className="text-xs text-muted-foreground">Total chapitres</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Années Scolaires</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.schoolYears || 0}</div>
            <p className="text-xs text-muted-foreground">Modèles d'années</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Année Active</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeYear?.name || 'Aucune'}</div>
            <p className="text-xs text-muted-foreground">Année en cours</p>
          </CardContent>
        </Card>
      </div>

      {/* Create School Year Form */}
      {isCreatingYear && (
        <Card>
          <CardHeader>
            <CardTitle>Créer une Nouvelle Année Scolaire</CardTitle>
            <CardDescription>Ajouter un modèle d'année scolaire</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateYear} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="year-name">Nom *</Label>
                  <Input
                    id="year-name"
                    name="name"
                    placeholder="2025-2026"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year-isActive">Statut</Label>
                  <Select name="isActive" defaultValue="false">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreatingYear(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button type="submit" disabled={createYearMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {createYearMutation.isPending ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Create Program Form */}
      {isCreatingProgram && (
        <Card>
          <CardHeader>
            <CardTitle>Créer un Nouveau Programme</CardTitle>
            <CardDescription>Ajouter un modèle de programme ministériel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProgram} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="program-name">Nom du Programme *</Label>
                <Input
                  id="program-name"
                  name="name"
                  placeholder="Programme de Mathématiques - Terminale C"
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="program-year">Année Scolaire *</Label>
                  <Select name="schoolYearTemplateId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolYears?.map((year: any) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                          {year.isActive && ' (Active)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program-subject">Matière *</Label>
                  <Select name="subjectId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
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
                  <Label htmlFor="program-grade">Classe *</Label>
                  <Select name="gradeId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
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
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreatingProgram(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button type="submit" disabled={createProgramMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {createProgramMutation.isPending ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher & Filtrer</CardTitle>
          <CardDescription>Trouver des programmes spécifiques</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des programmes..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Année" />
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
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Matière" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les matières</SelectItem>
                {subjects?.subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Classe" />
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="published">Publié</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Programs List */}
      <Card>
        <CardHeader>
          <CardTitle>Programmes</CardTitle>
          <CardDescription>
            {programsData?.pagination.total || 0}
            {' '}
            programme(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {programsLoading && page === 1
            ? (
                <CatalogListSkeleton count={5} />
              )
            : !programsData || programsData.programs.length === 0
                ? (
                    <div className="text-center py-8">
                      <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">Aucun programme trouvé</h3>
                      <p className="text-muted-foreground">
                        {search || yearFilter !== 'all' || subjectFilter !== 'all' || gradeFilter !== 'all'
                          ? 'Essayez de modifier vos filtres de recherche.'
                          : 'Commencez par créer votre premier programme.'}
                      </p>
                    </div>
                  )
                : (
                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {programsData.programs.map((program: any) => (
                          <motion.div
                            key={program.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                            onClick={() => navigate({ to: `/app/catalogs/programs/${program.id}` })}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <BookOpen className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{program.name}</h3>
                                  {program.status === 'published' && (
                                    <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">Publié</Badge>
                                  )}
                                  {program.status === 'draft' && (
                                    <Badge variant="secondary" className="text-xs">Brouillon</Badge>
                                  )}
                                  {program.status === 'archived' && (
                                    <Badge variant="outline" className="text-xs">Archivé</Badge>
                                  )}
                                  {program.schoolYearTemplate?.isActive && (
                                    <Badge variant="default" className="text-xs">Active</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                  <span>{program.subject?.name}</span>
                                  <span>•</span>
                                  <span>{program.grade?.name}</span>
                                  <span>•</span>
                                  <span>{program.schoolYearTemplate?.name}</span>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div
                              className="flex gap-2"
                              onClick={e => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation()
                                  e.preventDefault()
                                }
                              }}
                              role="toolbar"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCloningProgram({ id: program.id, name: program.name })}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingProgram({ id: program.id, name: program.name })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
        </CardContent>
      </Card>

      {/* Clone Dialog */}
      {cloningProgram && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Cloner le Programme</CardTitle>
              <CardDescription>
                Dupliquer "
                {cloningProgram.name}
                " vers une nouvelle année
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCloneProgram} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clone-year">Année Scolaire Cible *</Label>
                  <Select name="newSchoolYearTemplateId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolYears?.map((year: any) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clone-name">Nouveau Nom *</Label>
                  <Input
                    id="clone-name"
                    name="newName"
                    defaultValue={cloningProgram.name}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCloningProgram(null)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={cloneProgramMutation.isPending}>
                    {cloneProgramMutation.isPending ? 'Clonage...' : 'Cloner'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deletingProgram}
        onOpenChange={open => !open && setDeletingProgram(null)}
        title="Supprimer le programme"
        description={`Êtes-vous sûr de vouloir supprimer le programme "${deletingProgram?.name}" ? Cette action supprimera également tous les chapitres associés.`}
        confirmText={deletingProgram?.name}
        onConfirm={handleDeleteProgram}
        isLoading={deleteProgramMutation.isPending}
      />
    </div>
  )
}
