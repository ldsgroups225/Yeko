import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/students')({
  component: StudentsLayout,
})

function StudentsLayout() {
  return <Outlet />
}
