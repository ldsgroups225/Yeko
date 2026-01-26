import { IconSchool } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useTranslation } from 'react-i18next'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { getTeacherSchoolsQuery } from '@/teacher/functions/schools'

export const Route = createFileRoute('/_auth/app/schools')({
  component: SchoolsPage,
})

function SchoolsPage() {
  const { t } = useTranslation()
  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const { data: schools, isLoading: schoolsLoading } = useQuery({
    queryKey: ['teacher', 'schools', context?.userId],
    queryFn: () => getTeacherSchoolsQuery({ data: { userId: context?.userId ?? '' } }),
    enabled: !!context?.userId,
  })

  const isLoading = contextLoading || schoolsLoading

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-7 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (!schools || schools.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-xl font-semibold">{t('nav.ecole', 'École')}</h1>
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Aucun établissement lié</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                {school.code && (
                  <p className="text-sm text-muted-foreground mb-1">
                    Code: {school.code}
                  </p>
                )}
                {school.address && (
                  <p className="text-sm text-muted-foreground mb-1">
                    {school.address}
                  </p>
                )}
                {school.phone && (
                  <p className="text-sm text-muted-foreground">
                    {school.phone}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
