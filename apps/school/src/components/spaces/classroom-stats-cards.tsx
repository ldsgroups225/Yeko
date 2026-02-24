import {
  IconBuilding,
  IconCircleCheck,
  IconCircleX,
  IconUsers,
} from '@tabler/icons-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'

export function ClassroomStatsCards({
  available,
  occupied,
  maintenance,
  inactive,
}: {
  available: number
  occupied: number
  maintenance: number
  inactive: number
}) {
  const t = useTranslations()

  const stats = [
    {
      title: t.spaces.classrooms.available(),
      value: available,
      icon: IconCircleCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10 border-green-500/20',
      description: 'Prêtes à l\'emploi',
    },
    {
      title: t.spaces.classrooms.occupied(),
      value: occupied,
      icon: IconUsers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      description: 'En cours d\'utilisation',
    },
    {
      title: t.spaces.classrooms.maintenance(),
      value: maintenance,
      icon: IconBuilding,
      color: 'text-accent',
      bgColor: 'bg-accent/10 border-accent/20',
      description: 'Intervention requise',
    },
    {
      title: t.spaces.classrooms.inactive(),
      value: inactive,
      icon: IconCircleX,
      color: 'text-gray-600',
      bgColor: 'bg-gray-500/10 border-gray-500/20',
      description: 'Hors service',
    },
  ]

  return (
    <div
      className="grid gap-6 md:grid-cols-4"
      role="list"
      aria-label={t.spaces.classrooms.roomStatistics()}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card
            role="listitem"
            className={`rounded-3xl border bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 ${stat.bgColor.replace('bg-', 'border-').replace('/10', '/20')}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                  <stat.icon
                    className={`h-4 w-4 ${stat.color}`}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <span
                  className="text-3xl font-black tracking-tight"
                  aria-label={`${stat.value} ${stat.title}`}
                >
                  {stat.value}
                </span>
                <span className="text-xs font-medium text-muted-foreground/80">
                  {stat.description}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
