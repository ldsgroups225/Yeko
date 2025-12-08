import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Redirect to app dashboard or login
    throw redirect({ to: '/app' })
  },
  component: () => null,
})
