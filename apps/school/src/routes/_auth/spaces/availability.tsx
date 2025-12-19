import { createFileRoute } from '@tanstack/react-router'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ClassroomAvailability } from '@/components/spaces/classroom-availability'

export const Route = createFileRoute('/_auth/spaces/availability')({
  component: AvailabilityPage,
})

function AvailabilityPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Espaces', href: '/spaces/classrooms' },
          { label: 'Disponibilité' },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Disponibilité des salles</h1>
        <p className="text-muted-foreground">Vue d'ensemble de l'occupation des salles de classe</p>
      </div>

      <ClassroomAvailability />
    </div>
  )
}
