import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  Award,
  BookOpen,
  Database,
  GraduationCap,
  Plus,
  Search,
  TrendingUp,
} from 'lucide-react'
import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { catalogStatsQueryOptions } from '@/integrations/tanstack-query/catalogs-options'
import { useLogger } from '@/lib/logger'

export const Route = createFileRoute('/_auth/app/catalogs/')({
  component: Catalogs,
})

function Catalogs() {
  const navigate = useNavigate()
  const { logger } = useLogger()

  // Fetch real catalog stats
  const { data: catalogStats, isLoading } = useQuery(catalogStatsQueryOptions())

  useEffect(() => {
    logger.info('Catalogs page viewed', {
      page: 'catalogs',
      timestamp: new Date().toISOString(),
    })
  }, [logger])

  const catalogSections = [
    {
      title: 'Niveaux et Filières d\'Éducation',
      description: 'Définir les niveaux éducatifs (Primaire, Secondaire, etc.) et les filières (Générale, Technique)',
      icon: GraduationCap,
      href: '/app/catalogs/tracks',
      stats: isLoading ? '...' : `${catalogStats?.educationLevels || 0} niveaux, ${catalogStats?.tracks || 0} filières`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Niveaux et Séries',
      description: 'Gérer les niveaux de classe (6ème à Terminale) et les séries académiques (C, D, A, etc.)',
      icon: Award,
      href: '/app/catalogs/grades',
      stats: isLoading ? '...' : `${catalogStats?.grades || 0} classes, ${catalogStats?.series || 0} séries`,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      title: 'Matières',
      description: 'Catalogue global de toutes les matières enseignées dans les écoles (Mathématiques, Physique, etc.)',
      icon: BookOpen,
      href: '/app/catalogs/subjects',
      stats: isLoading ? '...' : `${catalogStats?.subjects || 0} matières`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    {
      title: 'Modèles de Programmes',
      description: 'Programmes ministériels et modèles de curriculum pour différentes matières et classes',
      icon: Database,
      href: '/app/catalogs/programs',
      stats: 'Bientôt disponible',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
  ]

  const recentUpdates = [
    { id: 1, action: 'New subject added: "Philosophy"', date: '2025-01-22', user: 'Admin' },
    { id: 2, action: 'Program template updated: "Mathematics 1ère"', date: '2025-01-21', user: 'Admin' },
    { id: 3, action: 'New grade level: "Seconde Professionnelle"', date: '2025-01-20', user: 'Admin' },
    { id: 4, action: 'Coefficient matrix updated for 2025-2026', date: '2025-01-19', user: 'Admin' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalogues Globaux</h1>
          <p className="text-muted-foreground">
            Gérer les catalogues éducatifs et les programmes ministériels utilisés dans toutes les écoles
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Exporter les Catalogues
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Ajout Rapide
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Niveaux d'Éducation</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{catalogStats?.educationLevels || 0}</div>}
            <p className="text-xs text-muted-foreground">
              Niveaux disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des Filières</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{catalogStats?.tracks || 0}</div>}
            <p className="text-xs text-muted-foreground">
              Filières académiques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matières</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{catalogStats?.subjects || 0}</div>}
            <p className="text-xs text-muted-foreground">
              Catalogue global
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes & Séries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{(catalogStats?.grades || 0) + (catalogStats?.series || 0)}</div>}
            <p className="text-xs text-muted-foreground">
              Niveaux et séries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher les Catalogues</CardTitle>
          <CardDescription>
            Trouver des éléments spécifiques dans tous les catalogues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher des matières, programmes, classes..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Catalog Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {catalogSections.map(section => (
          <Card key={section.title} className={`border-l-4 ${section.borderColor}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${section.bgColor}`}>
                  <section.icon className={`h-6 w-6 ${section.color}`} />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {section.stats}
                </Badge>
              </div>
              <CardTitle className="text-xl">{section.title}</CardTitle>
              <CardDescription className="text-base">
                {section.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full gap-2"
                onClick={() => navigate({ to: section.href })}
              >
                Gérer
                {' '}
                {section.title.split(' ')[0]}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mises à Jour Récentes</CardTitle>
            <CardDescription>
              Derniers changements apportés aux catalogues globaux
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUpdates.map(update => (
                <div key={update.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{update.action}</p>
                    <p className="text-xs text-muted-foreground">
                      par
                      {update.user}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{update.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilisation des Catalogues</CardTitle>
            <CardDescription>
              Comment les écoles utilisent les modèles de catalogues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Matières adoptées par les écoles</span>
                <Badge variant="outline">42/45</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Modèles de programmes utilisés</span>
                <Badge variant="outline">25/28</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Écoles utilisant les catalogues</span>
                <Badge variant="outline">115/127</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mises à jour nécessaires</span>
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  3 éléments
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
