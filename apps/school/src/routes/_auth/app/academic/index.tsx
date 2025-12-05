import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/academic/')({
  component: () => <Navigate to="/app/academic/classes" replace />,
})
