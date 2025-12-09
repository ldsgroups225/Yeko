import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/settings/')({
  beforeLoad: () => {
    throw redirect({ to: '/app/settings/school-years' })
  },
})
