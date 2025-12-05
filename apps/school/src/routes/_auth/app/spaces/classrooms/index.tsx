import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { ClassroomForm } from '@/components/spaces/classroom-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getClassrooms } from '@/school/functions/classrooms'

export const Route = createFileRoute('/_auth/app/spaces/classrooms/')({
  component: ClassroomsPage,
})

function ClassroomsPage() {
  const [open, setOpen] = useState(false)
  const { data: classrooms } = useSuspenseQuery({
    queryKey: ['classrooms'],
    queryFn: () => getClassrooms({ data: {} }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Salles de classe</h1>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classrooms.map((item: any) => (
          <Link
            key={item.classroom.id}
            to="/app/spaces/classrooms/$classroomId"
            params={{ classroomId: item.classroom.id }}
          >
            <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{item.classroom.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.classroom.code}</p>
                  </div>
                  <Badge variant={item.classroom.status === 'active' ? 'default' : 'secondary'}>
                    {item.classroom.status === 'active' ? 'Actif' : item.classroom.status === 'maintenance' ? 'Maintenance' : 'Inactif'}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{item.classroom.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacité:</span>
                    <span>
                      {item.classroom.capacity}
                      {' '}
                      élèves
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Classes:</span>
                    <span>
                      {item.assignedClassesCount}
                      {' '}
                      classe(s)
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {classrooms.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Aucune salle trouvée. Créez votre première salle pour commencer.</p>
        </Card>
      )}
    </div>
  )
}
