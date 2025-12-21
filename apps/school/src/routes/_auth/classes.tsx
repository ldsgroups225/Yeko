import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/classes')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
