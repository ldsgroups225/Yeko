import { createFileRoute, Outlet } from '@tanstack/react-router'
import { MobileLayout } from '@/components/layout/mobile-layout'

export const Route = createFileRoute('/_auth/app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <MobileLayout>
      <Outlet />
    </MobileLayout>
  )
}
