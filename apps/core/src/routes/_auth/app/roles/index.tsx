import type { Role, RoleScope as SchoolScope, SystemAction } from '@repo/data-ops'
import { hasPermission } from '@repo/data-ops/auth/permissions'
import {
  IconDots,
  IconLock,
  IconPlus,
  IconShield,
  IconTrash,
} from '@tabler/icons-react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { createPlatformRole, deletePlatformRole, getPlatformRoles, updatePlatformRole } from '@/core/functions/roles'
import { useAuthorization } from '@/hooks/use-authorization'
import { useTranslations } from '@/i18n/hooks'

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
  { id: 'teachers', name: 'Personnel Enseignant', category: 'École' },
  { id: 'students', name: 'Élèves & Étudiants', category: 'École' },
  { id: 'parents', name: 'Parents d\'Élèves', category: 'École' },
  { id: 'classes', name: 'Classes & Groupes', category: 'École' },
  { id: 'classrooms', name: 'Salles & Infrastructure', category: 'École' },
  { id: 'grades', name: 'Notes & Évaluations', category: 'École' },
  { id: 'attendance', name: 'Suivi des Présences', category: 'École' },
  { id: 'conduct', name: 'Vie Scolaire & Discipline', category: 'École' },
  { id: 'finance', name: 'Finances & Inscriptions', category: 'École' },
  { id: 'reports', name: 'Bulletins & Rapports', category: 'École' },
  { id: 'settings', name: 'Paramètres École', category: 'École' },
  { id: 'school_subjects', name: 'Matières & Programmes', category: 'École' },
  { id: 'coefficients', name: 'Coefficients & Pondération', category: 'École' },
  { id: 'teacher_assignments', name: 'Attributions de Cours', category: 'École' },
  // Système
  { id: 'schools', name: 'Gestion des Établissements', category: 'Système' },
  { id: 'users', name: 'Comptes Utilisateurs', category: 'Système' },
  { id: 'system_monitoring', name: 'Supervison Système', category: 'Système' },
  { id: 'global_settings', name: 'Configuration Globale', category: 'Système' },
]

const RESOURCE_MAP = Object.fromEntries(RESOURCES.map(r => [r.id, r.name]))

const ACTIONS: { id: SystemAction, name: string }[] = [
  { id: 'view', name: 'Voir' },
  { id: 'create', name: 'Créer' },
  { id: 'edit', name: 'Modifier' },
  { id: 'delete', name: 'Supprimer' },
  { id: 'manage', name: 'Gérer (Tout)' },
]

const roleSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères').max(50),
  slug: z.string().min(3, 'Le slug est requis').regex(/^[a-z0-9_]+$/, 'Format invalide (minuscules, chiffres et underscores uniquement)'),
  description: z.string().max(200).optional(),
  scope: z.enum(['system', 'school']),
  permissions: z.record(z.string(), z.array(z.string())),
})

type RoleFormData = z.infer<typeof roleSchema>

