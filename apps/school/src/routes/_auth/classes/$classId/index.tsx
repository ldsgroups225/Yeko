import {
  IconEdit,
  IconSchool,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs'
import { useState } from 'react'
import { toast } from 'sonner'
import { ClassSubjectManager } from '@/components/academic/class-subjects/class-subject-manager'
import { ClassStudentList } from '@/components/academic/classes/class-student-list'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { deleteClass, getClassById } from '@/school/functions/classes'

export const Route = createFileRoute('/_auth/classes/$classId/')({
  component: ClassDetailPage,
})

function ClassDetailPage() {
  const t = useTranslations()
  const { classId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: result, isLoading } = useQuery({
    queryKey: ['class', classId],
    queryFn: () => getClassById({ data: classId }),
  })

  // Safely extract data from Result
  const classInfo = result?.success ? result.data : null

  const deleteMutation = useMutation({
    mutationFn: () => deleteClass({ data: classId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      toast.success(t.classes.deleteSuccess())
      navigate({ to: '/classes' })
    },
    onError: (error) => {
      toast.error(error.message || t.classes.deleteError())
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
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

  const {
    class: classData,
    grade,
    series,
    classroom,
    homeroomTeacher,
    studentsCount,
    boysCount,
    girlsCount,
  } = classInfo
  const className
    = `${grade.name} ${series?.name || ''} ${classData.section}`.trim()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.nav.academic(), href: '/academic' },
          { label: t.nav.classes(), href: '/classes' },
          { label: className },
        ]}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <IconSchool className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{className}</h1>
            {classroom
              ? (
                  <Link
                    to="/spaces/classrooms/$classroomId"
                    params={{ classroomId: classroom.id }}
                    className="text-muted-foreground hover:underline"
                  >
                    {classroom.name}
                  </Link>
                )
              : (
                  <p className="text-muted-foreground">{t.classes.noClassroom()}</p>
                )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <IconTrash className="mr-2 h-4 w-4" />
            {t.common.delete()}
          </Button>
          <Button
            size="sm"
            onClick={() =>
              navigate({ to: '/classes/$classId/edit', params: { classId } })}
          >
            <IconEdit className="mr-2 h-4 w-4" />
            {t.common.edit()}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">{t.classes.tabs.stats()}</TabsTrigger>
          <TabsTrigger value="students">
            {t.classes.tabs.students()}
          </TabsTrigger>
          <TabsTrigger value="teachers">
            {t.classes.tabs.teachers()}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.classes.studentCount()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <IconUsers className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{studentsCount}</span>
                  <span className="text-muted-foreground">
                    /
                    {classData.maxStudents}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground italic">
                  {t.classes.boys()}
                  :
                  {' '}
                  <span className="font-bold text-foreground">{boysCount}</span>
                  {' '}
                  /
                  {' '}
                  {t.classes.girls()}
                  :
                  {' '}
                  <span className="font-bold text-foreground">
                    {girlsCount}
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.classes.status()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={
                    classData.status === 'active' ? 'default' : 'secondary'
                  }
                >
                  {classData.status === 'active'
                    ? t.common.active()
                    : t.common.archived()}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.classes.room()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {classroom
                  ? (
                      <span className="text-lg font-medium">{classroom.name}</span>
                    )
                  : (
                      <span className="text-lg font-medium text-muted-foreground">
                        -
                      </span>
                    )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
            <CardHeader>
              <CardTitle>{t.classes.details()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.classes.grade()}
                  </p>
                  <p className="text-base">{grade.name}</p>
                </div>
                {series && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t.classes.series()}
                    </p>
                    <p className="text-base">{series.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.classes.section()}
                  </p>
                  <p className="text-base">{classData.section}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.classes.homeroomTeacher()}
                  </p>
                  <p className="text-base">
                    {homeroomTeacher?.name || t.common.unassigned()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <ClassStudentList classId={classId} />
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <ClassSubjectManager classId={classId} className={className} />
        </TabsContent>
      </Tabs>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t.common.deleteConfirmTitle()}
        description={t.common.deleteConfirmDescription({ name: className })}
        confirmText={className}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
