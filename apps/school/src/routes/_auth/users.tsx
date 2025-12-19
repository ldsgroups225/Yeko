import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/users')({
  component: HRLayout,
})

function HRLayout() {
  return <Outlet />
}
