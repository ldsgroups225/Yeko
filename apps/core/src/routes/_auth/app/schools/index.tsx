import { createFileRoute } from '@tanstack/react-router'
import {
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  School,
  Search,
  XCircle,
} from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useLogger } from '@/lib/logger'

export const Route = createFileRoute('/_auth/app/schools/')({
  component: Schools,
})

function Schools() {
  const { logger } = useLogger()

  React.useEffect(() => {
    logger.info('Schools page viewed', {
      page: 'schools',
      timestamp: new Date().toISOString(),
    })
  }, [logger])

  // Mock data for demonstration - will be replaced with real data from Phase 5+
  const schools = [
    {
      id: 1,
      name: 'Lycée Saint-Exupéry',
      code: 'LYCE-001',
      address: '123 Avenue de la République, Paris',
      phone: '+33 1 23 45 67 89',
      email: 'contact@lycee-saint-exupery.fr',
      status: 'active',
      students: 1200,
      teachers: 85,
      joinedDate: '2025-01-15',
      logoUrl: null,
    },
    {
      id: 2,
      name: 'Collège Jean-Moulin',
      code: 'CLGE-002',
      address: '456 Rue de la Paix, Lyon',
      phone: '+33 4 12 34 56 78',
      email: 'info@college-jean-moulin.fr',
      status: 'pending',
      students: 800,
      teachers: 60,
      joinedDate: '2025-01-14',
      logoUrl: null,
    },
    {
      id: 3,
      name: 'Ecole Primaire Victor Hugo',
      code: 'PRIM-003',
      address: '789 Boulevard Voltaire, Marseille',
      phone: '+33 4 98 76 54 32',
      email: 'contact@ecole-victor-hugo.fr',
      status: 'active',
      students: 450,
      teachers: 35,
      joinedDate: '2025-01-13',
      logoUrl: null,
    },
    {
      id: 4,
      name: 'Lycée Marie Curie',
      code: 'LYCE-004',
      address: '321 Rue de la Science, Toulouse',
      phone: '+33 5 11 22 33 44',
      email: 'admin@lycee-marie-curie.fr',
      status: 'suspended',
      students: 980,
      teachers: 72,
      joinedDate: '2025-01-12',
      logoUrl: null,
    },
  ]

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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une école
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des écoles</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools.length}</div>
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
              {schools.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Actuellement actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Écoles en Attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schools.filter(s => s.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des Étudiants</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schools.reduce((sum, s) => sum + s.students, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Dans toutes les écoles
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
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher des écoles..."
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

      {/* Schools List */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les Écoles</CardTitle>
          <CardDescription>
            Liste complète des écoles partenaires dans votre système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schools.map(school => (
              <div
                key={school.id}
                className="flex items-center justify-between p-6 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {/* School Logo/Avatar */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <School className="h-6 w-6 text-primary" />
                  </div>

                  {/* School Info */}
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{school.name}</h3>
                      {getStatusBadge(school.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="font-mono bg-muted px-2 py-1 rounded">{school.code}</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {school.address}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {school.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {school.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Rejoint
                        {' '}
                        {school.joinedDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* School Stats & Actions */}
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-2xl font-bold">{school.students.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Étudiants</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{school.teachers}</div>
                    <div className="text-sm text-muted-foreground">Enseignants</div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
