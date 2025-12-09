import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ClassForm } from '@/components/academic/class-form'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getClassById } from '@/school/functions/classes'

export const Route = createFileRoute('/_auth/app/academic/classes/$classId/edit')({
  component: EditClassPage,
})

function EditClassPage() {
  const { t } = useTranslation()
  const { classId } = Route.useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['class', classId],
    queryFn: () => getClassById({ data: classId }),
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data?.class) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">{t('academic.classes.notFound')}</p>
          <Button asChild className="mt-4">
            <Link to="/app/academic/classes">{t('common.back')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  const { class: classData, grade, series } = data
  const className = `${grade.name} ${series?.name || ''} ${classData.section}`.trim()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.academic'), href: '/app/academic' },
          { label: t('nav.classes'), href: '/app/academic/classes' },
          { label: className, href: `/app/academic/classes/${classId}` },
          { label: t('common.edit') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('academic.classes.editClass')}</h1>
        <p className="text-muted-foreground">
          {t('academic.classes.editClassDescription', { name: className })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('academic.classes.classInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassForm
            classData={classData}
            onSuccess={() => navigate({ to: '/app/academic/classes/$classId', params: { classId } })}
          />
        </CardContent>
      </Card>
    </div>
  )
}
