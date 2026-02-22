import { IconChartBar, IconCircleCheck, IconFileDescription, IconPencil } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { TabbedLayout } from '@/components/layout/tabbed-layout'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/grades')({
  component: GradesLayout,
})

function GradesLayout() {
  const t = useTranslations()

  const tabs = [
    {
      label: t.academic.grades.reportCards(),
      href: '/grades/report-cards',
      icon: IconFileDescription,
      permission: { resource: 'grades', action: 'view' },
    },
    {
      label: t.academic.grades.entry.title(),
      href: '/grades/entry',
      icon: IconPencil,
      permission: { resource: 'grades', action: 'view' },
    },
    {
      label: t.academic.grades.validations.title(),
      href: '/grades/validations',
      icon: IconCircleCheck,
      permission: { resource: 'grades', action: 'view' },
    },
    {
      label: t.academic.grades.statistics.title(),
      href: '/grades/statistics',
      icon: IconChartBar,
      permission: { resource: 'grades', action: 'view' },
    },
  ]

  return (
    <TabbedLayout
      title={t.nav.grades()}
      description={t.academic.grades.description()}
      breadcrumbs={[{ label: t.nav.grades() }]}
      tabs={tabs}
    />
  )
}
