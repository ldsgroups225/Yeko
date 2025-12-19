import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/spaces/')({
  component: () => <Navigate to="/spaces/classrooms" replace />,
})
