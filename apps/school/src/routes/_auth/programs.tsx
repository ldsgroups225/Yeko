import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/programs')({
  component: ProgramsLayout,
})

function ProgramsLayout() {
  return <Outlet />
}
