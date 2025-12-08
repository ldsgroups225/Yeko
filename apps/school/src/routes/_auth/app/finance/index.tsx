import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/finance/')({
  component: () => <Navigate to="/app/finance/dashboard" replace />,
})
