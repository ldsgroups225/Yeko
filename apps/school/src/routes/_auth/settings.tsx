import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SettingsLayout } from '@/components/settings/settings-nav'

export const Route = createFileRoute('/_auth/settings')({
  component: SettingsLayoutRoute,
})

function SettingsLayoutRoute() {
  return (
    <SettingsLayout>
      <Outlet />
    </SettingsLayout>
  )
}
