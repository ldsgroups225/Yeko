import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app')({
  component: AppRoutes,
})

function AppRoutes() {
  return <Outlet />
}
