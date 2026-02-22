import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/conducts/')({
  beforeLoad: () => {
    throw redirect({ to: '/conducts/student-attendance' })
  },
})
