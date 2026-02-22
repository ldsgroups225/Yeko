import { IconBadge8k, IconBook, IconClipboardList } from '@tabler/icons-react'
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
      label: 'Avancement',
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
      label: 'Coefficients',
      href: '/programs/coefficients',
      icon: IconBadge8k,
      permission: { resource: 'school_subjects', action: 'view' },
    },
  ]

  return (
    <TabbedLayout
      title={t.nav.programs()}
      description="Gestion académique et suivi pédagogique"
      icon={IconBook}
      tabs={tabs}
    />
  )
}
