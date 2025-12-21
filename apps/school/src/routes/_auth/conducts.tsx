import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/conducts')({
  component: SchoolLifeLayout,
})

function SchoolLifeLayout() {
  return (
    <Outlet />
  )
}
