import type { FormEvent } from 'react'
import type { CreateProgramTemplateInput } from '@/schemas/programs'
import {
  IconBook,
  IconCalendar,
  IconChevronRight,
  IconCopy,
  IconDatabase,
  IconDeviceFloppy,
  IconFileText,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, Outlet, useMatch, useNavigate } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CatalogListSkeleton, CatalogStatsSkeleton } from '@/components/catalogs/catalog-skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { gradesQueryOptions, subjectsQueryOptions } from '@/integrations/tanstack-query/catalogs-options'
import {
  cloneProgramTemplateMutationOptions,
  createProgramTemplateMutationOptions,
  deleteProgramTemplateMutationOptions,
  programStatsQueryOptions,
  programTemplatesQueryOptions,
  schoolYearTemplatesQueryOptions,
} from '@/integrations/tanstack-query/programs-options'
import { useLogger } from '@/lib/logger'
import { parseServerFnError } from '@/utils/error-handlers'

export const Route = createFileRoute('/_auth/app/catalogs/programs')({
  component: ProgramsLayout,
})

function ProgramsLayout() {
  // Check if we're on a child route (program details)
  const childMatch = useMatch({
    from: '/_auth/app/catalogs/programs/$programId',
    shouldThrow: false,
  })

  // If we're on a child route, render the Outlet (child component)
  if (childMatch) {
    return <Outlet />
  }

  // Otherwise, render the programs list
  return <ProgramsCatalog />
}

