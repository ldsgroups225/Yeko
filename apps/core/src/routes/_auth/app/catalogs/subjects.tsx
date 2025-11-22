import { createFileRoute } from '@tanstack/react-router'
import {
  Beaker,
  BookOpen,
  Briefcase,
  Calculator,
  Download,
  Dumbbell,
  Edit,
  Filter,
  Globe,
  Music,
  Palette,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useLogger } from '@/lib/logger'

export const Route = createFileRoute('/_auth/app/catalogs/subjects')({
  component: SubjectsCatalog,
})

function SubjectsCatalog() {
  const { logger } = useLogger()

  React.useEffect(() => {
    logger.info('Subjects catalog page viewed', {
      page: 'subjects-catalog',
      timestamp: new Date().toISOString(),
    })
  }, [logger])

  // Mock data for demonstration - will be replaced with real data from Phase 6+
  const subjects = [
    {
      id: 1,
      name: 'Mathématiques',
      shortName: 'Maths',
      category: 'Scientifique',
      description: 'Mathématiques avancées incluant algèbre, géométrie, calcul infinitésimal',
      gradeLevels: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'],
      icon: Calculator,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      status: 'active',
      createdAt: '2025-01-10',
      updatedAt: '2025-01-15',
    },
    {
      id: 2,
      name: 'Physique-Chimie',
      shortName: 'PC',
      category: 'Scientifique',
      description: 'Physique et chimie incluant les travaux pratiques',
      gradeLevels: ['4ème', '3ème', '2nde', '1ère', 'Terminale'],
      icon: Beaker,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      status: 'active',
      createdAt: '2025-01-10',
      updatedAt: '2025-01-14',
    },
    {
      id: 3,
      name: 'Français',
      shortName: 'Fr',
      category: 'Littéraire',
      description: 'Langue française, littérature et composition',
      gradeLevels: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'],
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      status: 'active',
      createdAt: '2025-01-10',
      updatedAt: '2025-01-10',
    },
    {
      id: 4,
      name: 'Histoire-Géographie',
      shortName: 'HG',
      category: 'Littéraire',
      description: 'Histoire et géographie de la France et du monde',
      gradeLevels: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'],
      icon: Globe,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      status: 'active',
      createdAt: '2025-01-11',
      updatedAt: '2025-01-11',
    },
    {
      id: 5,
      name: 'Education Physique et Sportive',
      shortName: 'EPS',
      category: 'Sportif',
      description: 'Éducation physique et activités sportives',
      gradeLevels: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'],
      icon: Dumbbell,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
      status: 'active',
      createdAt: '2025-01-11',
      updatedAt: '2025-01-13',
    },
    {
      id: 6,
      name: 'Arts Plastiques',
      shortName: 'Arts',
      category: 'Artistique',
      description: 'Arts visuels, dessin, peinture et expression artistique',
      gradeLevels: ['6ème', '5ème', '4ème', '3ème'],
      icon: Palette,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950',
      status: 'active',
      createdAt: '2025-01-12',
      updatedAt: '2025-01-12',
    },
    {
      id: 7,
      name: 'Musique',
      shortName: 'Mus',
      category: 'Artistique',
      description: 'Théorie musicale, écoute et compétences pratiques',
      gradeLevels: ['6ème', '5ème', '4ème', '3ème'],
      icon: Music,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
      status: 'active',
      createdAt: '2025-01-12',
      updatedAt: '2025-01-12',
    },
    {
      id: 8,
      name: 'Technologie',
      shortName: 'Tech',
      category: 'Technique',
      description: 'Éducation technologique et culture numérique',
      gradeLevels: ['6ème', '5ème', '4ème', '3ème'],
      icon: Briefcase,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-950',
      status: 'active',
      createdAt: '2025-01-13',
      updatedAt: '2025-01-13',
    },
  ]

  const categories = [
    { name: 'Scientifique', count: subjects.filter(s => s.category === 'Scientifique').length },
    { name: 'Littéraire', count: subjects.filter(s => s.category === 'Littéraire').length },
    { name: 'Sportif', count: subjects.filter(s => s.category === 'Sportif').length },
    { name: 'Artistique', count: subjects.filter(s => s.category === 'Artistique').length },
    { name: 'Technique', count: subjects.filter(s => s.category === 'Technique').length },
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Scientifique': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Littéraire': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'Sportif': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'Artistique': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
      case 'Technique': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalogue des Matières</h1>
          <p className="text-muted-foreground">
            Catalogue global des matières disponibles pour toutes les écoles partenaires
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importer CSV
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter une Matière
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des Matières</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground">
              Toutes catégories
            </p>
          </CardContent>
        </Card>

        {categories.slice(0, 3).map(category => (
          <Card key={category.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{category.count}</div>
              <p className="text-xs text-muted-foreground">
                matières
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher & Filtrer</CardTitle>
          <CardDescription>
            Trouver des matières spécifiques ou filtrer par catégorie et niveau de classe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher des matières..."
                className="pl-9"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu des Catégories</CardTitle>
          <CardDescription>
            Distribution des matières par catégorie éducative
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {categories.map(category => (
              <div key={category.name} className="text-center">
                <div className="text-2xl font-bold">{category.count}</div>
                <Badge className={`mt-1 ${getCategoryColor(category.name)}`}>
                  {category.name}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subjects Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les Matières</CardTitle>
          <CardDescription>
            Catalogue complet des matières avec leurs détails et niveaux de classe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map(subject => (
              <div
                key={subject.id}
                className="border rounded-lg p-6 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${subject.bgColor}`}>
                    <subject.icon className={`h-6 w-6 ${subject.color}`} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{subject.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {subject.shortName}
                    </Badge>
                  </div>

                  <Badge className={`text-xs ${getCategoryColor(subject.category)}`}>
                    {subject.category}
                  </Badge>

                  <p className="text-sm text-muted-foreground mt-2">
                    {subject.description}
                  </p>

                  <div className="space-y-2 mt-4">
                    <div className="text-xs font-medium text-muted-foreground">Niveaux de Classe:</div>
                    <div className="flex flex-wrap gap-1">
                      {subject.gradeLevels.map(grade => (
                        <span
                          key={grade}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground"
                        >
                          {grade}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                    <span>
                      Créé:
                      {subject.createdAt}
                    </span>
                    <span>
                      Mis à jour:
                      {subject.updatedAt}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
