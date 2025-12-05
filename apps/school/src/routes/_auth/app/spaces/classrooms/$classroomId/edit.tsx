import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ClassroomForm } from '@/components/spaces/classroom-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getClassroomById } from '@/school/functions/classrooms'

export const Route = createFileRoute('/_auth/app/spaces/classrooms/$classroomId/edit')({
  component: EditClassroomPage,
})

function EditClassroomPage() {
  const { classroomId } = Route.useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['classroom', classroomId],
    queryFn: () => getClassroomById({ data: classroomId }),
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data?.classroom) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Salle non trouvée</p>
          <Button asChild className="mt-4">
            <Link to="/app/spaces/classrooms">Retour</Link>
          </Button>
        </div>
      </div>
    )
  }

  const { classroom } = data

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Espaces', href: '/app/spaces/classrooms' },
          { label: 'Salles de classe', href: '/app/spaces/classrooms' },
          { label: classroom.name, href: `/app/spaces/classrooms/${classroomId}` },
          { label: 'Modifier' },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Modifier la salle</h1>
        <p className="text-muted-foreground">
          Modifier les informations de
          {classroom.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la salle</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassroomForm
            classroom={classroom}
            onSuccess={() => navigate({ to: '/app/spaces/classrooms/$classroomId', params: { classroomId } })}
          />
        </CardContent>
      </Card>
    </div>
  )
}
