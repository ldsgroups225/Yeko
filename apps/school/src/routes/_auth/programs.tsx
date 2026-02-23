import { IconBook, IconClipboardList, IconScale } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { TabbedLayout } from '@/components/layout/tabbed-layout'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/programs')({
  component: ProgramsLayout,
})

function ProgramsLayout() {
  const t = useTranslations()

  const tabs = [
    {
      label: t.programs.progress(),
      href: '/programs/curriculum-progress',
      icon: IconClipboardList,
      permission: { resource: 'curriculum_progress', action: 'view' },
    },
    {
      label: t.nav.subjects(),
      href: '/programs/subjects',
      icon: IconBook,
      permission: { resource: 'school_subjects', action: 'view' },
    },
    {
      label: t.nav.coefficients(),
      href: '/programs/coefficients',
      icon: IconScale,
      permission: { resource: 'school_subjects', action: 'view' },
    },
  ]

  return (
    <TabbedLayout
      title={t.nav.programs()}
      description={t.programs.description()}
      breadcrumbs={[
        { label: t.nav.academic(), href: '/academic' },
        { label: t.nav.programs() },
      ]}
      tabs={tabs}
    />
  )
}
