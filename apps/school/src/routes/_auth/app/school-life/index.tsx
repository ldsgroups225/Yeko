import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertTriangle, Bell, Settings, UserCheck, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_auth/app/school-life/')({
  component: SchoolLifeDashboard,
})

function SchoolLifeDashboard() {
  const { t } = useTranslation()

  const cards = [
    {
      title: t('schoolLife.teacherAttendance'),
      description: t('schoolLife.teacherAttendanceDescription'),
      icon: UserCheck,
      href: '/app/school-life/teacher-attendance',
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: t('schoolLife.studentAttendance'),
      description: t('schoolLife.studentAttendanceDescription'),
      icon: Users,
      href: '/app/school-life/student-attendance',
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: t('schoolLife.conduct'),
      description: t('schoolLife.conductDescription'),
      icon: AlertTriangle,
      href: '/app/school-life/conduct',
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: t('schoolLife.alerts'),
      description: t('schoolLife.alertsDescription'),
      icon: Bell,
      href: '/app/school-life/alerts',
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: t('schoolLife.settings'),
      description: t('schoolLife.settingsDescription'),
      icon: Settings,
      href: '/app/school-life/settings',
      color: 'text-slate-600',
      bgColor: 'bg-slate-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.schoolLife') },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t('schoolLife.title')}</h1>
        <p className="text-muted-foreground">{t('schoolLife.description')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map(card => (
          <Link key={card.href} to={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div className={`rounded-lg p-2 ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <CardTitle className="text-base">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
