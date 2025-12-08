import { createFileRoute } from '@tanstack/react-router'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, ClipboardList, GraduationCap, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_auth/app/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { t, i18n } = useTranslation()
  const today = new Date()
  const locale = i18n.language === 'fr' ? fr : undefined

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      {/* Greeting */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">
          {t('app.greeting', { name: 'Enseignant' })}
        </h1>
        <p className="text-sm text-muted-foreground capitalize">
          {format(today, 'EEEE d MMMM yyyy', { locale })}
        </p>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            {t('dashboard.todaySchedule')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.noClassesToday')}
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t('dashboard.quickActions')}
        </h2>
        <div className="grid grid-cols-4 gap-2">
          <QuickActionButton
            icon={<ClipboardList className="h-5 w-5" />}
            label={t('session.notes')}
          />
          <QuickActionButton
            icon={<GraduationCap className="h-5 w-5" />}
            label={t('homework.title')}
          />
          <QuickActionButton
            icon={<Calendar className="h-5 w-5" />}
            label={t('grades.title')}
          />
          <QuickActionButton
            icon={<MessageSquare className="h-5 w-5" />}
            label={t('messages.title')}
          />
        </div>
      </div>

      {/* Pending Items */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.pendingGrades')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.unreadMessages')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface QuickActionButtonProps {
  icon: React.ReactNode
  label: string
}

function QuickActionButton({ icon, label }: QuickActionButtonProps) {
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3 text-center transition-colors hover:bg-muted active:scale-95"
    >
      <div className="text-primary">{icon}</div>
      <span className="text-xs font-medium leading-tight">{label}</span>
    </button>
  )
}
