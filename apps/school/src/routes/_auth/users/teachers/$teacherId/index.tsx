import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { BookOpen, Calendar, Edit, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getTeacher } from '@/school/functions/teachers'

export const Route = createFileRoute('/_auth/users/teachers/$teacherId/')({
  component: TeacherDetailsPage,
})

function TeacherDetailsPage() {
  const { teacherId } = Route.useParams()
  const { t } = useTranslation()

  const { data: teacher, isLoading } = useQuery({
    queryKey: ['teacher', teacherId],
    queryFn: async () => {
      const result = await getTeacher({ data: teacherId })
      return result
    },
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">{t('errors.notFound')}</p>
          <Button asChild className="mt-4">
            <Link to="/users/teachers" search={{ page: 1 }}>
              {t('common.back')}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('hr.title'), href: '/users' },
          { label: t('hr.teachers.title'), href: '/users/teachers' },
          { label: teacherId },
        ]}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {teacher.specialization?.charAt(0).toUpperCase() ?? 'T'}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('hr.teachers.teacherDetails')}</h1>
            <p className="text-muted-foreground">{teacher.specialization ?? t('hr.teachers.noSpecialization')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            {t('common.delete')}
          </Button>
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" />
            {t('common.edit')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">{t('hr.teachers.tabs.info')}</TabsTrigger>
          <TabsTrigger value="subjects">{t('hr.teachers.tabs.subjects')}</TabsTrigger>
          <TabsTrigger value="classes">{t('hr.teachers.tabs.classes')}</TabsTrigger>
          <TabsTrigger value="schedule">{t('hr.teachers.tabs.schedule')}</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">{t('hr.teachers.personalInfo')}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {teacher.hireDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('hr.teachers.hireDate')}</p>
                    <p className="font-medium">
                      {format(new Date(teacher.hireDate), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t('hr.teachers.status')}</p>
                  <Badge
                    variant={
                      teacher.status === 'active'
                        ? 'default'
                        : teacher.status === 'on_leave'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {t(`hr.status.${teacher.status}`)}
                  </Badge>
                </div>
              </div>
              {teacher.specialization && (
                <div className="flex items-center gap-3 md:col-span-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('hr.teachers.specialization')}
                    </p>
                    <p className="font-medium">{teacher.specialization}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">{t('hr.teachers.assignedSubjects')}</h2>
            <div className="flex flex-wrap gap-2">
              {teacher.subjects && teacher.subjects.length > 0
                ? (
                    teacher.subjects.map(subject => (
                      <Badge key={subject.subjectId} variant="secondary" className="text-sm">
                        {subject.subjectName}
                      </Badge>
                    ))
                  )
                : (
                    <p className="text-sm text-muted-foreground">{t('hr.teachers.noSubjects')}</p>
                  )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">{t('hr.teachers.assignedClasses')}</h2>
            <p className="text-sm text-muted-foreground">{t('hr.teachers.noClasses')}</p>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">{t('hr.teachers.schedule')}</h2>
            <p className="text-sm text-muted-foreground">{t('hr.teachers.scheduleComingSoon')}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
