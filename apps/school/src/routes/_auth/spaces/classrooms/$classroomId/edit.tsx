import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ClassroomForm } from '@/components/spaces/classroom-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from '@/i18n'
import { getClassroomById } from '@/school/functions/classrooms'

export const Route = createFileRoute('/_auth/spaces/classrooms/$classroomId/edit')({
  component: EditClassroomPage,
})

function EditClassroomPage() {
  const t = useTranslations()
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
          <p className="text-lg font-medium">{t.spaces.classroom.notFound()}</p>
          <Button asChild className="mt-4">
            <Link to="/spaces/classrooms">{t.common.back()}</Link>
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
          { label: t.nav.spaces(), href: '/spaces/classrooms' },
          { label: t.nav.classrooms(), href: '/spaces/classrooms' },
          { label: classroom.name, href: `/spaces/classrooms/${classroomId}` },
          { label: t.common.edit() },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.spaces.classroom.editClassroom()}</h1>
        <p className="text-muted-foreground">
          {t.spaces.classroom.editClassroomDescription()}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.spaces.classroom.classroomInfo()}</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassroomForm
            classroom={classroom}
            onSuccess={() => navigate({ to: '/spaces/classrooms/$classroomId', params: { classroomId } })}
          />
        </CardContent>
      </Card>
    </div>
  )
}
