import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/users/')({
  component: HRIndexPage,
})

function HRIndexPage() {
  // Redirect to users list by default
  return <Navigate to="/users/users" search={{ page: 1 }} />
}
