import { IconAlertCircle, IconSchool, IconUsers } from '@tabler/icons-react'
import { createFileRoute, Link, useLocation } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { TabbedLayout } from '@/components/layout/tabbed-layout'
import { useAuthorization } from '@/hooks/use-authorization'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/conducts')({
  component: SchoolLifeLayout,
})

function SchoolLifeLayout() {
  const t = useTranslations()
  const pathname = useLocation({ select: l => l.pathname })
  const { can } = useAuthorization()

  const tabs = [
    {
      label: `${t.nav.punctuality()} ${t.students.title()}`,
      href: '/conducts/conduct',
      icon: IconUsers,
      permission: { resource: 'conduct', action: 'view' },
    },
    {
      label: `${t.nav.punctuality()} ${t.nav.teachers()}`,
      href: '/conducts/teacher-attendance',
      icon: IconSchool,
      permission: { resource: 'attendance', action: 'view' },
    },
  ]

  const secondaryActions = (
    <>

      {can('conduct', 'view') && (
        <Link to="/conducts/alerts">
          <Button
            variant={pathname.startsWith('/conducts/alerts') ? 'default' : 'outline'}
            size="sm"
            className="h-10 rounded-xl px-4 text-xs font-bold"
          >
            <IconAlertCircle className="mr-2 h-4 w-4" />
            {t.schoolLife.alerts()}
          </Button>
        </Link>
      )}
    </>
  )

  return (
    <TabbedLayout
      title={t.nav.schoolLife()}
      description={t.schoolLife.description()}
      breadcrumbs={[{ label: t.nav.schoolLife() }]}
      tabs={tabs}
      actions={secondaryActions}
    />
  )
}
