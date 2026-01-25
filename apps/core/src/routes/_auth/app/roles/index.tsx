import type { SystemAction } from '@repo/data-ops/auth/permissions'
import { hasPermission } from '@repo/data-ops/auth/permissions'
import { DeleteConfirmationDialog } from '@repo/ui/src/components/delete-confirmation-dialog'
import {
  IconDots,
  IconLock,
  IconPlus,
  IconShield,
  IconTrash,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createPlatformRole, deletePlatformRole, getPlatformRoles, updatePlatformRole } from '@/core/functions/roles'
import { useAuthorization } from '@/hooks/use-authorization'

export const Route = createFileRoute('/_auth/app/roles/')({
  beforeLoad: ({ context }) => {
    // Aggressively protect this route at the framework level
    const permissions = context.auth?.permissions as any
    if (!context.auth?.isAuthenticated || (!context.auth?.isSuperAdmin && !hasPermission(permissions, 'global_settings', 'view'))) {
      throw redirect({
        to: '/unauthorized',
      })
    }
  },
  component: RoleManagement,
})

const RESOURCES = [
  { id: 'schools', name: 'Écoles' },
  { id: 'users', name: 'Utilisateurs System' },
  { id: 'academic_catalogs', name: 'Catalogues Académiques' },
  { id: 'system_monitoring', name: 'Monitoring Système' },
  { id: 'global_settings', name: 'Paramètres Globaux' },
]

const ACTIONS: { id: SystemAction, name: string }[] = [
  { id: 'view', name: 'Voir' },
  { id: 'create', name: 'Créer' },
  { id: 'edit', name: 'Modifier' },
  { id: 'delete', name: 'Supprimer' },
  { id: 'manage', name: 'Gérer (Tout)' },
]

function RoleManagement() {
  const queryClient = useQueryClient()
  const { can } = useAuthorization()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<any>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    scope: 'system' as 'system' | 'school',
    permissions: {} as Record<string, string[]>,
  })

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      scope: 'system',
      permissions: {},
    })
    setEditingRole(null)
  }

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['platform-roles'],
    queryFn: () => getPlatformRoles({ data: { scope: 'system' } }),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => createPlatformRole({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-roles'] })
      toast.success('Rôle créé avec succès')
      setIsDialogOpen(false)
      resetForm()
    },
    onError: () => toast.error('Erreur lors de la création du rôle'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => updatePlatformRole({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-roles'] })
      toast.success('Rôle mis à jour')
      setIsDialogOpen(false)
      setEditingRole(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePlatformRole({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-roles'] })
      toast.success('Rôle supprimé')
      setIsDeleteOpen(false)
      setRoleToDelete(null)
    },
    onError: () => {
      toast.error('Erreur lors de la suppression')
    },
  })

  const handleEdit = (role: any) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      slug: role.slug,
      description: role.description || '',
      scope: role.scope,
      permissions: role.permissions || {},
    })
    setIsDialogOpen(true)
  }

  const togglePermission = (resourceId: string, actionId: string) => {
    setFormData((prev) => {
      const currentResourcePerms = prev.permissions[resourceId] || []
      const newResourcePerms = currentResourcePerms.includes(actionId)
        ? currentResourcePerms.filter(a => a !== actionId)
        : [...currentResourcePerms, actionId]

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [resourceId]: newResourcePerms,
        },
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingRole) {
      updateMutation.mutate({
        id: editingRole.id,
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      })
    }
    else {
      createMutation.mutate(formData)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Gestion des Rôles
          </h1>
          <p className="text-muted-foreground mt-1">
            Définissez les permissions système et la hiérarchie des accès.
          </p>
        </div>

        {can('global_settings', 'manage') && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open)
                resetForm()
            }}
          >
            <DialogTrigger
              render={(
                <Button size="lg" className="rounded-full shadow-lg hover:shadow-primary/20 transition-all">
                  <IconPlus className="mr-2 h-5 w-5" />
                  Nouveau Rôle
                </Button>
              )}
            />
            <DialogContent className="max-w-3xl glass max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingRole ? 'Modifier le Rôle' : 'Créer un Nouveau Rôle'}</DialogTitle>
                <DialogDescription>
                  Configurez les permissions granulaires pour ce rôle système.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du rôle</Label>
                    <Input
                      id="name"
                      placeholder="ex: Auditeur Technique"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Identifiant (Slug)</Label>
                    <Input
                      id="slug"
                      placeholder="auditeur_technique"
                      disabled={!!editingRole}
                      value={formData.slug}
                      onChange={e => setFormData({ ...formData, slug: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brêve description des responsabilités"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-bold underline decoration-primary/30">Matrice des Permissions</Label>
                  <div className="rounded-xl border border-border bg-background/50 overflow-hidden shadow-inner">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-[200px]">Ressource</TableHead>
                          {ACTIONS.map(action => (
                            <TableHead key={action.id} className="text-center text-xs font-semibold uppercase tracking-wider">
                              {action.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {RESOURCES.map(resource => (
                          <TableRow key={resource.id} className="hover:bg-primary/5 transition-colors">
                            <TableCell className="font-medium text-sm">{resource.name}</TableCell>
                            {ACTIONS.map(action => (
                              <TableCell key={action.id} className="text-center">
                                <Checkbox
                                  checked={formData.permissions[resource.id]?.includes(action.id)}
                                  onCheckedChange={() => togglePermission(resource.id, action.id)}
                                  className="transition-transform hover:scale-110"
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingRole ? 'Mettre à jour' : 'Créer le rôle'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6">
        {isLoading
          ? (
              <div className="flex justify-center py-20">
                <IconShield className="animate-spin h-10 w-10 text-primary/40" />
              </div>
            )
          : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role: any) => (
                  <motion.div
                    key={role.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    className="group h-full"
                  >
                    <Card className="h-full border-border/50 bg-background/40 backdrop-blur-md shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all overflow-hidden relative">
                      {role.isSystemRole && (
                        <div className="absolute top-0 right-0 p-3">
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1.5 flex items-center">
                            <IconLock size={12} />
                            Système
                          </Badge>
                        </div>
                      )}

                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                            <IconShield size={24} />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{role.name}</CardTitle>
                            <CardDescription className="font-mono text-xs mt-0.5">{role.slug}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                          {role.description || 'Aucune description fournie.'}
                        </p>

                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Permissions Clés</p>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(role.permissions as Record<string, string[]>).slice(0, 5).map(([res, acts]) => (
                              <Badge key={res} variant="secondary" className="px-2 py-0 h-5 text-[10px]">
                                {res}
                                :
                                {' '}
                                {acts.length}
                              </Badge>
                            ))}
                            {Object.keys(role.permissions).length > 5 && (
                              <span className="text-[10px] text-muted-foreground">
                                +
                                {Object.keys(role.permissions).length - 5}
                                {' '}
                                de plus
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(role)}>
                            <IconDots size={16} />
                          </Button>
                          {!role.isSystemRole && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setRoleToDelete(role)
                                setIsDeleteOpen(true)
                              }}
                            >
                              <IconTrash size={16} />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
      </div>

      <DeleteConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={`Supprimer le rôle ${roleToDelete?.name}`}
        description="Cette action supprimera le rôle de manière permanente. Les utilisateurs ayant ce rôle perdront les permissions associées."
        onConfirm={() => deleteMutation.mutate(roleToDelete?.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
