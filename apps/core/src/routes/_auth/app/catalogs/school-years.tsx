import type { FormEvent } from 'react'
import type {
  CreateSchoolYearTemplateInput,
  CreateTermTemplateInput,
  UpdateTermTemplateInput,
} from '@/schemas/programs'
import { IconCalendar, IconPlus } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { AnimatePresence, domMax, LazyMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
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
import { SchoolYearsStats } from './school-years/school-years-stats'
import { YearCreateForm } from './school-years/year-create-form'
import { YearListItem } from './school-years/year-list-item'

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

  const [createYearIsActive, setCreateYearIsActive] = useState<string>('')
  const [editYearIsActive, setEditYearIsActive] = useState<string>('')
  const [createTermType, setCreateTermType] = useState<string>('')
  const [editTermType, setEditTermType] = useState<string>('')

  const { data: schoolYears, isPending } = useQuery(schoolYearTemplatesWithTermsQueryOptions())

  // Mutations
  const createYearMutation = useMutation({
    ...createSchoolYearTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-year-templates-with-terms'] })
      queryClient.invalidateQueries({ queryKey: ['school-year-templates'] })
      setIsCreatingYear(false)
      setCreateYearIsActive('false')
      toast.success('Année scolaire créée avec succès')
      logger.info('School year template created')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la création')
      toast.error(message)
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
    },
  })

  const createTermMutation = useMutation({
    ...createTermTemplateMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-year-templates-with-terms'] })
      queryClient.invalidateQueries({ queryKey: ['term-templates'] })
      setAddingTermToYear(null)
      setCreateTermType('trimester')
      toast.success('Période créée avec succès')
      logger.info('Term template created')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la création de la période')
      toast.error(message)
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

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="
          grid gap-4
          md:grid-cols-3
        "
        >
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
      <LazyMotion features={domMax}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Années Scolaires & Périodes</h1>
            <p className="text-muted-foreground">
              Gérer les modèles d'années scolaires et leurs périodes (trimestres/semestres)
            </p>
          </div>
          <Button onClick={() => setIsCreatingYear(true)}>
            <IconPlus className="mr-2 h-4 w-4" />
            Nouvelle Année
          </Button>
        </div>

        <SchoolYearsStats
          totalYears={schoolYears?.length || 0}
          totalTerms={totalTerms}
          activeYearName={activeYear?.name || 'Aucune'}
        />

        <AnimatePresence>
          {isCreatingYear && (
            <YearCreateForm
              onSubmit={handleCreateYear}
              onCancel={() => setIsCreatingYear(false)}
              isPending={createYearMutation.isPending}
              isActive={createYearIsActive}
              setIsActive={setCreateYearIsActive}
            />
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {!schoolYears || schoolYears.length === 0
            ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <IconCalendar className="
                      text-muted-foreground mx-auto mb-4 h-12 w-12
                    "
                    />
                    <h3 className="text-lg font-medium">Aucune année scolaire</h3>
                    <p className="text-muted-foreground mb-4">
                      Commencez par créer votre première année scolaire
                    </p>
                    <Button onClick={() => setIsCreatingYear(true)}>
                      <IconPlus className="mr-2 h-4 w-4" />
                      Créer une année
                    </Button>
                  </CardContent>
                </Card>
              )
            : (
                <AnimatePresence mode="popLayout">
                  {schoolYears.map((year: SchoolYearWithTerms) => (
                    <YearListItem
                      key={year.id}
                      year={year}
                      isExpanded={expandedYears.has(year.id)}
                      onToggleExpand={() => toggleYearExpanded(year.id)}
                      isEditing={editingYear === year.id}
                      onStartEdit={() => {
                        setEditingYear(year.id)
                        setEditYearIsActive(year.isActive ? 'true' : 'false')
                      }}
                      onCancelEdit={() => setEditingYear(null)}
                      onUpdate={e => handleUpdateYear(e, year.id)}
                      onDelete={() => setDeletingYear({ id: year.id, name: year.name })}
                      editYearIsActive={editYearIsActive}
                      setEditYearIsActive={setEditYearIsActive}
                      isUpdatePending={updateYearMutation.isPending}
                      addingTermToYear={addingTermToYear}
                      setAddingTermToYear={setAddingTermToYear}
                      createTermType={createTermType}
                      setCreateTermType={setCreateTermType}
                      onCreateTerm={e => handleCreateTerm(e, year.id)}
                      isCreateTermPending={createTermMutation.isPending}
                      editingTerm={editingTerm}
                      setEditingTerm={setEditingTerm}
                      editTermType={editTermType}
                      setEditTermType={setEditTermType}
                      onUpdateTerm={handleUpdateTerm}
                      isUpdateTermPending={updateTermMutation.isPending}
                      onDeleteTerm={term => setDeletingTerm(term)}
                    />
                  ))}
                </AnimatePresence>
              )}
        </div>

        <DeleteConfirmationDialog
          open={!!deletingYear}
          onOpenChange={open => !open && setDeletingYear(null)}
          title="Supprimer l'année scolaire"
          description={`Êtes-vous sûr de vouloir supprimer l'année scolaire "${deletingYear?.name}" ? Cette action supprimera également toutes les périodes associées.`}
          confirmText={deletingYear?.name}
          onConfirm={() => {
            if (deletingYear)
              deleteYearMutation.mutate({ id: deletingYear.id })
          }}
          isPending={deleteYearMutation.isPending}
        />

        <DeleteConfirmationDialog
          open={!!deletingTerm}
          onOpenChange={open => !open && setDeletingTerm(null)}
          title="Supprimer la période"
          description={`Êtes-vous sûr de vouloir supprimer la période "${deletingTerm?.name}" ?`}
          confirmText={deletingTerm?.name}
          onConfirm={() => {
            if (deletingTerm)
              deleteTermMutation.mutate({ id: deletingTerm.id })
          }}
          isPending={deleteTermMutation.isPending}
        />
      </LazyMotion>
    </div>
  )
}
