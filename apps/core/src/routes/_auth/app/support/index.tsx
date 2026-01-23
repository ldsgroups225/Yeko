import {
  IconAlertCircle,
  IconCircleCheck,
  IconClock,
  IconHelpCircle,
  IconLoader,
  IconMail,
  IconMessage,
  IconPhone,
  IconPlus,
  IconSearch,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { useEffect } from "react";
import {
  recentTicketsQueryOptions,
  ticketStatsQueryOptions,
} from "@/integrations/tanstack-query/support-options";
import { useLogger } from "@/lib/logger";

export const Route = createFileRoute("/_auth/app/support/")({
  component: Support,
});

function Support() {
  const { logger } = useLogger();

  useEffect(() => {
    logger.info("Support page viewed", {
      page: "support",
      timestamp: new Date().toISOString(),
    });
  }, [logger]);

  // Fetch real data using TanStack Query
  const { data: stats, isLoading: statsLoading } = useQuery(
    ticketStatsQueryOptions(),
  );
  const { data: recentTicketsData, isLoading: ticketsLoading } = useQuery(
    recentTicketsQueryOptions(5),
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="destructive">
            <IconAlertCircle className="mr-1 h-3 w-3" />
            Ouvert
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="secondary">
            <IconClock className="mr-1 h-3 w-3" />
            En Cours
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="default">
            <IconCircleCheck className="mr-1 h-3 w-3" />
            Résolu
          </Badge>
        );
      case "closed":
        return (
          <Badge variant="outline">
            <IconCircleCheck className="mr-1 h-3 w-3" />
            Fermé
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      case "high":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "low":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const formatPriority = (priority: string): string => {
    switch (priority) {
      case "critical":
        return "Critique";
      case "high":
        return "Haute";
      case "medium":
        return "Moyenne";
      case "low":
        return "Faible";
      default:
        return priority;
    }
  };

  const formatCategory = (category: string): string => {
    switch (category) {
      case "technical":
        return "Problème Technique";
      case "feature":
        return "Demande de Fonctionnalité";
      case "bug":
        return "Rapport de Bogue";
      case "billing":
        return "Facturation";
      case "account":
        return "Compte";
      case "other":
        return "Autre";
      default:
        return category;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support & CRM</h1>
          <p className="text-muted-foreground">
            Gérer les tickets de support et les relations clients pour les
            écoles partenaires
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
            <CardTitle className="text-sm font-medium">
              Total des Tickets
            </CardTitle>
            <IconHelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 w-16 animate-pulse bg-muted rounded" />
            ) : (
              <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Depuis le début</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ouverts</CardTitle>
            <IconAlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 w-16 animate-pulse bg-muted rounded" />
            ) : (
              <div className="text-2xl font-bold">{stats?.open ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Nécessitent une attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 w-16 animate-pulse bg-muted rounded" />
            ) : (
              <div className="text-2xl font-bold">{stats?.inProgress ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              En cours de traitement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolus</CardTitle>
            <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 w-16 animate-pulse bg-muted rounded" />
            ) : (
              <div className="text-2xl font-bold">{stats?.resolved ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Terminés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Temps de Résolution
            </CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 w-20 animate-pulse bg-muted rounded" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.averageResolutionTime
                  ? `${stats.averageResolutionTime.toFixed(1)}h`
                  : "N/A"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Moyenne</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 w-16 animate-pulse bg-muted rounded" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.satisfactionScore
                  ? `${stats.satisfactionScore.toFixed(1)}/5`
                  : "N/A"}
              </div>
            )}
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
            {ticketsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <div className="h-10 w-10 animate-pulse bg-muted rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 animate-pulse bg-muted rounded" />
                      <div className="h-3 w-1/2 animate-pulse bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTicketsData && recentTicketsData.length > 0 ? (
              <div className="space-y-4">
                {recentTicketsData.map((ticket) => (
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
                          <h4 className="text-sm font-medium truncate">
                            {ticket.title}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}
                          >
                            {formatPriority(ticket.priority)}
                          </span>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {ticket.schoolName && (
                            <>
                              <span>{ticket.schoolName}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{formatCategory(ticket.category)}</span>
                          {ticket.assigneeName && (
                            <>
                              <span>•</span>
                              <span>
                                Assigné à:
                                {ticket.assigneeName}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>
                            Créé:{" "}
                            {ticket.createdAt instanceof Date
                              ? ticket.createdAt.toLocaleDateString("fr-FR")
                              : String(ticket.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <IconMessage className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun ticket de support disponible</p>
              </div>
            )}
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
            <div className="text-center py-8 text-muted-foreground">
              <IconLoader className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
              <p>Chargement des catégories...</p>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-4">Actions Rapides</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  size="sm"
                >
                  <IconPhone className="h-4 w-4" />
                  Appeler l'Équipe de Support
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  size="sm"
                >
                  <IconMail className="h-4 w-4" />
                  Modèles d'Email
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  size="sm"
                >
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
            <Input placeholder="Rechercher des tickets..." className="pl-9" />
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <IconCircleCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Système de Support Opérationnel
              </h3>
              <p className="text-muted-foreground">
                Le système de support et CRM est maintenant actif avec{" "}
                {stats?.total ?? 0} tickets traités.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
