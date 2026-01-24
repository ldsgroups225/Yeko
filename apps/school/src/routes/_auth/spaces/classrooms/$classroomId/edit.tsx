import { IconArrowLeft, IconEdit } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { motion } from 'motion/react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ClassroomForm } from '@/components/spaces/classroom-form'
import { useTranslations } from '@/i18n'
import { getClassroomById } from '@/school/functions/classrooms'

export const Route = createFileRoute(
  '/_auth/spaces/classrooms/$classroomId/edit',
)({
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
          <p className="text-lg font-medium text-muted-foreground">
            {t.spaces.classroom.notFound()}
          </p>
          <Button
            render={<Link to="/spaces/classrooms">{t.common.back()}</Link>}
            className="mt-4 rounded-xl shadow-lg shadow-primary/20"
          />
        </div>
      </div>
    )
  }

  const { classroom } = data

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.spaces(), href: '/spaces/classrooms' },
          { label: t.nav.classrooms(), href: '/spaces/classrooms' },
          { label: classroom.name, href: `/spaces/classrooms/${classroomId}` },
          { label: t.common.edit() },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
            <IconEdit className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">
              {t.spaces.classroom.editClassroom()}
            </h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-lg">
              {t.spaces.classroom.editClassroomDescription()}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="outline"
            render={(
              <Link
                to="/spaces/classrooms/$classroomId"
                params={{ classroomId }}
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                {t.common.back()}
              </Link>
            )}
            className="rounded-xl border-border/40"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm">
          <CardHeader className="border-b border-border/40 bg-muted/5">
            <CardTitle className="text-lg font-bold uppercase tracking-wider text-muted-foreground">
              {t.spaces.classroom.classroomInfo()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ClassroomForm
              classroom={{
                ...classroom,
                floor: classroom.floor ?? undefined,
                building: classroom.building ?? undefined,
                notes: classroom.notes ?? undefined,
              }}
              onSuccess={() =>
                navigate({
                  to: '/spaces/classrooms/$classroomId',
                  params: { classroomId },
                })}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
