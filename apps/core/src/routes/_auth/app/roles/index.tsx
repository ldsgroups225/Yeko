import type { Role, RoleScope as SchoolScope, SystemAction, SystemPermissions } from '@repo/data-ops'
import { hasPermission } from '@repo/data-ops/auth/permissions'
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
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createPlatformRole, deletePlatformRole, getPlatformRoles, updatePlatformRole } from '@/core/functions/roles'
import { useAuthorization } from '@/hooks/use-authorization'

export const Route = createFileRoute('/_auth/app/roles/')({
  beforeLoad: ({ context }) => {
    // Aggressively protect this route at the framework level
    const permissions = context.auth?.permissions
    if (!context.auth?.isAuthenticated || (!context.auth?.isSuperAdmin && !hasPermission(permissions, 'global_settings', 'view'))) {
      throw redirect({
        to: '/unauthorized',
      })
    }
  },
  component: RoleManagement,
})

const RESOURCES = [
  // École (Nouveau MVP)
  { id: 'teachers', name: 'Enseignants', category: 'École' },
  { id: 'students', name: 'Élèves', category: 'École' },
  { id: 'parents', name: 'Parents', category: 'École' },
  { id: 'classes', name: 'Classes', category: 'École' },
  { id: 'classrooms', name: 'Salles', category: 'École' },
  { id: 'grades', name: 'Notes', category: 'École' },
  { id: 'attendance', name: 'Assiduité', category: 'École' },
  { id: 'conduct', name: 'Discipline', category: 'École' },
  { id: 'finance', name: 'Finances', category: 'École' },
  { id: 'reports', name: 'Rapports', category: 'École' },
  { id: 'settings', name: 'Configuration', category: 'École' },
  { id: 'school_subjects', name: 'Matières', category: 'École' },
  { id: 'coefficients', name: 'Coefficients', category: 'École' },
  { id: 'teacher_assignments', name: 'Attributions', category: 'École' },
  // Système
  { id: 'schools', name: 'Plateforme : Écoles', category: 'Système' },
  { id: 'users', name: 'Plateforme : Users', category: 'Système' },
  { id: 'system_monitoring', name: 'Plateforme : Monitoring', category: 'Système' },
  { id: 'global_settings', name: 'Plateforme : Config', category: 'Système' },
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
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  // Scope filter state
  const [activeScope, setActiveScope] = useState<SchoolScope>('school')

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    scope: 'system' as SchoolScope,
    permissions: {} as SystemPermissions,
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
    queryKey: ['platform-roles', activeScope],
    queryFn: () => getPlatformRoles({ data: { scope: activeScope } }),
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
    mutationFn: (data: Partial<Role> & { id: string }) => updatePlatformRole({ data }),
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

  const handleEdit = (role: Role) => {
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
      const currentResourcePerms = (prev.permissions[resourceId] || []) as string[]
      const newResourcePerms = currentResourcePerms.includes(actionId)
        ? currentResourcePerms.filter(a => a !== actionId)
        : [...currentResourcePerms, actionId]

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [resourceId]: newResourcePerms as SystemAction[],
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
              render={triggerProps => (
                <Button {...triggerProps} size="lg" className="rounded-full shadow-lg hover:shadow-primary/20 transition-all">
                  <IconPlus className="mr-2 h-5 w-5" />
                  Nouveau Rôle
                </Button>
              )}
            />
            <DialogContent className="max-w-4xl glass max-h-[90vh] overflow-y-auto w-[98vw] sm:w-full p-2 sm:p-6">
              <DialogHeader className="p-4 sm:p-0">
                <DialogTitle>{editingRole ? 'Modifier le Rôle' : 'Créer un Nouveau Rôle'}</DialogTitle>
                <DialogDescription>
                  Configurez les permissions granulaires pour ce rôle.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 py-4 px-2 sm:px-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="scope">Portée (Scope)</Label>
                    <Select
                      value={formData.scope}
                      onValueChange={val => setFormData({ ...formData, scope: val as SchoolScope })}
                      disabled={!!editingRole}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">Plateforme (Système)</SelectItem>
                        <SelectItem value="school">École</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brève description des responsabilités"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-bold underline decoration-primary/30 px-2 sm:px-0">Matrice des Permissions</Label>
                  <div className="rounded-xl border border-border bg-background/50 overflow-x-auto shadow-inner">
                    <Table className="min-w-[600px]">
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-[180px] text-xs font-bold px-4">Ressource</TableHead>
                          {ACTIONS.map(action => (
                            <TableHead key={action.id} className="text-center text-[10px] font-semibold uppercase tracking-wider px-1">
                              {action.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {RESOURCES.filter(r => (formData.scope === 'system' ? r.category === 'Système' : r.category === 'École')).map(resource => (
                          <TableRow key={resource.id} className="hover:bg-primary/5 transition-colors border-b">
                            <TableCell className="font-medium text-xs px-4 truncate max-w-[150px]">{resource.name}</TableCell>
                            {ACTIONS.map(action => (
                              <TableCell key={action.id} className="text-center px-1">
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={formData.permissions[resource.id]?.includes(action.id)}
                                    onCheckedChange={() => togglePermission(resource.id, action.id)}
                                    className="h-4 w-4 transition-transform hover:scale-110"
                                  />
                                </div>
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

      <Tabs value={activeScope} onValueChange={val => setActiveScope(val as SchoolScope)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
          <TabsTrigger value="school">Rôles École</TabsTrigger>
          <TabsTrigger value="system">Rôles Plateforme</TabsTrigger>
        </TabsList>

        <TabsContent value="school" className="mt-0">
          <div className="grid gap-6">
            {isLoading
              ? (
                  <div className="flex justify-center py-20">
                    <IconShield className="animate-spin h-10 w-10 text-primary/40" />
                  </div>
                )
              : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.length === 0 && (
                      <div className="col-span-full py-20 text-center text-muted-foreground">
                        Aucun rôle d'école défini.
                      </div>
                    )}
                    {roles.map((role: Role) => (
                      <RoleCard
                        key={role.id}
                        role={role}
                        onEdit={handleEdit}
                        onDelete={(r) => {
                          setRoleToDelete(r)
                          setIsDeleteOpen(true)
                        }}
                        can={can}
                      />
                    ))}
                  </div>
                )}
          </div>
        </TabsContent>

        <TabsContent value="system" className="mt-0">
          <div className="grid gap-6">
            {isLoading
              ? (
                  <div className="flex justify-center py-20">
                    <IconShield className="animate-spin h-10 w-10 text-primary/40" />
                  </div>
                )
              : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map((role: Role) => (
                      <RoleCard
                        key={role.id}
                        role={role}
                        onEdit={handleEdit}
                        onDelete={(r) => {
                          setRoleToDelete(r)
                          setIsDeleteOpen(true)
                        }}
                        can={can}
                      />
                    ))}
                  </div>
                )}
          </div>
        </TabsContent>
      </Tabs>

      <DeleteConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={`Supprimer le rôle ${roleToDelete?.name}`}
        description="Cette action supprimera le rôle de manière permanente. Les utilisateurs ayant ce rôle perdront les permissions associées."
        onConfirm={() => {
          if (roleToDelete?.id)
            deleteMutation.mutate(roleToDelete.id)
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

interface RoleCardProps {
  role: Role
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  can: (resource: string, action: SystemAction) => boolean
}

function RoleCard({ role, onEdit, onDelete, can }: RoleCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group h-full"
    >
      <Card className="h-full border-border/50 bg-background/40 backdrop-blur-md shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all overflow-hidden relative">
        {role.scope === 'system' && (
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
            {can('global_settings', 'manage') && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(role)}>
                <IconDots size={16} />
              </Button>
            )}
            {!role.isSystemRole && can('global_settings', 'manage') && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(role)}
              >
                <IconTrash size={16} />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
