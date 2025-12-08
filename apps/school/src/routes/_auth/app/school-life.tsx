import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/school-life')({
  component: SchoolLifeLayout,
})

function SchoolLifeLayout() {
  return <Outlet />
}
