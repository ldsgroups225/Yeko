import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app')({
  beforeLoad: ({ context }) => {
    // If authenticated but doesn't have any system-scoped role, redirect to unauthorized page
    // Note: unauthenticated users are handled by the parent /_auth route component
    if (context.auth?.isAuthenticated && !context.auth.hasSystemAccess) {
      throw redirect({
        to: '/unauthorized',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
