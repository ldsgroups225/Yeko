import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/finance')({
  component: FinanceLayout,
})

function FinanceLayout() {
  return <Outlet />
}
