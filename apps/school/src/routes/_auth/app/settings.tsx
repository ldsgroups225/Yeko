import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/settings')({
  component: SettingsLayout,
})

function SettingsLayout() {
  return <Outlet />
}
