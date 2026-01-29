import type { CreateRoleData } from '@/schemas/role'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { RoleForm } from '@/components/hr/roles/role-form'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { createNewRole } from '@/school/functions/roles'

export const Route = createFileRoute('/_auth/users/roles/new')({
  component: NewRolePage,
})

function NewRolePage() {
  const t = useTranslations()
  const navigate = useNavigate()

  const handleSubmit = async (data: CreateRoleData) => {
    const result = await createNewRole({ data })
    if (result.success) {
      toast.success(t.hr.roles.createSuccess())
      navigate({ to: '/users/roles/$roleId', params: { roleId: result.data?.id ?? '' } })
    }
    else {
      toast.error(result.error || t.hr.roles.createError())
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.hr.title(), href: '/users' },
          { label: t.hr.roles.title(), href: '/users/roles' },
          { label: t.hr.roles.addRole() },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.hr.roles.addRole()}</h1>
        <p className="text-muted-foreground">{t.hr.roles.createDescription()}</p>
      </div>

      <RoleForm onSubmit={handleSubmit} />
    </div>
  )
}
