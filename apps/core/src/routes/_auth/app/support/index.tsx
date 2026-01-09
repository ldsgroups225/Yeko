import {
  IconAlertCircle,
  IconCircleCheck,
  IconClock,
  IconHelpCircle,
  IconMail,
  IconMessage,
  IconPhone,
  IconPlus,
  IconSearch,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { useEffect } from 'react'
import { useLogger } from '@/lib/logger'

export const Route = createFileRoute('/_auth/app/support/')({
  component: Support,
})

function Support() {
  const { logger } = useLogger()

  useEffect(() => {
    logger.info('Support page viewed', {
      page: 'support',
      timestamp: new Date().toISOString(),
    })
  }, [logger])

  // Mock data for demonstration - will be replaced with real data from Phase 5+
  const supportStats = {
    totalTickets: 234,
    openTickets: 45,
    inProgressTickets: 12,
    resolvedTickets: 177,
    averageResolutionTime: '2.3 hours',
    satisfactionScore: 4.6,
  }

  const recentTickets = [
    {
      id: 1,
      title: 'Impossible d\'accéder aux notes des étudiants',
      school: 'Lycée Saint-Exupéry',
      category: 'Problème Technique',
      priority: 'Haute',
      status: 'open',
      createdAt: '2025-01-22 14:30',
      lastUpdate: '2025-01-22 16:45',
      assignee: 'Jean Dupont',
    },
    {
      id: 2,
      title: 'Demande de modification de programme',
      school: 'Collège Jean-Moulin',
      category: 'Demande de Fonctionnalité',
      priority: 'Moyenne',
      status: 'in_progress',
      createdAt: '2025-01-22 11:20',
      lastUpdate: '2025-01-22 15:30',
      assignee: 'Jeanne Martin',
    },
    {
      id: 3,
      title: 'Problème d\'authentification',
      school: 'Ecole Primaire Victor Hugo',
      category: 'Authentification',
      priority: 'Haute',
      status: 'resolved',
      createdAt: '2025-01-22 09:15',
      lastUpdate: '2025-01-22 10:30',
      assignee: 'Robert Bernard',
    },
    {
      id: 4,
      title: 'Erreur de génération de bulletin',
      school: 'Lycée Marie Curie',
      category: 'Rapport de Bogue',
      priority: 'Moyenne',
      status: 'open',
      createdAt: '2025-01-21 16:45',
      lastUpdate: '2025-01-21 16:45',
      assignee: 'Non assigné',
    },
  ]

  const categories = [
    { name: 'Problème Technique', count: 89, variant: 'destructive' as const },
    { name: 'Demande de Fonctionnalité', count: 45, variant: 'default' as const },
    { name: 'Rapport de Bogue', count: 67, variant: 'secondary' as const },
    { name: 'Authentification', count: 33, variant: 'secondary' as const },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <Badge variant="destructive">
            <IconAlertCircle className="mr-1 h-3 w-3" />
            Ouvert
          </Badge>
        )
      case 'in_progress':
        return (
          <Badge variant="secondary">
            <IconClock className="mr-1 h-3 w-3" />
            En Cours
          </Badge>
        )
      case 'resolved':
        return (
          <Badge variant="default">
            <IconCircleCheck className="mr-1 h-3 w-3" />
            Résolu
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Haute':
        return 'text-destructive bg-destructive/10 dark:bg-destructive/20'
      case 'Moyenne':
        return 'text-secondary bg-secondary/10 dark:bg-secondary/20'
      case 'Faible':
        return 'text-primary bg-primary/10 dark:bg-primary/20'
      default:
        return 'text-muted-foreground bg-muted dark:bg-muted/80'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support & CRM</h1>
          <p className="text-muted-foreground">
            Gérer les tickets de support et les relations clients pour les écoles partenaires
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <IconTrendingUp className="h-4 w-4" />
            Analytiques
          </Button>
          <Button className="gap-2">
            <IconPlus className="h-4 w-4" />
            Créer un Ticket
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des Tickets</CardTitle>
            <IconHelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportStats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">Depuis le début</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ouverts</CardTitle>
            <IconAlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportStats.openTickets}</div>
            <p className="text-xs text-muted-foreground">Nécessitent une attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportStats.inProgressTickets}</div>
            <p className="text-xs text-muted-foreground">En cours de traitement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolus</CardTitle>
            <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportStats.resolvedTickets}</div>
            <p className="text-xs text-muted-foreground">Terminés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps de Résolution</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportStats.averageResolutionTime}</div>
            <p className="text-xs text-muted-foreground">Moyenne</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {supportStats.satisfactionScore}
              /5
            </div>
            <p className="text-xs text-muted-foreground">Note utilisateur</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Tickets */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tickets de Support Récents</CardTitle>
            <CardDescription>
              Dernières demandes de support des écoles partenaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconMessage className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium truncate">{ticket.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{ticket.school}</span>
                        <span>•</span>
                        <span>{ticket.category}</span>
                        <span>•</span>
                        <span>
                          Assigné à:
                          {ticket.assignee}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>
                          Créé:
                          {ticket.createdAt}
                        </span>
                        <span>•</span>
                        <span>
                          Mis à jour:
                          {ticket.lastUpdate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Catégories de Tickets</CardTitle>
            <CardDescription>
              Distribution des tickets par catégorie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map(category => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={category.variant}>
                      {category.count}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-4">Actions Rapides</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                  <IconPhone className="h-4 w-4" />
                  Appeler l'Équipe de Support
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                  <IconMail className="h-4 w-4" />
                  Modèles d'Email
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                  <IconMessage className="h-4 w-4" />
                  Base de Connaissances
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher des Tickets de Support</CardTitle>
          <CardDescription>
            Trouver des tickets spécifiques par mot-clé, école ou catégorie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher des tickets..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <IconHelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Fonctionnalités de Support Avancées Bientôt Disponibles</h3>
            <p className="text-muted-foreground mb-4">
              Le CRM et système de support complet sera disponible dans la Phase 5: Gestion Scolaire (section CRM)
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Fonctionnalités à venir:</p>
              <ul className="mt-2 space-y-1">
                <li>• Flux de travail avancé de gestion des tickets</li>
                <li>• Intégration de la base de connaissances</li>
                <li>• Assignation automatique des tickets</li>
                <li>• Enquêtes de satisfaction client</li>
                <li>• Analytiques de performance de l'équipe de support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
