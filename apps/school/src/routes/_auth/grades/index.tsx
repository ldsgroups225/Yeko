import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/grades/')({
  beforeLoad: () => {
    throw redirect({ to: '/grades/report-cards' })
  },
})
