import type { Role, User } from '@repo/data-ops'
import { hasPermission } from '@repo/data-ops/auth/permissions'
import {
  IconClock,
  IconLoader2,
  IconMail,
  IconSearch,
  IconShield,
  IconShieldCheck,
  IconUser,
} from '@tabler/icons-react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-form-adapter'
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
import {
  FieldLegend,
  FieldSet,
} from '@workspace/ui/components/form'
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
import { z } from 'zod'
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

const userRolesSchema = z.object({
  roleIds: z.array(z.string()),
})

function UserManagement() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false)

  const form = useForm({
    defaultValues: {
      roleIds: [] as string[],
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      if (!selectedUser)
        return
      assignRolesMutation.mutate({ userId: selectedUser.id, roleIds: value.roleIds })
    },
  })

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
      toast.success('Accès mis à jour avec succès')
      setIsRolesDialogOpen(false)
    },
    onError: () => toast.error('Erreur lors de la mise à jour des accès'),
  })

  const handleManageRoles = (user: User & { systemRoles?: string[] }) => {
    setSelectedUser(user as User)
    const currentRoleIds = allRoles
      .filter((r: Role) => user.systemRoles?.includes(r.slug))
      .map((r: Role) => r.id)

    form.setFieldValue('roleIds', currentRoleIds)
    setIsRolesDialogOpen(true)
  }

  const handleOpenChange = (open: boolean) => {
    setIsRolesDialogOpen(open)
    if (!open) {
      setSelectedUser(null)
      form.reset()
    }
  }

  const users = userData?.data || []
  const meta = userData?.meta

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-linear-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
            Utilisateurs Système
          </h1>
          <p className="text-muted-foreground/80 mt-2 text-lg font-medium max-w-2xl">
            Gérez les comptes d'administration et supervisez les privilèges d'accès globaux à la plateforme.
          </p>
        </div>

        <div className="relative w-full md:w-96 group">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Rechercher par nom, email..."
            className="pl-12 h-12 rounded-full bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-medium shadow-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-border/40 bg-background/40 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30 border-b border-border/20">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px] h-14 font-black uppercase tracking-widest text-[10px]">Utilisateur</TableHead>
              <TableHead className="h-14 font-black uppercase tracking-widest text-[10px]">Statut</TableHead>
              <TableHead className="h-14 font-black uppercase tracking-widest text-[10px]">Rôles Système</TableHead>
              <TableHead className="h-14 font-black uppercase tracking-widest text-[10px]">Activité</TableHead>
              <TableHead className="h-14 font-black uppercase tracking-widest text-[10px] text-right pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isUsersLoading
              ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm font-bold text-muted-foreground">Synchronisation des données...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              : users.length === 0
                ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 rounded-full bg-muted/20">
                            <IconUser className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-bold text-xl">Aucun utilisateur trouvé</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto">Ajustez vos filtres de recherche pour trouver le compte recherché.</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                : (users as (User & { systemRoles?: string[] })[]).map(user => (
                    <TableRow key={user.id} className="group hover:bg-primary/5 transition-all">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 ring-2 ring-primary/5 group-hover:ring-primary/20 transition-all shadow-sm">
                            <AvatarImage src={user.avatarUrl || undefined} />
                            <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/5 text-primary font-black text-lg">
                              {user.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-black text-base tracking-tight leading-none group-hover:text-primary transition-colors">{user.name}</span>
                            <span className="text-xs text-muted-foreground/60 mt-2 flex items-center gap-1.5 font-medium">
                              <IconMail size={14} className="opacity-50" />
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === 'active' ? 'default' : 'secondary'}
                          className={`capitalize rounded-lg px-2.5 py-1 text-[10px] font-bold ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-muted text-muted-foreground'}`}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {user.systemRoles && user.systemRoles.length > 0
                            ? (
                                user.systemRoles.map((role: string) => (
                                  <Badge key={role} variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md shadow-xs">
                                    {role}
                                  </Badge>
                                ))
                              )
                            : (
                                <span className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest italic">Visiteur</span>
                              )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-muted-foreground/80">
                        {user.lastLoginAt
                          ? (
                              <div className="flex items-center gap-2 capitalize">
                                <IconClock size={16} className="text-primary/40" />
                                {formatDate(user.lastLoginAt, 'MEDIUM')}
                              </div>
                            )
                          : <span className="opacity-40">Jamais</span>}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 px-4 rounded-xl hover:bg-primary/10 hover:text-primary transition-all gap-2 font-bold text-xs"
                          onClick={() => handleManageRoles(user)}
                        >
                          <IconShieldCheck size={18} />
                          <span>Habilitations</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
          </TableBody>
        </Table>

        {meta && meta.totalPages > 1 && (
          <div className="p-4 px-8 border-t border-border/20 flex items-center justify-between bg-muted/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              {users.length}
              {' '}
              modules sur
              {meta.total}
            </span>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-9 px-4 font-bold border-border/40"
                disabled={!meta.hasPrev}
                onClick={() => setPage(page - 1)}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-9 px-4 font-bold border-border/40"
                disabled={!meta.hasNext}
                onClick={() => setPage(page + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={isRolesDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg sm:max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl">
          <DialogHeader className="p-5 sm:p-8 bg-linear-to-b from-primary/5 to-transparent border-b border-border/20 sticky top-0 bg-background/80 backdrop-blur-md z-20">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
                <IconShield className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">Habilitations Système</DialogTitle>
                <DialogDescription className="text-sm sm:text-base line-clamp-1">
                  Configurez les rôles de plateforme pour
                  {' '}
                  <span className="font-black text-primary">{selectedUser?.name}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="p-5 sm:p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-none"
          >
            <form.Field
              name="roleIds"
              children={field => (
                <FieldSet>
                  <FieldLegend>Rôles Disponibles</FieldLegend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allRoles.map((role: Role) => {
                      const isChecked = field.state.value.includes(role.id)
                      const toggle = () => {
                        const next = isChecked
                          ? field.state.value.filter(id => id !== role.id)
                          : [...field.state.value, role.id]
                        field.handleChange(next)
                      }

                      return (
                        <div
                          key={role.id}
                          role="button"
                          tabIndex={0}
                          onClick={toggle}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ')
                              toggle()
                          }}
                          className={`flex items-start gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98] cursor-pointer shadow-xs ${
                            isChecked
                              ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/20'
                              : 'bg-background/40 border-border/60 hover:bg-primary/5 hover:border-primary/20'
                          }`}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={toggle}
                            className="mt-1 pointer-events-none"
                          />
                          <div className="flex-1 space-y-1">
                            <p className={`text-sm font-black tracking-tight leading-none ${isChecked ? 'text-primary' : 'text-foreground'}`}>
                              {role.name}
                            </p>
                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                              {role.slug}
                            </p>
                            {role.description && (
                              <p className="text-[11px] text-muted-foreground leading-tight pt-1">
                                {role.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </FieldSet>
              )}
            />

            <DialogFooter className="pt-8 gap-3 border-t border-border/10">
              <Button type="button" variant="ghost" size="lg" className="rounded-xl font-bold px-6" onClick={() => handleOpenChange(false)}>
                Annuler
              </Button>
              <form.Subscribe
                selector={state => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    size="lg"
                    className="rounded-xl px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting || assignRolesMutation.isPending ? 'Mise à jour...' : 'Sauvegarder'}
                  </Button>
                )}
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
