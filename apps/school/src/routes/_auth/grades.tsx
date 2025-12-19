import { createFileRoute, Outlet } from '@tanstack/react-router'

import { GradesLayout } from '@/components/grades/grades-nav'

export const Route = createFileRoute('/_auth/grades')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <GradesLayout>
      <Outlet />
    </GradesLayout>
  )
}
