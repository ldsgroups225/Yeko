import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/grades')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="space-y-6">
      <Outlet />
    </div>
  )
}
