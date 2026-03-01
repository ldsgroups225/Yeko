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
        <div className="
          bg-primary/10 border-primary/20 rounded-2xl border p-3 shadow-lg
          backdrop-blur-xl
        "
        >
          <IconCalendar className="text-primary size-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.spaces.availability.title()}</h1>
          <p className="
            text-muted-foreground max-w-lg text-sm font-medium italic
          "
          >
            {t.spaces.availability.description()}
          </p>
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
