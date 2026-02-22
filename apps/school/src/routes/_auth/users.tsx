import { IconLock, IconSchool, IconUsers, IconUsersGroup } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { TabbedLayout } from '@/components/layout/tabbed-layout'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/users')({
  component: HRLayout,
})

function HRLayout() {
  const t = useTranslations()

  const tabs = [
    {
      label: t.nav.allUsers(),
      href: '/users/users',
      icon: IconUsers,
      permission: { resource: 'users', action: 'view' },
    },
    {
      label: t.nav.teachers(),
      href: '/users/teachers',
      icon: IconSchool,
      permission: { resource: 'users', action: 'view' },
    },
    {
      label: t.nav.staff(),
      href: '/users/staff',
      icon: IconUsersGroup,
      permission: { resource: 'users', action: 'view' },
    },
    {
      label: t.nav.roles(),
      href: '/users/roles',
      icon: IconLock,
      permission: { resource: 'users', action: 'view' },
    },
  ]

  return (
    <TabbedLayout
      title={t.nav.hr()}
      description={t.users.title()}
      tabs={tabs}
      breadcrumbs={[{ label: t.nav.hr() }]}
    />
  )
}
