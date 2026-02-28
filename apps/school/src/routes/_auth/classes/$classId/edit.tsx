import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { ClassForm } from '@/components/academic/class-form'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { getClassById } from '@/school/functions/classes'

export const Route = createFileRoute('/_auth/classes/$classId/edit')({
  component: EditClassPage,
})

function EditClassPage() {
  const t = useTranslations()
  const { classId } = Route.useParams()
  const navigate = useNavigate()

  const { data: result, isPending } = useQuery({
    queryKey: ['class', classId],
    queryFn: () => getClassById({ data: classId }),
  })

  // Safely extract the data from the Result object
  const classInfo = result?.success ? result.data : null

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

  if (!classInfo) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">{t.classes.notFound()}</p>
          <Button
            render={<Link to="/classes">{t.common.back()}</Link>}
            className="mt-4"
          />
        </div>
      </div>
    )
  }

  const { class: classData, grade, series } = classInfo
  const className
    = `${grade.name} ${series?.name || ''} ${classData.section}`.trim()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.nav.academic(), href: '/academic' },
          { label: t.nav.classes(), href: '/classes' },
          { label: className, href: `/classes/${classId}` },
          { label: t.common.edit() },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.common.edit()}</h1>
        <p className="text-muted-foreground">
          {t.classes.editClassDescription()}
        </p>
      </div>

      <Card className="border-border/40 bg-card/50 shadow-sm backdrop-blur-xl">
        <CardHeader>
          <CardTitle>{t.classes.classInfo()}</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassForm
            classData={{ ...classInfo, subjectsCount: 0 }}
            onSuccess={() =>
              navigate({ to: '/classes/$classId', params: { classId } })}
          />
        </CardContent>
      </Card>
    </div>
  )
}