function ProgramsCatalog() {
  const { logger } = useLogger()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [isCreatingProgram, setIsCreatingProgram] = useState(false)
  const [newProgramYear, setNewProgramYear] = useState<string>('')
  const [newProgramSubject, setNewProgramSubject] = useState<string>('')
  const [newProgramGrade, setNewProgramGrade] = useState<string>('')
  const [deletingProgram, setDeletingProgram] = useState<{ id: string, name: string } | null>(null)
  const [cloningProgram, setCloningProgram] = useState<{ id: string, name: string } | null>(null)
  const [cloneProgramYear, setCloneProgramYear] = useState<string>('')

  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')

  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 500)

  // Fetch data
  const { data: schoolYears, isPending: yearsPending } = useQuery(schoolYearTemplatesQueryOptions())
  const { data: subjects } = useQuery(subjectsQueryOptions({ limit: 100 }))
  const { data: grades } = useQuery(gradesQueryOptions())
  const { data: stats, isPending: statsPending } = useQuery(programStatsQueryOptions())

  const queryParams = useMemo(() => ({
    schoolYearTemplateId: yearFilter === 'all' ? undefined : yearFilter,
    subjectId: subjectFilter === 'all' ? undefined : subjectFilter,
    gradeId: gradeFilter === 'all' ? undefined : gradeFilter,
    status: statusFilter === 'all' ? undefined : (statusFilter as 'draft' | 'published' | 'archived'),
    search: debouncedSearch || undefined,
    page,
    limit: 20,
  }), [yearFilter, subjectFilter, gradeFilter, statusFilter, debouncedSearch, page])

  const { data: programsData, isPending: programsPending } = useQuery(programTemplatesQueryOptions(queryParams))

  // Mutations
  const createProgramMutation = useMutation({
    ...createProgramTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-templates'] })
      queryClient.invalidateQueries({ queryKey: ['program-stats'] })
      setIsCreatingProgram(false)
      setNewProgramYear('')
      setNewProgramSubject('')
      setNewProgramGrade('')
      setPage(1)
      toast.success('Programme créé avec succès')
      logger.info('Program template created')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la création du programme')
      toast.error(message)
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
      const message = parseServerFnError(error, 'Erreur lors de la suppression du programme')
      toast.error(message)
      logger.error('Failed to delete program template', error)
    },
  })

  const cloneProgramMutation = useMutation({
    ...cloneProgramTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-templates'] })
      queryClient.invalidateQueries({ queryKey: ['program-stats'] })
      setCloningProgram(null)
      setCloneProgramYear('')
      toast.success('Programme cloné avec succès')
      logger.info('Program template cloned')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors du clonage du programme')
      toast.error(message)
      logger.error('Failed to clone program template', error)
    },
  })

  useEffect(() => {
    logger.info('Programs catalog page viewed', {
      page: 'programs-catalog',
      timestamp: new Date().toISOString(),
    })
  }, [logger])

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

  const activeYear = schoolYears?.find(y => y.isActive)

  if (yearsPending || statsPending) {
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
        <Button onClick={() => setIsCreatingProgram(true)}>
          <IconPlus className="h-4 w-4 mr-2" />
          Créer un Programme
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programmes</CardTitle>
            <IconDatabase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.programs || 0}</div>
            <p className="text-xs text-muted-foreground">Modèles actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chapitres</CardTitle>
            <IconFileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.chapters || 0}</div>
            <p className="text-xs text-muted-foreground">Total chapitres</p>
          </CardContent>
        </Card>

        <Link to="/app/catalogs/school-years" className="block">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Années Scolaires</CardTitle>
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.schoolYears || 0}</div>
              <p className="text-xs text-muted-foreground">Gérer les années et périodes →</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Année Active</CardTitle>
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeYear?.name || 'Aucune'}</div>
            <p className="text-xs text-muted-foreground">Année en cours</p>
          </CardContent>
        </Card>
      </div>

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
                  <Select name="schoolYearTemplateId" required value={newProgramYear} onValueChange={val => val && setNewProgramYear(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'année">
                        {newProgramYear
                          ? (() => {
                              const year = schoolYears?.find(y => y.id === newProgramYear)
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
                          {year.name}
                          {year.isActive && ' (Active)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program-subject">Matière *</Label>
                  <Select name="subjectId" required value={newProgramSubject} onValueChange={val => val && setNewProgramSubject(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la matière">
                        {newProgramSubject
                          ? subjects?.subjects.find(s => s.id === newProgramSubject)?.name
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
                  <Label htmlFor="program-grade">Classe *</Label>
                  <Select name="gradeId" required value={newProgramGrade} onValueChange={val => val && setNewProgramGrade(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la classe">
                        {newProgramGrade
                          ? grades?.find(g => g.id === newProgramGrade)?.name
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
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreatingProgram(false)}>
                  <IconX className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button type="submit" disabled={createProgramMutation.isPending}>
                  <IconDeviceFloppy className="h-4 w-4 mr-2" />
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
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des programmes..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={yearFilter} onValueChange={val => val && setYearFilter(val)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Année">
                  {yearFilter === 'all'
                    ? 'Toutes les années'
                    : (() => {
                        const year = schoolYears?.find(y => y.id === yearFilter)
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
                {schoolYears?.map(year => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={val => val && setSubjectFilter(val)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Matière">
                  {subjectFilter === 'all'
                    ? 'Toutes les matières'
                    : subjects?.subjects.find(s => s.id === subjectFilter)?.name || undefined}
                </SelectValue>
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
            <Select value={statusFilter} onValueChange={val => val && setStatusFilter(val)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Statut">
                  {statusFilter === 'all' ? 'Tous les statuts' : undefined}
                  {statusFilter === 'draft' ? 'Brouillon' : undefined}
                  {statusFilter === 'published' ? 'Publié' : undefined}
                  {statusFilter === 'archived' ? 'Archivé' : undefined}
                </SelectValue>
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
          {programsPending && page === 1
            ? (
                <CatalogListSkeleton count={5} />
              )
            : !programsData || programsData.programs.length === 0
                ? (
                    <div className="text-center py-8">
                      <IconDatabase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
                        {programsData.programs.map(program => (
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
                                <IconBook className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{program.name}</h3>
                                  {program.status === 'published' && (
                                    <Badge variant="default" className="text-xs">Publié</Badge>
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
                              <IconChevronRight className="h-5 w-5 text-muted-foreground" />
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
                                <IconCopy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingProgram({ id: program.id, name: program.name })}
                              >
                                <IconTrash className="h-4 w-4" />
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
                  <Select name="newSchoolYearTemplateId" required value={cloneProgramYear} onValueChange={val => val && setCloneProgramYear(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'année">
                        {cloneProgramYear
                          ? (() => {
                              const year = schoolYears?.find(y => y.id === cloneProgramYear)
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
        isPending={deleteProgramMutation.isPending}
      />
    </div>
  )
}
