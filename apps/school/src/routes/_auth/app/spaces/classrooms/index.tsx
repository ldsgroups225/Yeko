import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ClassroomForm } from '@/components/spaces/classroom-form'
import { ClassroomsTable } from '@/components/spaces/classrooms/classrooms-table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const classroomsSearchSchema = z.object({
  search: z.string().optional(),
})

export const Route = createFileRoute('/_auth/app/spaces/classrooms/')({
  component: ClassroomsPage,
  validateSearch: classroomsSearchSchema,
})

function ClassroomsPage() {
  const [open, setOpen] = useState(false)
  const search = Route.useSearch()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Espaces', href: '/app/spaces/classrooms' },
          { label: 'Salles de classe' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salles de classe</h1>
          <p className="text-muted-foreground">Gérer les espaces physiques et équipements</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle salle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une salle</DialogTitle>
              <DialogDescription>Remplissez les informations pour créer une nouvelle salle de classe.</DialogDescription>
            </DialogHeader>
            <ClassroomForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <ClassroomsTable filters={search} />
    </div>
  )
}
