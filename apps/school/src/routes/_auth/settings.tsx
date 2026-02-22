import { IconBell, IconBuilding, IconCalendar, IconFileText, IconHierarchy, IconSettings, IconWallet } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { TabbedLayout } from '@/components/layout/tabbed-layout'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/settings')({
  component: SettingsLayoutRoute,
})

function SettingsLayoutRoute() {
  const t = useTranslations()

  const tabs = [
    {
      label: t.settings.profile.title(),
      href: '/settings/profile',
      icon: IconBuilding,
      permission: { resource: 'settings', action: 'view' },
    },
    {
      label: t.settings.schoolYears.title(),
      href: '/settings/school-years',
      icon: IconCalendar,
      permission: { resource: 'settings', action: 'view' },
    },
    {
      label: t.nav.pedagogicalStructure ? t.nav.pedagogicalStructure() : 'Pédagogie',
      href: '/settings/pedagogical-structure',
      icon: IconHierarchy,
      permission: { resource: 'settings', action: 'view' },
    },
    {
      label: t.settings.reportCards.title(),
      href: '/settings/report-cards',
      icon: IconFileText,
      permission: { resource: 'settings', action: 'view' },
    },
    {
      label: t.nav.finance(),
      href: '/accounting/setup',
      icon: IconWallet,
      permission: { resource: 'finance', action: 'view' },
    },
    {
      label: t.settings.notifications(),
      href: '/settings/notifications',
      icon: IconBell,
      permission: { resource: 'settings', action: 'view' },
    },
  ]

  return (
    <TabbedLayout
      title={t.nav.settings()}
      description={t.settings.description()}
      icon={IconSettings}
      tabs={tabs}
    />
  )
}
