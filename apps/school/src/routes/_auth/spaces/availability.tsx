import { createFileRoute } from '@tanstack/react-router'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ClassroomAvailability } from '@/components/spaces/classroom-availability'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/spaces/availability')({
  component: AvailabilityPage,
})

function AvailabilityPage() {
  const t = useTranslations()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.nav.spaces(), href: '/spaces/classrooms' },
          { label: t.spaces.availability.title() },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.spaces.availability.title()}</h1>
        <p className="text-muted-foreground">{t.spaces.availability.description()}</p>
      </div>

      <ClassroomAvailability />
    </div>
  )
}
