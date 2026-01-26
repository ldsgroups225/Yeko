import { IconBook, IconPlus, IconUsers } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useTranslation } from 'react-i18next'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { teacherClassesQueryOptions } from '@/lib/queries/classes'

export const Route = createFileRoute('/_auth/app/schools/$schoolId/classes')({
  component: SchoolClassesPage,
})

function SchoolClassesPage() {
  const { t } = useTranslation()
  const { schoolId } = Route.useParams()
  const { context } = useRequiredTeacherContext()

  const { data, isLoading } = useQuery({
    ...teacherClassesQueryOptions({
      teacherId: context?.teacherId ?? '',
      schoolYearId: context?.schoolYearId ?? '',
      schoolId,
    }),
    enabled: !!context?.teacherId && !!context?.schoolYearId && !!schoolId,
  })

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('classes.title', 'Mes Classes')}</h1>
        <Button size="sm">
          <IconPlus className="w-4 h-4 mr-2" />
          {t('classes.create', 'Créer une classe')}
        </Button>
      </div>

      {isLoading
        ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(el => (
                <Skeleton key={el} className="h-32 w-full" />
              ))}
            </div>
          )
        : data?.classes?.length === 0
          ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <IconBook className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {t('classes.noClasses', 'Aucune classe trouvée')}
                  </p>
                  <Button className="mt-4">
                    <IconPlus className="w-4 h-4 mr-2" />
                    {t('classes.createFirst', 'Créer votre première classe')}
                  </Button>
                </CardContent>
              </Card>
            )
          : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data?.classes?.map((cls: { id: string, name: string, gradeName: string | null, studentCount: number, subjectCount: number }) => (
                  <Card key={cls.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      {cls.gradeName && (
                        <Badge variant="secondary">{cls.gradeName}</Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <IconUsers className="w-4 h-4" />
                          <span>
                            {cls.studentCount}
                            {' '}
                            {t('classes.students', 'élèves')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IconBook className="w-4 h-4" />
                          <span>
                            {cls.subjectCount}
                            {' '}
                            {t('classes.subjects', 'matières')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
    </div>
  )
}
