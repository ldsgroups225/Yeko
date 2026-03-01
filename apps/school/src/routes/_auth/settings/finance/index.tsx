import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/settings/finance/')({
  beforeLoad: () => {
    throw redirect({ to: '/settings/finance/setup' })
  },
})
