import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { UserForm } from '@/components/hr/users/user-form'

export const Route = createFileRoute('/_auth/settings/personnel/users/new')({
  component: NewUserPage,
})

function NewUserPage() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate({ to: '/settings/personnel/users', search: { page: 1 } })
  }

  return (
    <div>
      <UserForm onSuccess={handleSuccess} />
    </div>
  )
}
