import type { Role, User } from '@repo/data-ops'
import { hasPermission } from '@repo/data-ops/auth/permissions'
import {
  IconClock,
  IconLoader2,
  IconMail,
  IconSearch,
  IconShieldCheck,
  IconUser,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { useState } from 'react'
import { toast } from 'sonner'
import { getPlatformRoles } from '@/core/functions/roles'
import { assignUserSystemRoles, getPlatformUsers } from '@/core/functions/users'
import { formatDate } from '@/utils/formatDate'

export const Route = createFileRoute('/_auth/app/users/')({
  beforeLoad: ({ context }) => {
    const permissions = context.auth?.permissions
    if (!context.auth?.isAuthenticated || (!context.auth?.isSuperAdmin && !hasPermission(permissions, 'users', 'view'))) {
      throw redirect({
        to: '/unauthorized',
      })
    }
  },
  component: UserManagement,
})

function UserManagement() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false)

  // Roles form state
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])

  const { data: userData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['platform-users', search, page],
    queryFn: () => getPlatformUsers({ data: { search, page, limit: 10 } }),
  })

  const { data: allRoles = [] } = useQuery({
    queryKey: ['platform-roles'],
    queryFn: () => getPlatformRoles({ data: { scope: 'system' } }),
  })

  const assignRolesMutation = useMutation({
    mutationFn: (data: { userId: string, roleIds: string[] }) => assignUserSystemRoles({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-users'] })
      toast.success('Rôles mis à jour avec succès')
      setIsRolesDialogOpen(false)
    },
    onError: () => toast.error('Erreur lors de la mise à jour des rôles'),
  })

  const handleManageRoles = (user: User & { systemRoles?: string[] }) => {
    setSelectedUser(user as User)
    // Find matching role IDs from systemRoles slugs
    const currentRoleIds = allRoles
      .filter((r: Role) => user.systemRoles?.includes(r.slug))
      .map((r: Role) => r.id)

    setSelectedRoleIds(currentRoleIds)
    setIsRolesDialogOpen(true)
  }

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId],
    )
  }

  const users = userData?.data || []
  const meta = userData?.meta

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Utilisateurs Système</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les comptes administrateurs de la plateforme et leurs accès.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email..."
            className="pl-9 rounded-full bg-background/50 border-border/50"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-border/40 bg-background/60 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[300px]">Utilisateur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Rôles Système</TableHead>
              <TableHead>Dernière Connexion</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isUsersLoading
              ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Chargement des utilisateurs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              : users.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <IconUser className="h-12 w-12 text-muted-foreground/30" />
                          <h3 className="font-semibold text-lg">Aucun utilisateur trouvé</h3>
                          <p className="text-muted-foreground">Aucun compte ne correspond à vos critères de recherche.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                : (users as (User & { systemRoles?: string[] })[]).map(user => (
                    <TableRow key={user.id} className="group hover:bg-primary/5 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-primary/5 group-hover:ring-primary/20 transition-all">
                            <AvatarImage src={user.avatarUrl || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {user.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-base leading-none">{user.name}</span>
                            <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <IconMail size={12} />
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {user.systemRoles && user.systemRoles.length > 0
                            ? (
                                user.systemRoles.map((role: string) => (
                                  <Badge key={role} variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[10px] px-1.5 py-0">
                                    {role}
                                  </Badge>
                                ))
                              )
                            : (
                                <span className="text-xs text-muted-foreground italic">Aucun accès système</span>
                              )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastLoginAt
                          ? (
                              <div className="flex items-center gap-1.5 capitalize">
                                <IconClock size={14} />
                                {formatDate(user.lastLoginAt, 'MEDIUM')}
                              </div>
                            )
                          : 'Jamais'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full hover:bg-primary/10 hover:text-primary transition-all gap-2"
                          onClick={() => handleManageRoles(user)}
                        >
                          <IconShieldCheck size={16} />
                          <span className="hidden sm:inline">Permission</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
          </TableBody>
        </Table>

        {meta && meta.totalPages > 1 && (
          <div className="p-4 border-t border-border/40 flex items-center justify-between bg-muted/10">
            <p className="text-xs font-medium text-muted-foreground">
              Affichage de
              {' '}
              {users.length}
              {' '}
              sur
              {' '}
              {meta.total}
              {' '}
              utilisateurs
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={!meta.hasPrev} onClick={() => setPage(page - 1)}>
                Précédent
              </Button>
              <Button variant="outline" size="sm" disabled={!meta.hasNext} onClick={() => setPage(page + 1)}>
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={isRolesDialogOpen} onOpenChange={setIsRolesDialogOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-md glass border-border/40 shadow-2xl rounded-4xl p-0 overflow-hidden">
          <DialogHeader className="p-6 sm:p-8 bg-linear-to-b from-primary/5 to-transparent border-b border-border/20">
            <DialogTitle className="text-2xl font-bold tracking-tight">Assigner des Rôles</DialogTitle>
            <DialogDescription className="text-base">
              Modifiez les privilèges de plateforme pour
              {' '}
              <span className="font-bold text-foreground underline decoration-primary/30">{selectedUser?.name}</span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 p-6 sm:p-8 max-h-[60vh] overflow-y-auto scrollbar-none">
            <div className="space-y-3">
              {allRoles.map((role: Role) => (
                <div
                  key={role.id}
                  className="flex items-start gap-4 p-3 rounded-lg border border-border/50 hover:bg-primary/5 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleRole(role.id)
                    }
                  }}
                  onClick={() => toggleRole(role.id)}
                >
                  <Checkbox checked={selectedRoleIds.includes(role.id)} onCheckedChange={() => toggleRole(role.id)} />
                  <div className="flex-1 -mt-1">
                    <p className="text-sm font-bold">{role.name}</p>
                    <p className="text-xs text-muted-foreground">{role.description || `Permet l'accès aux ressources ${role.slug}.`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRolesDialogOpen(false)}>Annuler</Button>
            <Button onClick={() => selectedUser && assignRolesMutation.mutate({ userId: selectedUser.id, roleIds: selectedRoleIds })} disabled={assignRolesMutation.isPending}>
              {assignRolesMutation.isPending ? <IconLoader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
