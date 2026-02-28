import { IconBook, IconPlus, IconUsers } from '@tabler/icons-react'
/**
 * Classes Page
 * Teacher class list and management
 */
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { Badge } from '@workspace/ui/components/badge'

import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'

import { useI18nContext } from '@/i18n/i18n-react'
import { teacherClassesQueryOptions } from '@/lib/queries/classes'

export const Route = createFileRoute('/_auth/app/classes')({
  component: ClassesPage,
})

function ClassesPage() {
  const { LL } = useI18nContext()
  const { context } = useRequiredTeacherContext()

  const { data, isPending } = useQuery({
    ...teacherClassesQueryOptions({
      teacherId: context?.teacherId ?? '',
      schoolYearId: context?.schoolYearId ?? '',
    }),
    enabled: !!context?.teacherId && !!context?.schoolYearId,
  })

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{LL.classes.title()}</h1>
        <Button size="sm">
          <IconPlus className="mr-2 h-4 w-4" />
          {LL.classes.create()}
        </Button>
      </div>

      {isPending
        ? (
            <div className="
              grid gap-4
              md:grid-cols-2
              lg:grid-cols-3
            "
            >
              {[1, 2, 3, 4, 5, 6].map(el => (
                <Skeleton key={el} className="h-32 w-full" />
              ))}
            </div>
          )
        : data?.classes?.length === 0
          ? (
              <Card>
                <CardContent className="
                  flex flex-col items-center justify-center py-12
                "
                >
                  <IconBook className="text-muted-foreground mb-4 h-12 w-12" />
                  <p className="text-muted-foreground">
                    {LL.classes.noClasses()}
                  </p>
                  <Button className="mt-4">
                    <IconPlus className="mr-2 h-4 w-4" />
                    {LL.classes.createFirst()}
                  </Button>
                </CardContent>
              </Card>
            )
          : (
              <div className="
                grid gap-4
                md:grid-cols-2
                lg:grid-cols-3
              "
              >
                {data?.classes?.map((cls: { id: string, name: string, gradeName: string | null, studentCount: number, subjectCount: number }) => (
                  <Card
                    key={cls.id}
                    className="
                      transition-shadow
                      hover:shadow-md
                    "
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      {cls.gradeName && (
                        <Badge variant="secondary">{cls.gradeName}</Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="
                        text-muted-foreground flex items-center justify-between
                        text-sm
                      "
                      >
                        <div className="flex items-center gap-1">
                          <IconUsers className="h-4 w-4" />
                          <span>
                            {cls.studentCount}
                            {' '}
                            {LL.classes.students()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IconBook className="h-4 w-4" />
                          <span>
                            {cls.subjectCount}
                            {' '}
                            {LL.classes.subjects()}
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
