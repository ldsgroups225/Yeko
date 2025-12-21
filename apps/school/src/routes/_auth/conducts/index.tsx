import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertTriangle, ArrowRight, Bell, Settings, Sparkles, UserCheck, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

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
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: t.schoolLife.studentAttendance(),
      description: t.schoolLife.studentAttendanceDescription(),
      icon: Users,
      href: '/conducts/student-attendance',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: t.schoolLife.conduct(),
      description: t.schoolLife.conductDescription(),
      icon: AlertTriangle,
      href: '/conducts/conduct',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
    },
    {
      title: t.schoolLife.alerts(),
      description: t.schoolLife.alertsDescription(),
      icon: Bell,
      href: '/conducts/alerts',
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
    },
    {
      title: t.schoolLife.settings(),
      description: t.schoolLife.settingsDescription(),
      icon: Settings,
      href: '/conducts/settings',
      color: 'text-zinc-500',
      bgColor: 'bg-zinc-500/10',
      borderColor: 'border-zinc-500/20',
    },
  ]

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs items={[{ label: t.nav.schoolLife() }]} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-8 text-primary"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="size-32" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 rounded-2xl bg-primary/10 backdrop-blur-xl border border-primary/20 shadow-lg">
            <AlertTriangle className="size-12" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black tracking-tight mb-2 uppercase italic">{t.nav.conducts()}</h1>
            <p className="text-primary/70 font-medium max-w-xl italic">
              {t.schoolLife.description()}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Link to={card.href} className="group">
              <Card className={cn(
                'relative overflow-hidden h-full rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl transition-all duration-300',
                'hover:bg-card/50 hover:shadow-2xl hover:shadow-primary/5',
              )}
              >
                <div className={cn('absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity duration-500', card.color)}>
                  <card.icon className="size-24" />
                </div>

                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                  <div className={cn('rounded-2xl p-3 border transition-transform duration-500 group-hover:scale-110', card.bgColor, card.borderColor)}>
                    <card.icon className={cn('h-6 w-6', card.color)} />
                  </div>
                  <CardTitle className="text-lg font-black tracking-tight">{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs font-medium text-muted-foreground/60 leading-relaxed min-h-12">
                    {card.description}
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40 group-hover:translate-x-1 transition-transform">
                    {t.common.view()}
                    {' '}
                    <ArrowRight className="size-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
