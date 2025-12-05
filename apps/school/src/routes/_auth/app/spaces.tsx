import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/spaces')({
  component: SpacesLayout,
})

function SpacesLayout() {
  return <Outlet />
}
