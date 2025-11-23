import type { School } from '@repo/data-ops'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  SchoolIcon,
  Search,
  Upload,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { schoolsQueryOptions } from '@/integrations/tanstack-query/schools-options'
import { useLogger } from '@/lib/logger'
import { exportSchoolsToExcel, importSchoolsFromExcel } from '@/lib/schools-import-export'

export const Route = createFileRoute('/_auth/app/schools/')({
  component: Schools,
})

function Schools() {
  const { logger } = useLogger()

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
  const { data: schoolsData, isLoading, error } = useQuery(schoolsQueryOptions(queryParams))

  // Fetch schools count for stats
  const { data: allSchoolsData } = useQuery(schoolsQueryOptions({ page: 1, limit: 1000 }))

  useEffect(() => {
    logger.info('Schools page viewed', {
      page: 'schools',
      timestamp: new Date().toISOString(),
      filters: queryParams,
      isLoading,
      error: error?.message,
    })
  }, [logger, queryParams, isLoading, error])

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
  const allSchools: School[] = allSchoolsData?.data || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Active
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            En attente
          </Badge>
        )
      case 'suspended':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="mr-1 h-3 w-3" />
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
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => exportSchoolsToExcel(allSchools)}
            disabled={allSchools.length === 0}
          >
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.xlsx,.xls'
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) {
                  try {
                    const schools = await importSchoolsFromExcel(file)
                    console.warn('Imported schools:', schools)
                    // TODO: Implement bulk create mutation
                    console.warn(`${schools.length} écoles importées avec succès!`, schools)
                  }
                  catch (error) {
                    console.error('Import error:', error)
                    console.error('Erreur lors de l\'importation:', error)
                  }
                }
              }
              input.click()
            }}
          >
            <Upload className="h-4 w-4" />
            Importer
          </Button>
          <Link to="/app/schools/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une école
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des écoles</CardTitle>
            <SchoolIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : allSchools.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Toutes les écoles partenaires
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Écoles Actives</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : allSchools.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Actuellement actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Écoles Inactives</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : allSchools.filter(s => s.status === 'inactive').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Non actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Écoles Suspendues</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : allSchools.filter(s => s.status === 'suspended').length}
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
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher des écoles..."
                className="pl-9"
                value={search}
                onChange={e => handleSearch(e.target.value)}
              />
            </div>

            <Select value={status} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actives</SelectItem>
                <SelectItem value="inactive">Inactives</SelectItem>
                <SelectItem value="suspended">Suspendues</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => handleSort(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
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
          {isLoading
            ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Chargement des écoles...</span>
                </div>
              )
            : (
                error
                  ? (
                      <div className="text-center py-8">
                        <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-red-600">Erreur de chargement</h3>
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
                              <SchoolIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="text-lg font-medium">Aucune école trouvée</h3>
                              <p className="text-muted-foreground">
                                {search || status !== 'all'
                                  ? 'Essayez de modifier vos filtres de recherche.'
                                  : 'Commencez par ajouter votre première école.'}
                              </p>
                              {(!search && status === 'all') && (
                                <Link to="/app/schools/create">
                                  <Button className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
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
                                          <SchoolIcon className="h-6 w-6 text-primary" />
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
                                                <MapPin className="h-3 w-3" />
                                                {school.address}
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                            {school.email && (
                                              <div className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {school.email}
                                              </div>
                                            )}
                                            {school.phone && (
                                              <div className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {school.phone}
                                              </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                              <Calendar className="h-3 w-3" />
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
                                          <MoreHorizontal className="h-4 w-4" />
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
