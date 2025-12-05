import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, Plus, Users } from 'lucide-react'
import { useState } from 'react'
import { ClassForm } from '@/components/academic/class-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getClasses } from '@/school/functions/classes'

export const Route = createFileRoute('/_auth/app/academic/classes/')({
  component: ClassesPage,
})

function ClassesPage() {
  const [open, setOpen] = useState(false)
  const { data: classes } = useSuspenseQuery({
    queryKey: ['classes'],
    queryFn: () => getClasses({ data: {} }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground">Gérer les classes académiques</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle classe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une classe</DialogTitle>
              <DialogDescription>Remplissez les informations pour créer une nouvelle classe.</DialogDescription>
            </DialogHeader>
            <ClassForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((item: any) => (
          <Link
            key={item.class.id}
            to="/app/academic/classes/$classId"
            params={{ classId: item.class.id }}
          >
            <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {item.grade.name}
                      {' '}
                      {item.series?.name}
                      {' '}
                      {item.class.section}
                    </h3>
                    {item.classroom && <p className="text-sm text-muted-foreground">{item.classroom.name}</p>}
                  </div>
                  <Badge variant={item.class.status === 'active' ? 'default' : 'secondary'}>
                    {item.class.status === 'active' ? 'Active' : 'Archivée'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {item.studentsCount}
                      {' '}
                      /
                      {item.class.maxStudents}
                      {' '}
                      élèves
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {item.subjectsCount}
                      {' '}
                      matières
                    </span>
                  </div>

                  {item.homeroomTeacher && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">PP: </span>
                      <span>{item.homeroomTeacher.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {classes.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Aucune classe trouvée. Créez votre première classe pour commencer.</p>
        </Card>
      )}
    </div>
  )
}
