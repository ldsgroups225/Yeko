import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/academic')({
  component: AcademicLayout,
})

function AcademicLayout() {
  return <Outlet />
}
