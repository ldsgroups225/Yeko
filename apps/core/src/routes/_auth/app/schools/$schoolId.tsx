import {
  IconArrowLeft,
  IconBuilding,
  IconCalendar,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconCreditCard,
  IconDotsVertical,
  IconEdit,
  IconMail,
  IconMapPin,
  IconMessage,
  IconPhone,
  IconSchool,
  IconShield,
  IconUsers,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Separator } from '@workspace/ui/components/separator'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CreateAdminDialog } from '@/components/schools/create-admin-dialog'
import { schoolUsersQueryOptions } from '@/integrations/tanstack-query/school-users-options'
import { removeUserMutationOptions, suspendUserMutationOptions } from '@/integrations/tanstack-query/user-actions-options'
import { deleteSchoolMutationOptions, schoolQueryOptions } from '@/integrations/tanstack-query/schools-options'
import { useLogger } from '@/lib/logger'
import { parseServerFnError } from '@/utils/error-handlers'
import { formatDate } from '@/utils/formatDate'

export const Route = createFileRoute('/_auth/app/schools/$schoolId')({
  component: SchoolDetails,
})

function SchoolDetails() {
  const { schoolId } = Route.useParams()
  const { logger } = useLogger()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUserForSuspend, setSelectedUserForSuspend] = useState<{ id: string; name: string } | null>(null)
  const [selectedUserForRemove, setSelectedUserForRemove] = useState<{ id: string; name: string } | null>(null)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)

  const { data: school, isLoading, error } = useQuery(schoolQueryOptions(schoolId))
  const { data: usersData, isLoading: usersLoading } = useQuery(schoolUsersQueryOptions({ schoolId }))

  // Process users data
  const users = usersData?.data?.users || []
  const adminCount = users.filter(user => user.roles?.includes('school_administrator')).length
  const teacherCount = users.filter(user => user.roles?.includes('teacher')).length
  const staffCount = users.filter(user =>
    user.roles?.includes('staff')
    || (user.roles && !user.roles.includes('school_administrator') && !user.roles.includes('teacher')),
  ).length

  // Delete mutation
  const deleteSchoolMutation = useMutation({
    ...deleteSchoolMutationOptions,
    onSuccess: () => {
      logger.info('School deleted successfully', {
        schoolId,
        action: 'delete_school_success',
        timestamp: new Date().toISOString(),
      })

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['schools'] })
      queryClient.invalidateQueries({ queryKey: ['schoolUsers'] })

      // Navigate to schools list
      navigate({ to: '/app/schools' })
    },
    onError: (error: any) => {
      const message = parseServerFnError(error, 'Une erreur est survenue lors de la suppression de l\'école')
      toast.error(message)
      console.error('School deletion failed:', error)
    },
  })

  const handleDelete = () => {
    deleteSchoolMutation.mutate({ id: schoolId })
  }

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    ...suspendUserMutationOptions,
    onSuccess: () => {
      logger.info('User suspended successfully', {
        schoolId,
        userId: selectedUserForSuspend?.id,
        action: 'suspend_user_success',
        timestamp: new Date().toISOString(),
      })
      toast.success('Utilisateur suspendu avec succès')
      queryClient.invalidateQueries({ queryKey: ['schoolUsers'] })
      setSuspendDialogOpen(false)
      setSelectedUserForSuspend(null)
    },
    onError: (error: any) => {
      const message = parseServerFnError(error, 'Une erreur est survenue lors de la suspension de l\'utilisateur')
      toast.error(message)
      console.error('User suspension failed:', error)
    },
  })

  const handleSuspendUser = () => {
    if (selectedUserForSuspend) {
      suspendUserMutation.mutate({ userId: selectedUserForSuspend.id, schoolId })
    }
  }

  // Remove user mutation
  const removeUserMutation = useMutation({
    ...removeUserMutationOptions,
    onSuccess: () => {
      logger.info('User removed successfully', {
        schoolId,
        userId: selectedUserForRemove?.id,
        action: 'remove_user_success',
        timestamp: new Date().toISOString(),
      })
      toast.success('Utilisateur supprimé avec succès')
      queryClient.invalidateQueries({ queryKey: ['schoolUsers'] })
      setRemoveDialogOpen(false)
      setSelectedUserForRemove(null)
    },
    onError: (error: any) => {
      const message = parseServerFnError(error, 'Une erreur est survenue lors de la suppression de l\'utilisateur')
      toast.error(message)
      console.error('User removal failed:', error)
    },
  })

  const handleRemoveUser = () => {
    if (selectedUserForRemove) {
      removeUserMutation.mutate({ userId: selectedUserForRemove.id, schoolId })
    }
  }

  const openSuspendDialog = (user: { id: string; name: string }) => {
    setSelectedUserForSuspend(user)
    setSuspendDialogOpen(true)
  }

  const openRemoveDialog = (user: { id: string; name: string }) => {
    setSelectedUserForRemove(user)
    setRemoveDialogOpen(true)
  }

  useEffect(() => {
    if (school) {
      logger.info('School details viewed', {
        schoolId,
        schoolName: school.name,
        timestamp: new Date().toISOString(),
      })
    }
  }, [school, schoolId, logger])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Info cards skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {['overview', 'contact', 'stats', 'settings'].map(type => (
            <div key={`skeleton-${type}`} className="space-y-2">
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !school) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="text-destructive font-medium">
          {error?.message || 'École non trouvée'}
        </div>
        <Link to="/app/schools">
          <Button variant="outline">Retour à la liste</Button>
        </Link>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default">
            <IconCircleCheck className="mr-1 h-3 w-3" />
            Active
          </Badge>
        )
      case 'inactive':
        return (
          <Badge variant="secondary">
            <IconClock className="mr-1 h-3 w-3" />
            Inactive
          </Badge>
        )
      case 'suspended':
        return (
          <Badge variant="destructive">
            <IconCircleX className="mr-1 h-3 w-3" />
            Suspendue
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/app/schools">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <IconArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <IconBuilding className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{school.name}</h1>
                {getStatusBadge(school.status)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">
                  {school.code}
                </span>
                <span>•</span>
                <span>
                  Rejoint le
                  <span className="ml-1 capitalize">{formatDate(school.createdAt, 'MEDIUM')}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/app/schools/$schoolId/edit" params={{ schoolId }}>
            <Button variant="outline" className="gap-2">
              <IconEdit className="h-4 w-4" />
              Modifier
            </Button>
          </Link>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <IconCircleX className="h-4 w-4" />
            Supprimer
          </Button>
          <Button variant="ghost" size="icon">
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="years">Années Scolaires</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
          <TabsTrigger value="support">Support & CRM</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Coordonnées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <IconMapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Adresse</p>
                    <p className="text-sm text-muted-foreground">
                      {school.address || 'Non renseignée'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <IconPhone className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Téléphone</p>
                    <p className="text-sm text-muted-foreground">
                      {school.phone || 'Non renseigné'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <IconMail className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {school.email || 'Non renseigné'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Statistiques Rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconUsers className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Élèves inscrits</span>
                  </div>
                  <span className="font-bold">--</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconSchool className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Enseignants</span>
                  </div>
                  <span className="font-bold">--</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconCreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Paiements (Mois)</span>
                  </div>
                  <span className="font-bold">--</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Utilisateurs de l'école</CardTitle>
                  <CardDescription>
                    Administrateurs, enseignants et personnel rattachés à cette école.
                  </CardDescription>
                </div>
                <CreateAdminDialog schoolId={schoolId} schoolName={school.name} />
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading
                ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        {[1, 2, 3].map(i => (
                          <Card key={i}>
                            <CardContent className="pt-6">
                              <Skeleton className="h-8 w-16 mb-2" />
                              <Skeleton className="h-4 w-24" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-48" />
                            </div>
                            <Skeleton className="h-6 w-20" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                : users.length === 0
                  ? (
                      <div className="space-y-4">
                        {/* User roles summary */}
                        <div className="grid gap-4 md:grid-cols-3">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold">0</div>
                              <p className="text-xs text-muted-foreground">Administrateurs</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold">0</div>
                              <p className="text-xs text-muted-foreground">Enseignants</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold">0</div>
                              <p className="text-xs text-muted-foreground">Personnel</p>
                            </CardContent>
                          </Card>
                        </div>

                        <Separator />

                        {/* Empty state */}
                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                          <IconUsers className="h-12 w-12 mb-4 opacity-20" />
                          <p className="font-medium">Aucun utilisateur pour le moment</p>
                          <p className="text-sm">Commencez par ajouter des administrateurs et enseignants</p>
                        </div>
                      </div>
                    )
                  : (
                      <div className="space-y-4">
                        {/* User roles summary */}
                        <div className="grid gap-4 md:grid-cols-3">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold">{adminCount}</div>
                              <p className="text-xs text-muted-foreground">Administrateurs</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold">{teacherCount}</div>
                              <p className="text-xs text-muted-foreground">Enseignants</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold">{staffCount}</div>
                              <p className="text-xs text-muted-foreground">Personnel</p>
                            </CardContent>
                          </Card>
                        </div>

                        <Separator />

                        {/* User list */}
                        <div className="space-y-2">
                          {users.map(user => (
                            <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <span className="text-sm font-medium text-primary">
                                  {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium truncate">{user.name}</p>
                                  <Badge variant="outline" className="text-xs">
                                    {user.roles?.[0] || 'Utilisateur'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                {user.phone && (
                                  <p className="text-xs text-muted-foreground">{user.phone}</p>
                                )}
                              </div>
                                <div className="flex items-center gap-2">
                                <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                  {user.status === 'active' ? 'Actif' : user.status === 'inactive' ? 'Inactif' : 'Suspendu'}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <IconDotsVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => openSuspendDialog({ id: user.id, name: user.name })}
                                      disabled={user.status === 'suspended'}
                                    >
                                      Suspendre
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => openRemoveDialog({ id: user.id, name: user.name })}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      Supprimer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Years Tab */}
        <TabsContent value="years" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Années Scolaires</CardTitle>
                  <CardDescription>
                    Historique et configuration des années scolaires.
                  </CardDescription>
                </div>
                <Button>
                  <IconCalendar className="h-4 w-4 mr-2" />
                  Nouvelle année
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current year highlight */}
                <Card className="border-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">Année en cours</h3>
                          <Badge>Actif</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Configuration de l'année académique actuelle
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Configurer</Button>
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                {/* Years history placeholder */}
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <IconCalendar className="h-12 w-12 mb-4 opacity-20" />
                  <p className="font-medium">Aucune année scolaire configurée</p>
                  <p className="text-sm">Créez votre première année scolaire pour commencer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Configuration de l'École</CardTitle>
                  <CardDescription>
                    Paramètres spécifiques et fonctionnalités activées.
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <IconEdit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Settings sections */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Modules Activés</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">Gestion des notes</span>
                        <Badge variant="outline">Activé</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">Gestion des absences</span>
                        <Badge variant="outline">Activé</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">Paiements en ligne</span>
                        <Badge variant="secondary">Désactivé</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">Messagerie</span>
                        <Badge variant="outline">Activé</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-3">Paramètres Avancés</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <details className="cursor-pointer">
                        <summary className="text-sm font-medium">Voir la configuration JSON</summary>
                        <pre className="text-xs font-mono mt-2 overflow-auto">
                          {JSON.stringify(school.settings, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconMessage className="h-5 w-5" />
                  Notes CRM
                </CardTitle>
                <CardDescription>Notes internes sur cette école</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <textarea
                      className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Ajouter une note..."
                    />
                    <Button size="sm" className="self-end">Ajouter la note</Button>
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Aucune note pour le moment.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconShield className="h-5 w-5" />
                  Tickets de Support
                </CardTitle>
                <CardDescription>Historique des demandes de support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground text-center py-8">
                  Aucun ticket ouvert.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer l'école"
        description={`Êtes-vous sûr de vouloir supprimer "${school.name}" ? Cette action est irréversible.`}
        confirmText={school.code}
        onConfirm={handleDelete}
        isLoading={deleteSchoolMutation.isPending}
      />

      {/* Suspend User Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={suspendDialogOpen}
        onOpenChange={(open) => {
          setSuspendDialogOpen(open)
          if (!open) {
            setSelectedUserForSuspend(null)
          }
        }}
        title="Suspendre l'utilisateur"
        description={`Êtes-vous sûr de vouloir suspendre "${selectedUserForSuspend?.name}" ? L'utilisateur ne pourra plus se connecter.`}
        confirmText="Suspendre"
        onConfirm={handleSuspendUser}
        isLoading={suspendUserMutation.isPending}
      />

      {/* Remove User Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={removeDialogOpen}
        onOpenChange={(open) => {
          setRemoveDialogOpen(open)
          if (!open) {
            setSelectedUserForRemove(null)
          }
        }}
        title="Supprimer l'utilisateur"
        description={`Êtes-vous sûr de vouloir supprimer "${selectedUserForRemove?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        onConfirm={handleRemoveUser}
        isLoading={removeUserMutation.isPending}
      />
    </div>
  )
}
