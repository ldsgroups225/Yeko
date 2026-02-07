import type { School } from '@repo/data-ops'
import {
  IconCalendar,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconDots,
  IconDownload,
  IconLoader2,
  IconMail,
  IconMapPin,
  IconPhone,
  IconPlus,
  IconSchool,
  IconSearch,
  IconUpload,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Can } from '@/components/auth/can'
import { useDebounce } from '@/hooks/use-debounce'
import { schoolsPerformanceQueryOptions } from '@/integrations/tanstack-query/analytics-options'
import { bulkCreateSchoolsMutationOptions, schoolsKeys, schoolsQueryOptions } from '@/integrations/tanstack-query/schools-options'
import { useLogger } from '@/lib/logger'
import { exportSchoolsToExcel, importSchoolsFromExcel } from '@/lib/schools-import-export'

export const Route = createFileRoute('/_auth/app/schools/')({
  beforeLoad: ({ context }) => {
    // Basic guard: if authenticated but doesn't have system access, redirect to unauthorized
    // Note: This is redundant if parent route already checks this, but good for defense-in-depth
    if (context.auth?.isAuthenticated && !context.auth.hasSystemAccess) {
      throw redirect({
        to: '/unauthorized',
      })
    }
  },
  component: Schools,
})

function Schools() {
  const { logger } = useLogger()
  const queryClient = useQueryClient()

  // Bulk create mutation
  const bulkCreateMutation = useMutation({
    ...bulkCreateSchoolsMutationOptions,
    onSuccess: (result) => {
      const typedResult = result as {
        success: boolean
        created: number
        errors: Array<{ index: number, code: string, error: string }>
      }
      if (typedResult.success) {
        queryClient.invalidateQueries({ queryKey: schoolsKeys.lists() })
        toast.success(`${typedResult.created} écoles importées avec succès`)
        logger.info('Bulk schools created', { count: typedResult.created })
      }
      else {
        const errorCount = typedResult.errors.filter(e => !e.error.includes('ignoré')).length
        if (errorCount > 0) {
          toast.error(`Import échoué: ${errorCount} erreurs`)
          logger.error('Bulk schools creation failed', new Error(`${errorCount} errors during import`))
        }
        else if (typedResult.created > 0) {
          queryClient.invalidateQueries({ queryKey: schoolsKeys.lists() })
          toast.success(`${typedResult.created} écoles importées (${typedResult.errors.length} doublons ignorés)`)
        }
      }
    },
    onError: (error: Error) => {
      toast.error('Erreur lors de l\'import des écoles')
      logger.error('Bulk schools creation error', error)
    },
  })

  // State for filtering and pagination
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [status, setStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const limit = 10

  // Build query parameters
  const queryParams = useMemo(() => ({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : status,
    sortBy,
    sortOrder,
  }), [page, limit, debouncedSearch, status, sortBy, sortOrder])

  // Fetch schools data
  const { data: schoolsData, isPending, error } = useQuery(schoolsQueryOptions(queryParams))

  // Fetch schools stats for counts (uses existing analytics endpoint)
  const { data: schoolsPerfData } = useQuery(schoolsPerformanceQueryOptions('30d'))

  const allSchoolsQuery = schoolsQueryOptions({ page: 1, limit: 1000 })
  const {
    refetch: refetchAllSchools,
    isFetching: isExportingSchools,
  } = useQuery({
    ...allSchoolsQuery,
    enabled: false,
  })

  useEffect(() => {
    logger.info('Schools page viewed', {
      page: 'schools',
      timestamp: new Date().toISOString(),
      filters: queryParams,
      isPending,
      error: error?.message,
    })
  }, [logger, queryParams, isPending, error])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1) // Reset page when searching
  }

  const handleStatusFilter = (value: 'all' | 'active' | 'inactive' | 'suspended') => {
    setStatus(value)
    setPage(1) // Reset page when filtering
  }

  const handleSort = (value: 'name' | 'createdAt' | 'updatedAt') => {
    setSortBy(value)
    setPage(1) // Reset page when sorting
  }

  const handleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    setPage(1) // Reset page when changing sort order
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const schools = schoolsData?.data || []
  const pagination = schoolsData?.meta as {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  } | undefined
  const allSchools: School[] = schoolsData?.data || []
  const statusCounts = schoolsPerfData?.byStatus
  const statsLoading = isPending || schoolsPerfData === undefined

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default">
            <IconCircleCheck className="mr-1 h-3 w-3" />
            Active
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="secondary">
            <IconClock className="mr-1 h-3 w-3" />
            En attente
          </Badge>
        )
      case 'suspended':
        return (
          <Badge variant="destructive">
            <IconCircleX className="mr-1 h-3 w-3" />
            Suspendu
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Écoles</h1>
          <p className="text-muted-foreground">
            Gérer les écoles partenaires et leurs configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Can I="schools" a="export">
            <Button
              variant="outline"
              className="gap-2"
              onClick={async () => {
                const result = await refetchAllSchools()
                exportSchoolsToExcel(result.data?.data ?? [])
              }}
              disabled={isExportingSchools || (pagination?.total ?? 0) === 0}
            >
              <IconDownload className="h-4 w-4" />
              Exporter
            </Button>
          </Can>

          <Can I="schools" a="create">
            <Button
              variant="outline"
              className="gap-2"
              disabled={bulkCreateMutation.isPending}
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.xlsx,.xls'
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    try {
                      const importedSchools = await importSchoolsFromExcel(file)

                      if (importedSchools.length === 0) {
                        toast.error('Aucune école trouvée dans le fichier')
                        return
                      }

                      // Filter valid schools with required fields
                      const validSchools = importedSchools
                        .filter((school): school is typeof school & { name: string, code: string } =>
                          Boolean(school.name && school.code),
                        )
                        .map(school => ({
                          name: school.name,
                          code: school.code,
                          address: school.address ?? undefined,
                          phone: school.phone ?? undefined,
                          email: school.email ?? undefined,
                        }))

                      if (validSchools.length === 0) {
                        toast.error('Aucune école valide trouvée (nom et code requis)')
                        return
                      }

                      if (validSchools.length < importedSchools.length) {
                        toast.warning(`${importedSchools.length - validSchools.length} écoles ignorées (données invalides)`)
                      }

                      // Execute bulk create
                      toast.info(`Import de ${validSchools.length} écoles en cours...`)
                      bulkCreateMutation.mutate({
                        schools: validSchools,
                        skipDuplicates: true,
                        generateCodes: false,
                      })
                    }
                    catch (error) {
                      toast.error('Erreur lors de la lecture du fichier')
                      logger.error('Import file read error', error instanceof Error ? error : new Error(String(error)))
                    }
                  }
                }
                input.click()
              }}
            >
              {bulkCreateMutation.isPending
                ? <IconLoader2 className="h-4 w-4 animate-spin" />
                : <IconUpload className="h-4 w-4" />}
              Importer
            </Button>
          </Can>

          <Can I="schools" a="create">
            <Link to="/app/schools/create">
              <Button className="gap-2">
                <IconPlus className="h-4 w-4" />
                Ajouter une école
              </Button>
            </Link>
          </Can>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des écoles</CardTitle>
            <IconSchool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isPending ? <Skeleton className="h-8 w-16" /> : allSchools.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Toutes les écoles partenaires
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Écoles Actives</CardTitle>
            <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading
                ? <Skeleton className="h-8 w-16" />
                : (statusCounts?.active ?? allSchools.filter(s => s.status === 'active').length)}
            </div>
            <p className="text-xs text-muted-foreground">
              Actuellement actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Écoles Inactives</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading
                ? <Skeleton className="h-8 w-16" />
                : (statusCounts?.inactive ?? allSchools.filter(s => s.status === 'inactive').length)}
            </div>
            <p className="text-xs text-muted-foreground">
              Non actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Écoles Suspendues</CardTitle>
            <IconCircleX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading
                ? <Skeleton className="h-8 w-16" />
                : (statusCounts?.suspended ?? allSchools.filter(s => s.status === 'suspended').length)}
            </div>
            <p className="text-xs text-muted-foreground">
              Temporairement suspendues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche & Filtres</CardTitle>
          <CardDescription>
            Trouver des écoles spécifiques en utilisant les options de recherche et de filtre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher des écoles..."
                className="pl-9"
                value={search}
                onChange={e => handleSearch(e.target.value)}
              />
            </div>

            <Select value={status} onValueChange={val => val && handleStatusFilter(val)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut">
                  {status === 'all' && 'Tous les statuts'}
                  {status === 'active' && 'Actives'}
                  {status === 'inactive' && 'Inactives'}
                  {status === 'suspended' && 'Suspendues'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actives</SelectItem>
                <SelectItem value="inactive">Inactives</SelectItem>
                <SelectItem value="suspended">Suspendues</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={value => value && handleSort(value as 'name' | 'createdAt' | 'updatedAt')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par">
                  {sortBy === 'createdAt' && 'Date de création'}
                  {sortBy === 'updatedAt' && 'Date de mise à jour'}
                  {sortBy === 'name' && 'Nom'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date de création</SelectItem>
                <SelectItem value="updatedAt">Date de mise à jour</SelectItem>
                <SelectItem value="name">Nom</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleSortOrder}>
              {sortOrder === 'asc' ? '↑' : '↓'}
              {' '}
              Ordre
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schools List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Toutes les Écoles (
            {pagination?.total || 0}
            )
          </CardTitle>
          <CardDescription>
            Liste complète des écoles partenaires dans votre système
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPending
            ? (
                <div className="flex justify-center py-8">
                  <IconLoader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Chargement des écoles...</span>
                </div>
              )
            : (
                error
                  ? (
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
                  : (
                      schools.length === 0
                        ? (
                            <div className="text-center py-8">
                              <IconSchool className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="text-lg font-medium">Aucune école trouvée</h3>
                              <p className="text-muted-foreground">
                                {search || status !== 'all'
                                  ? 'Essayez de modifier vos filtres de recherche.'
                                  : 'Commencez par ajouter votre première école.'}
                              </p>
                              {(!search && status === 'all') && (
                                <Link to="/app/schools/create">
                                  <Button className="mt-4">
                                    <IconPlus className="h-4 w-4 mr-2" />
                                    Ajouter une école
                                  </Button>
                                </Link>
                              )}
                            </div>
                          )
                        : (
                            <>
                              <div className="space-y-4">
                                {schools.map(school => (
                                  <Link
                                    key={school.id}
                                    to="/app/schools/$schoolId"
                                    params={{ schoolId: school.id }}
                                    className="block"
                                  >
                                    <div className="flex items-center justify-between p-6 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                                      <div className="flex items-center space-x-4">
                                        {/* School Logo/Avatar */}
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                          <IconSchool className="h-6 w-6 text-primary" />
                                        </div>

                                        {/* School Info */}
                                        <div>
                                          <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold">{school.name}</h3>
                                            {getStatusBadge(school.status)}
                                          </div>
                                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                            <span className="font-mono bg-muted px-2 py-1 rounded">{school.code}</span>
                                            {school.address && (
                                              <div className="flex items-center gap-1">
                                                <IconMapPin className="h-3 w-3" />
                                                {school.address}
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                            {school.email && (
                                              <div className="flex items-center gap-1">
                                                <IconMail className="h-3 w-3" />
                                                {school.email}
                                              </div>
                                            )}
                                            {school.phone && (
                                              <div className="flex items-center gap-1">
                                                <IconPhone className="h-3 w-3" />
                                                {school.phone}
                                              </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                              <IconCalendar className="h-3 w-3" />
                                              Rejoint
                                              {' '}
                                              {new Date(school.createdAt).toLocaleDateString()}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Actions */}
                                      <div className="flex items-center space-x-2">
                                        <Button variant="ghost" size="icon">
                                          <IconDots className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>

                              {/* Pagination */}
                              {pagination && pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                  <div className="text-sm text-muted-foreground">
                                    Affichage de
                                    {' '}
                                    {(page - 1) * limit + 1}
                                    {' '}
                                    à
                                    {' '}
                                    {Math.min(page * limit, pagination.total)}
                                    {' '}
                                    sur
                                    {' '}
                                    {pagination.total}
                                    {' '}
                                    écoles
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handlePageChange(page - 1)}
                                      disabled={!pagination.hasPrev}
                                    >
                                      Précédent
                                    </Button>
                                    <span className="text-sm">
                                      Page
                                      {' '}
                                      {page}
                                      {' '}
                                      sur
                                      {' '}
                                      {pagination.totalPages}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handlePageChange(page + 1)}
                                      disabled={!pagination.hasNext}
                                    >
                                      Suivant
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </>
                          )
                    )
              )}
        </CardContent>
      </Card>
    </div>
  )
}
