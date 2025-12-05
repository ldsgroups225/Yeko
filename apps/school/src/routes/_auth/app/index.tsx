import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/')({
  component: () => <Navigate to="/app/dashboard" replace />,
})
