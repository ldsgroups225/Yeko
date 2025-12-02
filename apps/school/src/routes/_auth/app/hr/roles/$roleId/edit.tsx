import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { RoleForm } from '@/components/hr/roles/role-form'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { getRole, updateExistingRole } from '@/school/functions/roles'

export const Route = createFileRoute('/_auth/app/hr/roles/$roleId/edit')({
  component: EditRolePage,
  loader: async ({ params }) => {
    return await getRole({ data: params.roleId })
  },
})

function EditRolePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { roleId } = Route.useParams()
  const roleData = Route.useLoaderData()

  const { data: role } = useSuspenseQuery({
    queryKey: ['role', roleId],
    queryFn: () => getRole({ data: roleId }),
    initialData: roleData,
  })

  const handleSubmit = async (data: any) => {
    try {
      await updateExistingRole({ data: { roleId, data } })
      toast.success(t('hr.roles.updateSuccess'))
      navigate({ to: '/app/hr/roles/$roleId', params: { roleId } })
    }
    catch (error) {
      toast.error(t('hr.roles.updateError'))
      throw error
    }
  }

  if (!role) {
    return <div>{t('hr.roles.notFound')}</div>
  }

  if (role.isSystemRole) {
    return (
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t('hr.title'), href: '/app/hr' },
            { label: t('hr.roles.title'), href: '/app/hr/roles' },
            { label: role.name },
          ]}
        />
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive">{t('hr.roles.cannotEditSystem')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('hr.roles.systemRoleDescription')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('hr.title'), href: '/app/hr' },
          { label: t('hr.roles.title'), href: '/app/hr/roles' },
          { label: role.name, href: `/app/hr/roles/${roleId}` },
          { label: t('common.edit') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('hr.roles.editRole')}</h1>
        <p className="text-muted-foreground">{t('hr.roles.editDescription')}</p>
      </div>

      <RoleForm initialData={role} onSubmit={handleSubmit} />
    </div>
  )
}
