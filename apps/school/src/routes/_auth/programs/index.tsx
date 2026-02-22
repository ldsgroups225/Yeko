import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/programs/')({
  beforeLoad: () => {
    throw redirect({ to: '/programs/subjects' })
  },
})
