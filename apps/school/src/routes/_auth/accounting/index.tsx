import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/accounting/')({
  component: () => <Navigate to="/accounting/dashboard" replace />,
})
