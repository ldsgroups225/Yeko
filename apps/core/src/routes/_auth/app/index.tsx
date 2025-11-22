import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/')({
  beforeLoad: async () => {
    throw redirect({
      to: '/app/dashboard',
    })
  },
})
