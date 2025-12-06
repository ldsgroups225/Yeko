import { Navigate } from '@tanstack/react-router'

export function DefaultNotFound() {
  return <Navigate to="/app/dashboard" replace />
}
