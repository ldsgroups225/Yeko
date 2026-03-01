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

  const { data: result, isPending } = useQuery({
    queryKey: ['classroom', classroomId],
    queryFn: () => getClassroomById({ data: classroomId }),
  })
  const data = result?.success ? result.data : null

  if (isPending) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="
          border-primary h-8 w-8 animate-spin rounded-full border-4
          border-t-transparent
        "
        />
      </div>
    )
  }

  if (!data?.classroom) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg font-medium">
            {t.spaces.classroom.notFound()}
          </p>
          <Button
            render={<Link to="/spaces/classrooms">{t.common.back()}</Link>}
            className="shadow-primary/20 mt-4 rounded-xl shadow-lg"
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

      <div className="
        flex flex-col gap-4
        sm:flex-row sm:items-end sm:justify-between
      "
      >
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
            <IconEdit className="text-primary size-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">
              {t.spaces.classroom.editClassroom()}
            </h1>
            <p className="
              text-muted-foreground max-w-lg text-sm font-medium italic
            "
            >
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
            className="border-border/40 rounded-xl"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="
          border-border/40 bg-card/40 rounded-3xl border shadow-sm
          backdrop-blur-xl
        "
        >
          <CardHeader className="border-border/40 bg-muted/5 border-b">
            <CardTitle className="
              text-muted-foreground text-lg font-bold tracking-wider uppercase
            "
            >
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
