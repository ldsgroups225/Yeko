import { IconCalendar } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ClassroomAvailability } from '@/components/spaces/classroom-availability'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/spaces/availability')({
  component: AvailabilityPage,
})

function AvailabilityPage() {
  const t = useTranslations()

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.spaces(), href: '/spaces/classrooms' },
          { label: t.spaces.availability.title() },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
          <IconCalendar className="size-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.spaces.availability.title()}</h1>
          <p className="text-sm font-medium text-muted-foreground italic max-w-lg">{t.spaces.availability.description()}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ClassroomAvailability />
      </motion.div>
    </div>
  )
}
