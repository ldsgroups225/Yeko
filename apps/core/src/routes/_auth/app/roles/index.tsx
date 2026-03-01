import type { Role, RoleScope as SchoolScope } from '@repo/data-ops'
import { hasPermission } from '@repo/data-ops/auth/permissions'
import { IconShield } from '@tabler/icons-react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import { Dialog } from '@workspace/ui/components/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAuthorization } from '@/hooks/use-authorization'
import { useTranslations } from '@/i18n/hooks'
import {
  createPlatformRoleMutationOptions,
  deletePlatformRoleMutationOptions,
  platformRolesKeys,
  platformRolesQueryOptions,
  updatePlatformRoleMutationOptions,
} from '@/integrations/tanstack-query/platform-roles-options'
import { RoleCard } from './components/role-card'
import { RoleForm } from './components/role-form'
import { RoleHeader } from './components/role-header'
import { RESOURCE_MAP } from './constants'

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
    onSubmit: ({ value }) => onFormSubmit(value),
  })

  const createMutation = useMutation({
    ...createPlatformRoleMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformRolesKeys.all })
      toast.success('Rôle créé avec succès')
      setIsDialogOpen(false)
    },
    onError: (error: Error) => toast.error(error.message || 'Erreur lors de la création'),
  })

  const updateMutation = useMutation({
    ...updatePlatformRoleMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformRolesKeys.all })
      toast.success('Rôle mis à jour avec succès')
      setIsDialogOpen(false)
      setEditingRole(null)
    },
    onError: (error: Error) => toast.error(error.message || 'Erreur lors de la mise à jour'),
  })

  const deleteMutation = useMutation({
    ...deletePlatformRoleMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformRolesKeys.all })
      toast.success('Rôle supprimé')
      setIsDeleteOpen(false)
      setRoleToDelete(null)
    },
    onError: () => {
      toast.error('Erreur lors de la suppression')
    },
  })

  // Reset form on success
  useEffect(() => {
    if (createMutation.isSuccess || updateMutation.isSuccess) {
      form.reset()
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess, form])

  function onFormSubmit(value: RoleFormData) {
    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, updates: value as Partial<RoleFormData> as unknown as Partial<Role> })
    }
    else {
      createMutation.mutate(value as RoleFormData as unknown as RoleFormData)
    }
  }

  const { data: roles = [], isPending } = useQuery(platformRolesQueryOptions(activeScope))

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

  const handleCreate = () => {
    setEditingRole(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      <RoleHeader
        title={t.roles.title()}
        subtitle={t.roles.subtitle()}
        onCreate={handleCreate}
        canCreate={can('global_settings', 'manage')}
        createLabel={t.roles.create()}
      />

      {can('global_settings', 'manage') && (
        <Dialog
          open={isDialogOpen}
          onOpenChange={handleOpenChange}
        >
          <RoleForm
            form={form}
            editingRole={editingRole}
            onCancel={() => handleOpenChange(false)}
            t={t}
          />
        </Dialog>
      )}

      <Tabs
        value={activeScope}
        onValueChange={val => setActiveScope(val as SchoolScope)}
        className="w-full"
      >
        <div className="mb-10 flex flex-col items-center">
          <TabsList className="
            bg-muted/50 border-border/50 grid w-full max-w-md grid-cols-2
            rounded-2xl border p-1 backdrop-blur-sm
          "
          >
            <TabsTrigger
              value="school"
              className="
                data-[state=active]:bg-background
                rounded-xl py-2.5 transition-all
                data-[state=active]:shadow-lg
              "
            >
              {t.roles.schoolRoles()}
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="
                data-[state=active]:bg-background
                rounded-xl py-2.5 transition-all
                data-[state=active]:shadow-lg
              "
            >
              {t.roles.systemRoles()}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="school" className="mt-0">
          <div className="grid gap-6">
            {isPending
              ? (
                  <div className="flex justify-center py-20">
                    <IconShield className="
                      text-primary/40 h-10 w-10 animate-spin
                    "
                    />
                  </div>
                )
              : (
                  <div className="
                    grid grid-cols-1 gap-6
                    md:grid-cols-2
                    lg:grid-cols-3
                  "
                  >
                    {roles.length === 0 && (
                      <div className="
                        text-muted-foreground col-span-full py-20 text-center
                      "
                      >
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
                        resourceMap={RESOURCE_MAP}
                      />
                    ))}
                  </div>
                )}
          </div>
        </TabsContent>

        <TabsContent value="system" className="mt-0">
          <div className="grid gap-6">
            {isPending
              ? (
                  <div className="flex justify-center py-20">
                    <IconShield className="
                      text-primary/40 h-10 w-10 animate-spin
                    "
                    />
                  </div>
                )
              : (
                  <div className="
                    grid grid-cols-1 gap-6
                    md:grid-cols-2
                    lg:grid-cols-3
                  "
                  >
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
                        resourceMap={RESOURCE_MAP}
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
            <p className="
              text-destructive border-destructive bg-destructive/5 rounded-r-md
              border-l-2 py-1 pl-3 font-medium
            "
            >
              {t.roles.deleteWarning()}
            </p>
          </div>
        )}
        onConfirm={() => {
          if (roleToDelete?.id)
            deleteMutation.mutate(roleToDelete.id)
        }}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
