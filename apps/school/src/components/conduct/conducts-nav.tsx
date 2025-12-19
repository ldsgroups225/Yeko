import { AlertTriangle, Bell, Info, LayoutDashboard, Settings, UserCheck, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PageHeader, PageLayout, RouteTabs } from '@/components/layout/page-layout'

/**
 * Conducts navigation wrapper with generic layout
 */
export function ConductsLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()

  return (
    <PageLayout>
      <PageHeader
        title={t('nav.conducts')}
        description={t('schoolLife.description')}
        icon={AlertTriangle}
      />
      <ConductsNav />
      {children}
    </PageLayout>
  )
}

/**
 * Conducts generic navigation tabs
 */
export function ConductsNav() {
  const { t } = useTranslation()

  const tabs = [
    {
      title: t('schoolLife.dashboard'),
      href: '/conducts',
      icon: LayoutDashboard,
    },
    {
      title: t('schoolLife.studentAttendance'),
      href: '/conducts/student-attendance',
      icon: Users,
    },
    {
      title: t('schoolLife.teacherAttendance'),
      href: '/conducts/teacher-attendance',
      icon: UserCheck,
    },
    {
      title: t('schoolLife.conduct'),
      href: '/conducts/conduct',
      icon: Info,
    },
    {
      title: t('schoolLife.alerts'),
      href: '/conducts/alerts',
      icon: Bell,
    },
    {
      title: t('schoolLife.settings'),
      href: '/conducts/settings',
      icon: Settings,
    },
  ]

  return <RouteTabs tabs={tabs} />
}
