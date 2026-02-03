import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { UserForm } from '@/components/hr/users/user-form'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { getUser } from '@/school/functions/users'

export const Route = createFileRoute('/_auth/users/users/$userId/edit')({
  component: EditUserPage,
})

function EditUserPage() {
  const { userId } = Route.useParams()
  const t = useTranslations()
  const navigate = useNavigate()

  const { data: userResult, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const result = await getUser({ data: userId })
      return result
    },
  })
  const user = userResult?.success ? userResult.data : undefined

  const handleSuccess = () => {
    navigate({ to: '/users/users/$userId', params: { userId } })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">{t.common.loading()}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.hr.title(), href: '/users' },
          { label: t.hr.users.title(), href: '/users/users' },
          { label: user?.name || userId, href: `/users/users/${userId}` },
          { label: t.hr.users.editUser() },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.hr.users.editUser()}</h1>
        <p className="text-muted-foreground">{t.hr.users.editUserDescription()}</p>
      </div>

      {user && <UserForm user={user} onSuccess={handleSuccess} />}
    </div>
  )
}
