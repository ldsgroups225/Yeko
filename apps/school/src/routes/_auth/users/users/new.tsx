import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { UserForm } from '@/components/hr/users/user-form'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

export const Route = createFileRoute('/_auth/users/users/new')({
  component: NewUserPage,
})

function NewUserPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate({ to: '/users/users', search: { page: 1 } })
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('hr.title'), href: '/users' },
          { label: t('hr.users.title'), href: '/users/users' },
          { label: t('hr.users.addUser') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('hr.users.addUser')}</h1>
        <p className="text-muted-foreground">{t('hr.users.addUserDescription')}</p>
      </div>

      <UserForm onSuccess={handleSuccess} />
    </div>
  )
}
