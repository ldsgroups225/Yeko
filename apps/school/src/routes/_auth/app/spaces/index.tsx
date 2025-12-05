import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/spaces/')({
  component: () => <Navigate to="/app/spaces/classrooms" replace />,
})