function RoleManagement() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { can } = useAuthorization()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  // Scope filter state
  const [activeScope, setActiveScope] = useState<SchoolScope>('school')

  const createMutation = useMutation({
    mutationFn: (data: RoleFormData) => createPlatformRole({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-roles'] })
      toast.success('Rôle créé avec succès')
      setIsDialogOpen(false)
      // eslint-disable-next-line ts/no-use-before-define
      form.reset()
    },
    onError: (error: Error) => toast.error(error.message || 'Erreur lors de la création'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Role> }) =>
      updatePlatformRole({ data: { id, updates } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-roles'] })
      toast.success('Rôle mis à jour avec succès')
      setIsDialogOpen(false)
      setEditingRole(null)
      // eslint-disable-next-line ts/no-use-before-define
      form.reset()
    },
    onError: (error: Error) => toast.error(error.message || 'Erreur lors de la mise à jour'),
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

  const form = useForm({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      scope: 'school' as 'system' | 'school',
      permissions: {} as Record<string, string[]>,
    },
    validators: {
      onChange: ({ value }) => {
        const result = roleSchema.safeParse(value)
        if (!result.success) {
          return result.error.issues.map((e: { message: string }) => e.message).join(', ')
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      if (editingRole) {
        updateMutation.mutate({ id: editingRole.id, updates: value as Partial<RoleFormData> as unknown as Partial<Role> })
      }
      else {
        createMutation.mutate(value as RoleFormData as unknown as RoleFormData)
      }
    },
  })

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['platform-roles', activeScope],
    queryFn: () => getPlatformRoles({ data: { scope: activeScope } }),
  })

  // Sync form when editing
  useEffect(() => {
    if (editingRole) {
      form.setFieldValue('name', editingRole.name)
      form.setFieldValue('slug', editingRole.slug)
      form.setFieldValue('description', editingRole.description || '')
      form.setFieldValue('scope', editingRole.scope as SchoolScope)
      form.setFieldValue('permissions', editingRole.permissions as Record<string, string[]>)
    }
    else {
      form.reset()
    }
  }, [editingRole, isDialogOpen, form])

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setIsDialogOpen(true)
  }

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingRole(null)
      form.reset()
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-linear-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
            {t.roles.title()}
          </h1>
          <p className="text-muted-foreground/80 mt-2 text-lg font-medium max-w-2xl">
            {t.roles.subtitle()}
          </p>
        </div>

        {can('global_settings', 'manage') && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={handleOpenChange}
          >
            <DialogTrigger
              render={triggerProps => (
                <Button {...triggerProps} size="lg" className="rounded-full shadow-lg hover:shadow-primary/20 transition-all">
                  <IconPlus className="mr-2 h-5 w-5" />
                  {t.roles.create()}
                </Button>
              )}
            />
            <DialogContent className="max-w-lg sm:max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl">
              <DialogHeader className="p-5 sm:p-8 bg-linear-to-b from-primary/5 to-transparent border-b border-border/20 sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
                    <IconPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                      {editingRole ? t.roles.edit() : t.roles.create()}
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base line-clamp-1">
                      Définissez précisément les responsabilités et les accès.
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
                <FieldGroup className="grid-cols-1 sm:grid-cols-2">
                  {/* Name */}
                  <form.Field
                    name="name"
                    children={field => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>{t.roles.name()}</FieldLabel>
                        <Input
                          id={field.name}
                          placeholder="ex: Superviseur Pédagogique"
                          className="h-11 sm:h-12! rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={e => field.handleChange(e.target.value)}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />

                  {/* Scope */}
                  <form.Field
                    name="scope"
                    children={field => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>{t.roles.scope()}</FieldLabel>
                        <Select
                          value={field.state.value}
                          onValueChange={val => field.handleChange(val as SchoolScope)}
                          disabled={!!editingRole}
                        >
                          <SelectTrigger id={field.name} className="w-full h-11! sm:h-12! rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold">
                            <SelectValue placeholder="Choisir le périmètre">
                              {field.state.value === 'system' ? 'Yeko Core' : 'Yeko School'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                            <SelectItem value="system" className="rounded-lg focus:bg-primary/10 focus:text-primary font-medium">Yeko Core</SelectItem>
                            <SelectItem value="school" className="rounded-lg focus:bg-primary/10 focus:text-primary font-medium">Yeko School</SelectItem>
                          </SelectContent>
                        </Select>
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />

                  {/* Slug */}
                  <form.Field
                    name="slug"
                    children={field => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>{t.roles.slug()}</FieldLabel>
                        <Input
                          id={field.name}
                          placeholder="superviseur_pedagogique"
                          disabled={!!editingRole}
                          className="h-11 sm:h-12! rounded-xl bg-muted/30 font-mono text-xs border-border/40 opacity-70"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={e => field.handleChange(e.target.value)}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />

                  {/* Description */}
                  <form.Field
                    name="description"
                    children={field => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>{t.roles.description()}</FieldLabel>
                        <Input
                          id={field.name}
                          placeholder="Objectif principal de ce rôle..."
                          className="h-11 sm:h-12! rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-medium"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={e => field.handleChange(e.target.value)}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />
                </FieldGroup>

                <div className="space-y-6 pt-4">
                  <div className="flex items-center justify-between border-b border-border/20 pb-3">
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight">{t.roles.permissions()}</h3>
                    <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 text-xs px-3 py-1">
                      Configuration Granulaire
                    </Badge>
                  </div>

                  <form.Field
                    name="permissions"
                    children={field => (
                      <div className="space-y-4">
                        <form.Subscribe
                          selector={state => state.values.scope}
                          children={(scope) => {
                            const filteredResources = RESOURCES.filter(r => (scope === 'system' ? r.category === 'Système' : r.category === 'École'))
                            return (
                              <div className="grid gap-4">
                                {filteredResources.map((resource, idx) => (
                                  <div
                                    key={resource.id}
                                    className={`rounded-2xl border border-border/40 p-5 transition-all hover:border-primary/30 ${idx % 2 === 0 ? 'bg-muted/5' : 'bg-background/30'}`}
                                  >
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-bold text-sm">{resource.name}</p>
                                          <code className="text-[10px] text-muted-foreground/50 font-mono uppercase">{resource.category}</code>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-3">
                                        {ACTIONS.map((action) => {
                                          const currentPerms = field.state.value[resource.id] || []
                                          const isChecked = currentPerms.includes(action.id)

                                          const toggle = () => {
                                            const next = isChecked
                                              ? currentPerms.filter(id => id !== action.id)
                                              : [...currentPerms, action.id]

                                            field.handleChange({
                                              ...field.state.value,
                                              [resource.id]: next,
                                            })
                                          }

                                          return (
                                            <div
                                              key={action.id}
                                              role="button"
                                              tabIndex={0}
                                              onClick={toggle}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ')
                                                  toggle()
                                              }}
                                              className={`flex flex-col items-center justify-center gap-2.5 p-3 rounded-2xl border text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-xs ${isChecked
                                                ? 'bg-primary/10 border-primary/40 text-primary ring-1 ring-primary/20'
                                                : 'bg-background/40 border-border/60 text-muted-foreground hover:bg-primary/5 hover:border-primary/20'}`}
                                            >
                                              <Checkbox
                                                checked={!!isChecked}
                                                onCheckedChange={toggle}
                                                className="pointer-events-none"
                                              />
                                              <span className="text-[10px] font-black uppercase tracking-wider">{action.name}</span>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          }}
                        />
                      </div>
                    )}
                  />
                </div>

                <DialogFooter className="pt-8 gap-3 border-t border-border/10">
                  <Button type="button" variant="ghost" size="lg" className="rounded-xl font-bold px-6" onClick={() => handleOpenChange(false)}>
                    {t.common.cancel()}
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
                        {isSubmitting ? t.common.loading() : editingRole ? t.common.save() : t.common.create()}
                      </Button>
                    )}
                  />
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeScope} onValueChange={val => setActiveScope(val as SchoolScope)} className="w-full">
        <div className="flex flex-col items-center mb-10">
          <TabsList className="grid w-full grid-cols-2 max-w-md p-1 bg-muted/50 backdrop-blur-sm rounded-2xl border border-border/50">
            <TabsTrigger value="school" className="rounded-xl data-[state=active]:shadow-lg data-[state=active]:bg-background transition-all py-2.5">
              {t.roles.schoolRoles()}
            </TabsTrigger>
            <TabsTrigger value="system" className="rounded-xl data-[state=active]:shadow-lg data-[state=active]:bg-background transition-all py-2.5">
              {t.roles.systemRoles()}
            </TabsTrigger>
          </TabsList>
        </div>

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
                        {t.roles.none()}
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
        title={t.roles.confirmDelete()}
        description={(
          <div className="space-y-3">
            <p>
              {t.roles.deleteDescription({ name: roleToDelete?.name || '' })}
            </p>
            <p className="text-destructive font-medium border-l-2 border-destructive pl-3 py-1 bg-destructive/5 rounded-r-md">
              {t.roles.deleteWarning()}
            </p>
          </div>
        )}
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
  const permissionsCount = Object.keys(role.permissions || {}).length
  const isPlatform = role.scope === 'system'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Card className="h-full border-border/40 bg-background/50 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-500 overflow-hidden relative rounded-3xl">
        {/* Visual flare for roles */}
        <div className="absolute top-0 right-0 p-4">
          {isPlatform
            ? (
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1.5 flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <IconLock size={12} className="stroke-3" />
                  Système
                </Badge>
              )
            : (
                <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 gap-1.5 flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <IconShield size={12} className="stroke-3" />
                  École
                </Badge>
              )}
        </div>

        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 duration-500 ${isPlatform ? 'bg-primary/10 text-primary ring-1 ring-primary/20' : 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20'}`}>
              <IconShield className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="flex-1 space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                {role.name}
              </CardTitle>
              <code className="text-[10px] px-2 py-0.5 rounded bg-muted/50 text-muted-foreground font-mono">
                {role.slug}
              </code>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 flex flex-col h-[calc(100%-110px)]">
          <p className="text-sm text-muted-foreground/90 italic leading-relaxed line-clamp-2 min-h-[40px]">
            {role.description || 'Aucune description stratégique définie pour ce rôle.'}
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Périmètre d'accès
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {permissionsCount}
                {' '}
                modules
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(role.permissions as Record<string, string[]>).slice(0, 4).map(([resId, acts]) => {
                const humanName = RESOURCE_MAP[resId] || resId
                return (
                  <Badge
                    key={resId}
                    variant="secondary"
                    className="px-2.5 py-1 bg-background/50 border border-border/50 text-foreground/80 hover:bg-primary/5 hover:border-primary/20 transition-all rounded-lg text-[11px] flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    {humanName}
                    <span className="text-[8px] opacity-40 font-bold ml-1">
                      (
                      {acts.length}
                      )
                    </span>
                  </Badge>
                )
              })}
              {permissionsCount > 4 && (
                <div className="text-[10px] text-muted-foreground font-semibold px-2 flex items-center">
                  +
                  {permissionsCount - 4}
                  {' '}
                  autres...
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-border/30 flex items-center justify-between mt-auto">
            <div className="flex -space-x-1.5">
              <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[10px] font-bold ring-1 ring-primary/10">A</div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-background flex items-center justify-center text-[10px] font-bold ring-1 ring-emerald-500/10">B</div>
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border-2 border-background flex items-center justify-center text-[10px] font-black text-muted-foreground ring-1 ring-border shadow-sm">+5</div>
            </div>

            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              {can('global_settings', 'manage') && (
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => onEdit(role)}>
                  <IconDots size={20} />
                </Button>
              )}
              {!role.isSystemRole && can('global_settings', 'manage') && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => onDelete(role)}
                >
                  <IconTrash size={20} />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
