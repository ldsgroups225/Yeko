import { IconChevronRight, IconSchool } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useTranslation } from 'react-i18next'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { teacherClassesQueryOptions } from '@/lib/queries/dashboard'

export const Route = createFileRoute('/_auth/app/grades')({
  component: GradesPage,
})

function GradesPage() {
  const { t } = useTranslation()

  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const { data, isLoading: dataLoading } = useQuery({
    ...teacherClassesQueryOptions({
      teacherId: context?.teacherId ?? '',
      schoolId: context?.schoolId ?? '',
      schoolYearId: context?.schoolYearId ?? '',
    }),
    enabled: !!context,
  })

  const isLoading = contextLoading || dataLoading

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <h1 className="text-xl font-semibold">{t('grades.title')}</h1>

      <p className="text-sm text-muted-foreground">{t('grades.selectClass')}</p>

      {isLoading
        ? (
            <GradesSkeleton />
          )
        : data?.classes && data.classes.length > 0
          ? (
              <div className="space-y-3">
                {data.classes.map(cls => (
                  <ClassCard key={cls.id} classData={cls} />
                ))}
              </div>
            )
          : (
              <EmptyClasses />
            )}
    </div>
  )
}

interface ClassCardProps {
  classData: {
    id: string
    name: string
    studentCount: number
    subjects: Array<{
      id: string
      name: string
      shortName: string | null
    }>
  }
}

function ClassCard({ classData }: ClassCardProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{classData.name}</h3>
            <p className="text-xs text-muted-foreground">
              {classData.studentCount}
              {' '}
              {t('common.students')}
            </p>
          </div>
          <Badge variant="secondary">
            {classData.subjects.length}
            {' '}
            {t('grades.subjects', 'matières')}
          </Badge>
        </div>

        <div className="space-y-2">
          {classData.subjects.map(subject => (
            <Link
              key={subject.id}
              to="/app/grades/$classId/$subjectId"
              params={{ classId: classData.id, subjectId: subject.id }}
              className="flex w-full items-center justify-between rounded-lg bg-muted/50 p-3 text-left transition-colors hover:bg-muted active:scale-[0.98]"
            >
              <div>
                <p className="text-sm font-medium">{subject.name}</p>
                {subject.shortName && (
                  <p className="text-xs text-muted-foreground">
                    {subject.shortName}
                  </p>
                )}
              </div>
              <IconChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyClasses() {
  const { t } = useTranslation()

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <IconSchool className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">
          {t('grades.noClasses')}
        </p>
      </CardContent>
    </Card>
  )
}

function GradesSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
