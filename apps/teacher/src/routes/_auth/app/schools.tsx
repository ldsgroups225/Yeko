import { IconSchool } from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { useTranslation } from 'react-i18next'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'

export const Route = createFileRoute('/_auth/app/schools')({
  component: SchoolsPage,
})

function SchoolsPage() {
  const { t } = useTranslation()
  const { context } = useRequiredTeacherContext()

  const schools = context?.schoolId ? [{ id: context.schoolId, name: 'Ma École' }] : []

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">{t('nav.ecole', 'École')}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schools.map(school => (
          <Link
            key={school.id}
            to="/app/schools/$schoolId/classes"
            params={{ schoolId: school.id }}
            className="block"
          >
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <IconSchool className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>{school.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('common.clickToViewClasses', 'Voir les classes')}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
