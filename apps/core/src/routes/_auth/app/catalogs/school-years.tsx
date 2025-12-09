import type { FormEvent } from 'react'
import type {
  CreateSchoolYearTemplateInput,
  CreateTermTemplateInput,
  UpdateTermTemplateInput,
} from '@/schemas/programs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  Calendar,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Edit2,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  createSchoolYearTemplateMutationOptions,
  createTermTemplateMutationOptions,
  deleteSchoolYearTemplateMutationOptions,
  deleteTermTemplateMutationOptions,
  schoolYearTemplatesWithTermsQueryOptions,
  updateSchoolYearTemplateMutationOptions,
  updateTermTemplateMutationOptions,
} from '@/integrations/tanstack-query/programs-options'
import { useLogger } from '@/lib/logger'
import { parseServerFnError } from '@/utils/error-handlers'

export const Route = createFileRoute('/_auth/app/catalogs/school-years')({
  component: SchoolYearsCatalog,
})

interface TermTemplate {
  id: string
  name: string
  type: 'trimester' | 'semester'
  order: number
  schoolYearTemplateId: string
}

interface SchoolYearWithTerms {
  id: string
  name: string
  isActive: boolean
  terms: TermTemplate[]
}

function SchoolYearsCatalog() {
  const { logger } = useLogger()
  const queryClient = useQueryClient()

  const [expandedYears, setExpandedYears] = useState<Set<string>>(() => new Set())
  const [isCreatingYear, setIsCreatingYear] = useState(false)
  const [editingYear, setEditingYear] = useState<string | null>(null)
  const [deletingYear, setDeletingYear] = useState<{ id: string, name: string } | null>(null)
  const [addingTermToYear, setAddingTermToYear] = useState<string | null>(null)
  const [editingTerm, setEditingTerm] = useState<TermTemplate | null>(null)
  const [deletingTerm, setDeletingTerm] = useState<{ id: string, name: string } | null>(null)

  const { data: schoolYears, isLoading } = useQuery(schoolYearTemplatesWithTermsQueryOptions())

  // Mutations
  const createYearMutation = useMutation({
    ...createSchoolYearTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-year-templates-with-terms'] })
      queryClient.invalidateQueries({ queryKey: ['school-year-templates'] })
      setIsCreatingYear(false)
      toast.success('Année scolaire créée avec succès')
      logger.info('School year template created')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la création')
      toast.error(message)
      logger.error('Failed to create school year template', error)
    },
  })

  const updateYearMutation = useMutation({
    ...updateSchoolYearTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-year-templates-with-terms'] })
      queryClient.invalidateQueries({ queryKey: ['school-year-templates'] })
      setEditingYear(null)
      toast.success('Année scolaire mise à jour')
      logger.info('School year template updated')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la mise à jour')
      toast.error(message)
      logger.error('Failed to update school year template', error)
    },
  })

  const deleteYearMutation = useMutation({
    ...deleteSchoolYearTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-year-templates-with-terms'] })
      queryClient.invalidateQueries({ queryKey: ['school-year-templates'] })
      setDeletingYear(null)
      toast.success('Année scolaire supprimée')
      logger.info('School year template deleted')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la suppression')
      toast.error(message)
      logger.error('Failed to delete school year template', error)
    },
  })

  const createTermMutation = useMutation({
    ...createTermTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-year-templates-with-terms'] })
      queryClient.invalidateQueries({ queryKey: ['term-templates'] })
      setAddingTermToYear(null)
      toast.success('Période créée avec succès')
      logger.info('Term template created')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la création de la période')
      toast.error(message)
      logger.error('Failed to create term template', error)
    },
  })

  const updateTermMutation = useMutation({
    ...updateTermTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-year-templates-with-terms'] })
      queryClient.invalidateQueries({ queryKey: ['term-templates'] })
      setEditingTerm(null)
      toast.success('Période mise à jour')
      logger.info('Term template updated')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la mise à jour')
      toast.error(message)
      logger.error('Failed to update term template', error)
    },
  })

  const deleteTermMutation = useMutation({
    ...deleteTermTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-year-templates-with-terms'] })
      queryClient.invalidateQueries({ queryKey: ['term-templates'] })
      setDeletingTerm(null)
      toast.success('Période supprimée')
      logger.info('Term template deleted')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la suppression')
      toast.error(message)
      logger.error('Failed to delete term template', error)
    },
  })

  useEffect(() => {
    logger.info('School years catalog page viewed')
  }, [logger])

  const toggleYearExpanded = (yearId: string) => {
    const newExpanded = new Set(expandedYears)
    if (newExpanded.has(yearId)) {
      newExpanded.delete(yearId)
    }
    else {
      newExpanded.add(yearId)
    }
    setExpandedYears(newExpanded)
  }

  const handleCreateYear = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: CreateSchoolYearTemplateInput = {
      name: formData.get('name') as string,
      isActive: formData.get('isActive') === 'true',
    }
    createYearMutation.mutate(data)
  }

  const handleUpdateYear = (e: FormEvent<HTMLFormElement>, yearId: string) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    updateYearMutation.mutate({
      id: yearId,
      name: formData.get('name') as string,
      isActive: formData.get('isActive') === 'true',
    })
  }

  const handleCreateTerm = (e: FormEvent<HTMLFormElement>, schoolYearTemplateId: string) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: CreateTermTemplateInput = {
      name: formData.get('name') as string,
      type: formData.get('type') as 'trimester' | 'semester',
      order: Number.parseInt(formData.get('order') as string, 10),
      schoolYearTemplateId,
    }
    createTermMutation.mutate(data)
  }

  const handleUpdateTerm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingTerm)
      return
    const formData = new FormData(e.currentTarget)
    const data: UpdateTermTemplateInput = {
      id: editingTerm.id,
      name: formData.get('name') as string,
      type: formData.get('type') as 'trimester' | 'semester',
      order: Number.parseInt(formData.get('order') as string, 10),
    }
    updateTermMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  const activeYear = schoolYears?.find((y: SchoolYearWithTerms) => y.isActive)
  const totalTerms = schoolYears?.reduce((acc: number, y: SchoolYearWithTerms) => acc + y.terms.length, 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Années Scolaires & Périodes</h1>
          <p className="text-muted-foreground">
            Gérer les modèles d'années scolaires et leurs périodes (trimestres/semestres)
          </p>
        </div>
        <Button onClick={() => setIsCreatingYear(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Année
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Années Scolaires</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schoolYears?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Modèles disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Périodes</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTerms}</div>
            <p className="text-xs text-muted-foreground">Trimestres/Semestres</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Année Active</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeYear?.name || 'Aucune'}</div>
            <p className="text-xs text-muted-foreground">Année en cours</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Year Form */}
      <AnimatePresence>
        {isCreatingYear && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Créer une Nouvelle Année Scolaire</CardTitle>
                <CardDescription>
                  Définissez le nom de l'année scolaire, puis ajoutez les périodes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateYear} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="year-name">Nom de l'année *</Label>
                      <Input
                        id="year-name"
                        name="name"
                        placeholder="2025-2026"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year-status">Statut</Label>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* School Years List */}
      <div className="space-y-4">
        {!schoolYears || schoolYears.length === 0
          ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Aucune année scolaire</h3>
                  <p className="text-muted-foreground mb-4">
                    Commencez par créer votre première année scolaire
                  </p>
                  <Button onClick={() => setIsCreatingYear(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une année
                  </Button>
                </CardContent>
              </Card>
            )
          : (
              <AnimatePresence mode="popLayout">
                {schoolYears.map((year: SchoolYearWithTerms) => {
                  const isExpanded = expandedYears.has(year.id)
                  const isEditing = editingYear === year.id

                  return (
                    <motion.div
                      key={year.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className={year.isActive ? 'border-primary' : ''}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => toggleYearExpanded(year.id)}
                                className="p-1 hover:bg-accent rounded"
                                aria-label={isExpanded ? 'Réduire' : 'Développer'}
                              >
                                <motion.div
                                  animate={{ rotate: isExpanded ? 90 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronRight className="h-5 w-5" />
                                </motion.div>
                              </button>
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Calendar className="h-5 w-5 text-primary" />
                              </div>
                              {isEditing
                                ? (
                                    <form
                                      onSubmit={e => handleUpdateYear(e, year.id)}
                                      className="flex items-center gap-2"
                                    >
                                      <Input
                                        name="name"
                                        defaultValue={year.name}
                                        className="w-32"
                                      />
                                      <Select name="isActive" defaultValue={year.isActive ? 'true' : 'false'}>
                                        <SelectTrigger className="w-28">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="true">Active</SelectItem>
                                          <SelectItem value="false">Inactive</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button type="submit" size="sm" disabled={updateYearMutation.isPending}>
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingYear(null)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </form>
                                  )
                                : (
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <CardTitle className="text-xl">{year.name}</CardTitle>
                                        {year.isActive && (
                                          <Badge variant="default">Active</Badge>
                                        )}
                                      </div>
                                      <CardDescription>
                                        {year.terms.length}
                                        {' '}
                                        période(s) configurée(s)
                                      </CardDescription>
                                    </div>
                                  )}
                            </div>
                            {!isEditing && (
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingYear(year.id)}
                                  aria-label="Modifier"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeletingYear({ id: year.id, name: year.name })}
                                  aria-label="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardHeader>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <CardContent className="pt-4 border-t">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      Périodes (Trimestres/Semestres)
                                    </h4>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setAddingTermToYear(year.id)}
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Ajouter
                                    </Button>
                                  </div>

                                  {/* Add Term Form */}
                                  <AnimatePresence>
                                    {addingTermToYear === year.id && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 bg-muted/50 rounded-lg"
                                      >
                                        <form
                                          onSubmit={e => handleCreateTerm(e, year.id)}
                                          className="space-y-4"
                                        >
                                          <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                              <Label>Nom *</Label>
                                              <Input
                                                name="name"
                                                placeholder="1er Trimestre"
                                                required
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label>Type *</Label>
                                              <Select name="type" defaultValue="trimester">
                                                <SelectTrigger>
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="trimester">Trimestre</SelectItem>
                                                  <SelectItem value="semester">Semestre</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div className="space-y-2">
                                              <Label>Ordre *</Label>
                                              <Input
                                                name="order"
                                                type="number"
                                                min="1"
                                                defaultValue={year.terms.length + 1}
                                                required
                                              />
                                            </div>
                                          </div>
                                          <div className="flex justify-end gap-2">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setAddingTermToYear(null)}
                                            >
                                              Annuler
                                            </Button>
                                            <Button
                                              type="submit"
                                              size="sm"
                                              disabled={createTermMutation.isPending}
                                            >
                                              {createTermMutation.isPending ? 'Création...' : 'Ajouter'}
                                            </Button>
                                          </div>
                                        </form>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  {/* Terms List */}
                                  {year.terms.length === 0
                                    ? (
                                        <div className="text-center py-6 text-muted-foreground">
                                          <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                          <p>Aucune période configurée</p>
                                          <p className="text-sm">
                                            Ajoutez des trimestres ou semestres pour cette année
                                          </p>
                                        </div>
                                      )
                                    : (
                                        <div className="space-y-2">
                                          {year.terms
                                            .sort((a: TermTemplate, b: TermTemplate) => a.order - b.order)
                                            .map((term: TermTemplate) => (
                                              <div
                                                key={term.id}
                                                className="flex items-center justify-between p-3 bg-background border rounded-lg"
                                              >
                                                {editingTerm?.id === term.id
                                                  ? (
                                                      <form
                                                        onSubmit={handleUpdateTerm}
                                                        className="flex items-center gap-2 flex-1"
                                                      >
                                                        <Input
                                                          name="name"
                                                          defaultValue={term.name}
                                                          className="w-40"
                                                        />
                                                        <Select name="type" defaultValue={term.type}>
                                                          <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                            <SelectItem value="trimester">Trimestre</SelectItem>
                                                            <SelectItem value="semester">Semestre</SelectItem>
                                                          </SelectContent>
                                                        </Select>
                                                        <Input
                                                          name="order"
                                                          type="number"
                                                          min="1"
                                                          defaultValue={term.order}
                                                          className="w-20"
                                                        />
                                                        <Button
                                                          type="submit"
                                                          size="sm"
                                                          disabled={updateTermMutation.isPending}
                                                        >
                                                          <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                          type="button"
                                                          size="sm"
                                                          variant="ghost"
                                                          onClick={() => setEditingTerm(null)}
                                                        >
                                                          <X className="h-4 w-4" />
                                                        </Button>
                                                      </form>
                                                    )
                                                  : (
                                                      <>
                                                        <div className="flex items-center gap-3">
                                                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                                                            {term.order}
                                                          </span>
                                                          <span className="font-medium">{term.name}</span>
                                                          <Badge variant="outline" className="text-xs">
                                                            {term.type === 'trimester' ? 'Trimestre' : 'Semestre'}
                                                          </Badge>
                                                        </div>
                                                        <div className="flex gap-1">
                                                          <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => setEditingTerm(term)}
                                                            aria-label="Modifier"
                                                          >
                                                            <Edit2 className="h-3 w-3" />
                                                          </Button>
                                                          <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => setDeletingTerm({ id: term.id, name: term.name })}
                                                            aria-label="Supprimer"
                                                          >
                                                            <Trash2 className="h-3 w-3" />
                                                          </Button>
                                                        </div>
                                                      </>
                                                    )}
                                              </div>
                                            ))}
                                        </div>
                                      )}
                                </div>
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
      </div>

      {/* Delete Year Dialog */}
      <DeleteConfirmationDialog
        open={!!deletingYear}
        onOpenChange={open => !open && setDeletingYear(null)}
        title="Supprimer l'année scolaire"
        description={`Êtes-vous sûr de vouloir supprimer l'année "${deletingYear?.name}" ? Cette action supprimera également toutes les périodes associées.`}
        confirmText={deletingYear?.name}
        onConfirm={() => deletingYear && deleteYearMutation.mutate({ id: deletingYear.id })}
        isLoading={deleteYearMutation.isPending}
      />

      {/* Delete Term Dialog */}
      <DeleteConfirmationDialog
        open={!!deletingTerm}
        onOpenChange={open => !open && setDeletingTerm(null)}
        title="Supprimer la période"
        description={`Êtes-vous sûr de vouloir supprimer la période "${deletingTerm?.name}" ?`}
        confirmText={deletingTerm?.name}
        onConfirm={() => deletingTerm && deleteTermMutation.mutate({ id: deletingTerm.id })}
        isLoading={deleteTermMutation.isPending}
      />
    </div>
  )
}
