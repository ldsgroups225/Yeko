import { IconAlertCircle, IconGavel, IconSchool, IconUsers } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { TabbedLayout } from '@/components/layout/tabbed-layout'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/conducts')({
  component: SchoolLifeLayout,
})

function SchoolLifeLayout() {
  const t = useTranslations()

  const tabs = [
    {
      label: t.nav.attendance(),
      href: '/conducts/student-attendance',
      icon: IconUsers,
      permission: { resource: 'attendance', action: 'view' },
    },
    {
      label: t.schoolLife.teacherAttendance(),
      href: '/conducts/teacher-attendance',
      icon: IconSchool,
      permission: { resource: 'attendance', action: 'view' },
    },
    {
      label: t.schoolLife.conduct(),
      href: '/conducts/conduct',
      icon: IconGavel,
      permission: { resource: 'conduct', action: 'view' },
    },
    {
      label: t.schoolLife.alerts(),
      href: '/conducts/alerts',
      icon: IconAlertCircle,
      permission: { resource: 'conduct', action: 'view' },
    },
  ]

  return (
    <TabbedLayout
      title={t.nav.schoolLife()}
      description={t.dashboard.description()}
      breadcrumbs={[{ label: t.nav.schoolLife() }]}
      tabs={tabs}
    />
  )
}
