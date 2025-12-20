import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertTriangle, Bell, Settings, UserCheck, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/conducts/')({
  component: SchoolLifeDashboard,
})

function SchoolLifeDashboard() {
  const t = useTranslations()

  const cards = [
    {
      title: t.schoolLife.teacherAttendance(),
      description: t.schoolLife.teacherAttendanceDescription(),
      icon: UserCheck,
      href: '/conducts/teacher-attendance',
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: t.schoolLife.studentAttendance(),
      description: t.schoolLife.studentAttendanceDescription(),
      icon: Users,
      href: '/conducts/student-attendance',
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: t.schoolLife.conduct(),
      description: t.schoolLife.conductDescription(),
      icon: AlertTriangle,
      href: '/conducts/conduct',
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: t.schoolLife.alerts(),
      description: t.schoolLife.alertsDescription(),
      icon: Bell,
      href: '/conducts/alerts',
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: t.schoolLife.settings(),
      description: t.schoolLife.settingsDescription(),
      icon: Settings,
      href: '/conducts/settings',
      color: 'text-slate-600',
      bgColor: 'bg-slate-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Dashboard Content */}

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
