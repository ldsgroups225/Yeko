import { Navigate } from '@tanstack/react-router'

export function DefaultNotFound() {
  return <Navigate to="/dashboard" replace />
}
