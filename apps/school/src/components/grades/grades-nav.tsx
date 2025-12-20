import { ClipboardCheck, FileText, Grid, LayoutDashboard } from 'lucide-react'
import { PageHeader, PageLayout, RouteTabs } from '@/components/layout/page-layout'

import { useTranslations } from '@/i18n'

/**
 * Grades navigation wrapper with generic layout
 */
export function GradesLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations()

  return (
    <PageLayout>
      <PageHeader
        title={t.nav.grades()}
        description={t.academic.grades.description()}
        icon={ClipboardCheck}
      />
      <GradesNav />
      {children}
    </PageLayout>
  )
}

/**
 * Grades generic navigation tabs
 */
export function GradesNav() {
  const t = useTranslations()

  const tabs = [
    {
      title: t.academic.grades.title(),
      href: '/grades',
      icon: LayoutDashboard,
    },
    {
      title: t.academic.grades.entry.title(),
      href: '/grades/entry',
      icon: FileText,
    },
    {
      title: t.academic.grades.statistics.title(),
      href: '/grades/statistics',
      icon: Grid,
    },
    {
      title: t.academic.grades.validations.title(),
      href: '/grades/validations',
      icon: ClipboardCheck,
    },
    {
      title: t.academic.grades.reportCards(),
      href: '/grades/report-cards',
      icon: FileText,
    },
  ]

  return <RouteTabs tabs={tabs} />
}
