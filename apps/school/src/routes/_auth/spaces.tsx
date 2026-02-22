import { IconBuilding, IconCalendarStats } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { TabbedLayout } from '@/components/layout/tabbed-layout'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/spaces')({
  component: SpacesLayout,
})

function SpacesLayout() {
  const t = useTranslations()

  const tabs = [
    {
      label: 'Salles de classe',
      href: '/spaces/classrooms',
      icon: IconBuilding,
      permission: { resource: 'classrooms', action: 'view' },
    },
    {
      label: 'Disponibilités',
      href: '/spaces/availability',
      icon: IconCalendarStats,
      permission: { resource: 'classrooms', action: 'view' },
    },
  ]

  return (
    <TabbedLayout
      title={t.nav.spaces()}
      description="Gestion des salles et infrastructures"
      icon={IconBuilding}
      tabs={tabs}
    />
  )
}
