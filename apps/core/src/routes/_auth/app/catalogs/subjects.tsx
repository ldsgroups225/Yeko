import type { FormEvent } from 'react'
import type { CreateSubjectInput, UpdateSubjectInput } from '@/schemas/catalog'
import {
  IconBook,
  IconCircleX,
  IconDeviceFloppy,
  IconDownload,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUpload,
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
import { Skeleton } from '@workspace/ui/components/skeleton'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { CatalogListSkeleton, CatalogStatsSkeleton } from '@/components/catalogs/catalog-skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { useTranslations } from '@/i18n/hooks'
import {
  bulkCreateSubjectsMutationOptions,
  createSubjectMutationOptions,
  deleteSubjectMutationOptions,
  subjectsQueryOptions,
  updateSubjectMutationOptions,
} from '@/integrations/tanstack-query/catalogs-options'
import { downloadSubjectsTemplate, exportSubjectsToExcel, importSubjectsFromExcel } from '@/lib/catalog-csv'
import { useLogger } from '@/lib/logger'
import { parseServerFnError } from '@/utils/error-handlers'
import { formatDate } from '@/utils/formatDate'
import { generateUUID } from '@/utils/generateUUID'

export const Route = createFileRoute('/_auth/app/catalogs/subjects')({
  component: SubjectsCatalog,
})

function SubjectsCatalog() {
  const t = useTranslations()
  const { logger } = useLogger()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isCreating, setIsCreating] = useState(false)
  const [newSubjectCategory, setNewSubjectCategory] = useState<string>('')
  const [editingSubject, setEditingSubject] = useState<string | null>(null)
  const [editSubjectCategory, setEditSubjectCategory] = useState<string>('')
  const [deletingSubject, setDeletingSubject] = useState<{ id: string, name: string } | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 500)

  const queryParams = useMemo(() => ({
    search: debouncedSearch || undefined,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    page,
    limit: 20,
  }), [debouncedSearch, categoryFilter, page])

  const { data: subjectsData, isLoading, error } = useQuery(subjectsQueryOptions(queryParams))

  // Manage infinite scroll subjects with derived state
  const allSubjects = useMemo(() => {
    if (!subjectsData?.subjects)
      return []
    return subjectsData.subjects
  }, [subjectsData])

  const pagination = subjectsData?.pagination
  const hasMore = pagination ? page < pagination.totalPages : false

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: () => setPage(prev => prev + 1),
    hasMore,
    isLoading,
  })

  const createMutation = useMutation({
    ...createSubjectMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setIsCreating(false)
      setNewSubjectCategory('')
      setPage(1)
      toast.success('Matière créée avec succès')
      logger.info('Subject created successfully')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la création de la matière')
      toast.error(message)
      logger.error('Failed to create subject', error instanceof Error ? error : new Error(String(error)))
    },
  })

  const bulkCreateMutation = useMutation({
    ...bulkCreateSubjectsMutationOptions,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setPage(1)
      toast.success(`${data.length} matières importées avec succès`)
      logger.info('Subjects imported successfully')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de l\'import des matières')
      toast.error(message)
      logger.error('Failed to import subjects', error instanceof Error ? error : new Error(String(error)))
    },
  })

  const updateMutation = useMutation({
    ...updateSubjectMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setEditingSubject(null)
      setEditSubjectCategory('')
      toast.success('Matière mise à jour avec succès')
      logger.info('Subject updated successfully')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la mise à jour de la matière')
      toast.error(message)
      logger.error('Failed to update subject', error instanceof Error ? error : new Error(String(error)))
    },
  })

  const deleteMutation = useMutation({
    ...deleteSubjectMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setDeletingSubject(null)
      toast.success('Matière supprimée avec succès')
      logger.info('Subject deleted successfully')
    },
    onError: (error) => {
      const message = parseServerFnError(error, 'Erreur lors de la suppression de la matière')
      toast.error(message)
      logger.error('Failed to delete subject', error instanceof Error ? error : new Error(String(error)))
    },
  })

  useEffect(() => {
    logger.info('Subjects catalog page viewed', {
      page: 'subjects-catalog',
      timestamp: new Date().toISOString(),
      filters: queryParams,
    })
  }, [logger, queryParams])

  const handleCreate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: CreateSubjectInput = {
      name: formData.get('name') as string,
      shortName: formData.get('shortName') as string,
      category: (formData.get('category') as 'Scientifique' | 'Littéraire' | 'Sportif' | 'Autre') || 'Autre',
    }
    createMutation.mutate(data)
  }

  const handleUpdate = (e: FormEvent<HTMLFormElement>, subjectId: string) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const categoryValue = formData.get('category')
    const data: UpdateSubjectInput = {
      id: subjectId,
      name: formData.get('name') as string,
      shortName: formData.get('shortName') as string,
      category: categoryValue ? (categoryValue as 'Scientifique' | 'Littéraire' | 'Sportif' | 'Autre') : undefined,
    }
    updateMutation.mutate(data)
  }

  const handleDelete = () => {
    if (deletingSubject) {
      deleteMutation.mutate({ id: deletingSubject.id })
    }
  }

  const handleExport = () => {
    if (allSubjects.length > 0) {
      exportSubjectsToExcel(allSubjects)
      logger.info('Subjects exported to Excel')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file)
      return

    const result = await importSubjectsFromExcel(file)

    await result.match(
      async (importedSubjects) => {
        logger.info(`Imported ${importedSubjects.length} subjects from Excel`)

        // Create subjects in batch
        const subjectsToCreate = importedSubjects
          .filter(s => s.name && s.category) as CreateSubjectInput[]

        if (subjectsToCreate.length > 0) {
          await bulkCreateMutation.mutateAsync({ subjects: subjectsToCreate })
        }
      },
      async (error) => {
        logger.error('Failed to import subjects', error)
        toast.error('Erreur lors de l\'import du fichier')
      },
    )

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const categories = useMemo(() => {
    const allCategories = ['Scientifique', 'Littéraire', 'Sportif', 'Autre']
    return allCategories.map(cat => ({
      name: cat,
      count: allSubjects.filter(s => s.category === cat).length,
    }))
  }, [allSubjects])

  const getCategoryVariant = (category: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (category) {
      case 'Scientifique': return 'default'
      case 'Littéraire': return 'secondary'
      case 'Sportif': return 'destructive'
      case 'Autre': return 'outline'
      default: return 'outline'
    }
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <IconCircleX className="h-8 w-8 text-destructive mx-auto mb-2" />
        <h3 className="text-lg font-medium text-destructive">Erreur de chargement</h3>
        <p className="text-muted-foreground">{error.message}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.catalogs.subjects.title()}</h1>
          <p className="text-muted-foreground">
            Catalogue global des matières disponibles pour toutes les écoles partenaires
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadSubjectsTemplate}>
            <IconDownload className="h-4 w-4 mr-2" />
            Template
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={allSubjects.length === 0}>
            <IconDownload className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <IconUpload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImport}
          />
          <Button className="gap-2" onClick={() => setIsCreating(true)}>
            <IconPlus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading && page === 1
        ? (
            <CatalogStatsSkeleton />
          )
        : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <IconBook className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pagination?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">matières</p>
                </CardContent>
              </Card>

              {categories.map(category => (
                <Card key={category.name}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                    <IconBook className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{category.count}</div>
                    <p className="text-xs text-muted-foreground">matières</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

      {/* Create Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{t.catalogs.subjects.create()}</CardTitle>
            <CardDescription>Ajouter une nouvelle matière au catalogue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder={t.catalogs.subjects.namePlaceholder()}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortName">Nom Court</Label>
                  <Input
                    id="shortName"
                    name="shortName"
                    placeholder={t.catalogs.subjects.shortNamePlaceholder()}
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select name="category" required value={newSubjectCategory} onValueChange={val => val && setNewSubjectCategory(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.catalogs.subjects.selectCategory()}>
                        {newSubjectCategory || undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scientifique">Scientifique</SelectItem>
                      <SelectItem value="Littéraire">Littéraire</SelectItem>
                      <SelectItem value="Sportif">Sportif</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  <IconX className="h-4 w-4 mr-2" />
                  {t.common.cancel()}
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  <IconDeviceFloppy className="h-4 w-4 mr-2" />
                  {createMutation.isPending ? t.common.loading() : t.common.create()}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher & Filtrer</CardTitle>
          <CardDescription>
            Trouver des matières spécifiques ou filtrer par catégorie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.catalogs.subjects.search()}
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                if (value) {
                  setCategoryFilter(value)
                  setPage(1)
                }
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t.catalogs.subjects.category()}>
                  {categoryFilter === 'all' ? t.catalogs.subjects.allCategories() : categoryFilter}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.catalogs.subjects.allCategories()}</SelectItem>
                <SelectItem value="Scientifique">Scientifique</SelectItem>
                <SelectItem value="Littéraire">Littéraire</SelectItem>
                <SelectItem value="Sportif">Sportif</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subjects List */}
      <Card>
        <CardHeader>
          <CardTitle>{t.catalogs.subjects.title()}</CardTitle>
          <CardDescription>
            {pagination?.total || 0}
            {' '}
            matière(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && page === 1
            ? (
                <CatalogListSkeleton count={5} />
              )
            : allSubjects.length === 0
              ? (
                  <div className="text-center py-8">
                    <IconBook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Aucune matière trouvée</h3>
                    <p className="text-muted-foreground">
                      {search || categoryFilter !== 'all'
                        ? 'Essayez de modifier vos filtres de recherche.'
                        : 'Commencez par ajouter votre première matière.'}
                    </p>
                  </div>
                )
              : (
                  <>
                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {allSubjects.map(subject => (
                          <motion.div
                            key={subject.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            {editingSubject === subject.id
                              ? (
                                  <form
                                    onSubmit={e => handleUpdate(e, subject.id)}
                                    className="border rounded-lg p-4 space-y-4"
                                  >
                                    <div className="grid gap-4 md:grid-cols-3">
                                      <div className="space-y-2">
                                        <Label htmlFor={`edit-name-${subject.id}`}>Nom *</Label>
                                        <Input
                                          id={`edit-name-${subject.id}`}
                                          name="name"
                                          defaultValue={subject.name}
                                          required
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor={`edit-shortName-${subject.id}`}>Nom Court</Label>
                                        <Input
                                          id={`edit-shortName-${subject.id}`}
                                          name="shortName"
                                          defaultValue={subject.shortName || ''}
                                          maxLength={10}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor={`edit-category-${subject.id}`}>Catégorie *</Label>
                                        <Select
                                          name="category"
                                          defaultValue={subject.category}
                                          required
                                          value={editSubjectCategory}
                                          onValueChange={val => val && setEditSubjectCategory(val)}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder={t.catalogs.subjects.selectCategory()}>
                                              {editSubjectCategory || undefined}
                                            </SelectValue>
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Scientifique">Scientifique</SelectItem>
                                            <SelectItem value="Littéraire">Littéraire</SelectItem>
                                            <SelectItem value="Sportif">Sportif</SelectItem>
                                            <SelectItem value="Autre">Autre</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingSubject(null)}
                                      >
                                        <IconX className="h-4 w-4 mr-2" />
                                        {t.common.cancel()}
                                      </Button>
                                      <Button type="submit" disabled={updateMutation.isPending}>
                                        <IconDeviceFloppy className="h-4 w-4 mr-2" />
                                        {updateMutation.isPending ? t.common.loading() : t.common.save()}
                                      </Button>
                                    </div>
                                  </form>
                                )
                              : (
                                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <IconBook className="h-5 w-5 text-primary" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h3 className="font-semibold">{subject.name}</h3>
                                          {subject.shortName && (
                                            <Badge variant="outline" className="text-xs">
                                              {subject.shortName}
                                            </Badge>
                                          )}
                                          <Badge variant={getCategoryVariant(subject.category)}>
                                            {subject.category}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-xs text-muted-foreground">
                                            Créé le
                                            {' '}
                                            {formatDate(subject.createdAt, 'MEDIUM')}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setEditingSubject(subject.id)
                                          setEditSubjectCategory(subject.category || 'Autre')
                                        }}
                                      >
                                        <IconEdit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeletingSubject({ id: subject.id, name: subject.name })}
                                        disabled={deleteMutation.isPending}
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

                    {/* Infinite Scroll Trigger */}
                    {hasMore && (
                      <div ref={loadMoreRef} className="py-4">
                        {isLoading && (
                          <div className="space-y-4">
                            {Array.from({ length: 3 }).map(() => (
                              <div key={generateUUID()} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4 flex-1">
                                  <Skeleton className="h-10 w-10 rounded-lg" />
                                  <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deletingSubject}
        onOpenChange={open => !open && setDeletingSubject(null)}
        title={t.catalogs.subjects.edit()}
        description={`Êtes-vous sûr de vouloir supprimer la matière "${deletingSubject?.name}" ? Cette action est irréversible.`}
        confirmText={deletingSubject?.name}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
