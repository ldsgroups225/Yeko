import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ConductsLayout } from '@/components/conduct/conducts-nav'

export const Route = createFileRoute('/_auth/conducts')({
  component: SchoolLifeLayout,
})

function SchoolLifeLayout() {
  return (
    <ConductsLayout>
      <Outlet />
    </ConductsLayout>
  )
}
