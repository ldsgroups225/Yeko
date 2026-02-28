import { formatDate } from '@repo/data-ops'
import {
  IconBook,
  IconCalendar,
  IconCheck,
  IconChevronLeft,
  IconEdit,
  IconMail,
  IconPhone,
  IconPlus,
  IconTrash,
  IconUser,
  IconUserCheck,
  IconX,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { TeacherClasses } from '@/components/hr/teachers/teacher-classes'
import { TeacherTimetable } from '@/components/hr/teachers/teacher-timetable'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { schoolSubjectsOptions } from '@/lib/queries/school-subjects'
import { teacherKeys, teacherMutations, teacherOptions } from '@/lib/queries/teachers'

import { cn } from '@/lib/utils'
import { deleteExistingTeacher } from '@/school/functions/teachers'

export const Route = createFileRoute('/_auth/users/teachers/$teacherId/')({
  component: TeacherDetailsPage,
})

interface TeacherSubject {
  subjectId: string
  subjectName: string
}

interface SchoolSubject {
  id: string
  name: string
}

function TeacherDetailsPage() {
  const { teacherId } = Route.useParams()
  const t = useTranslations()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: teacher, isPending } = useQuery({
    ...teacherOptions.detail(teacherId),
  })

  const { data: classes, isPending: isPendingClasses } = useQuery({
    ...teacherOptions.classes(teacherId),
  })

  const deleteMutation = useMutation({
    mutationKey: schoolMutationKeys.teachers.delete,
    mutationFn: async () => {
      return await deleteExistingTeacher({ data: teacherId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast.success(t.hr.teachers.deleteSuccess())
      navigate({ to: '/users/teachers', search: { page: 1 } })
    },
    onError: () => {
      toast.error(t.hr.teachers.deleteError())
    },
  })

  const [isAddingSubject, setIsAddingSubject] = useState(false)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')

  const { data: allSubjects } = useQuery(schoolSubjectsOptions.list())

  const assignSubjectsMutation = useMutation({
    ...teacherMutations.assignSubjects,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(teacherId) })
      setIsAddingSubject(false)
      setSelectedSubjectId('')
      toast.success(t.hr.teachers.addSubjectSuccess())
    },
    onError: (error: Error) => {
      toast.error(error.message || t.hr.teachers.addSubjectError())
    },
  })

  const handleAddSubject = () => {
    if (!selectedSubjectId || !teacher)
      return
    const currentSubjectIds = teacher.subjects?.map((s: TeacherSubject) => s.subjectId) || []
    assignSubjectsMutation.mutate({
      teacherId,
      subjectIds: [...currentSubjectIds, selectedSubjectId],
    })
  }

  const availableSubjects = useMemo(() => {
    return (allSubjects?.subjects as SchoolSubject[] | undefined)?.filter(
      s => !teacher?.subjects?.some((ts: TeacherSubject) => ts.subjectId === s.id),
    ) || []
  }, [allSubjects?.subjects, teacher?.subjects])
  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-1/4" />
        <div className="flex items-center gap-6">
          <Skeleton className="size-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="
        flex min-h-[400px] flex-col items-center justify-center text-center
      "
      >
        <div className="
          mb-4 flex size-16 items-center justify-center rounded-full
          bg-red-500/10
        "
        >
          <IconUserCheck className="size-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold">{t.errors.notFound()}</h2>
        <p className="text-muted-foreground mt-2 max-w-xs">
          {t.hr.teachers.teacherNotFoundDescription()}
        </p>
        <Button
          render={(
            <Link to="/users/teachers" search={{ page: 1 }}>
              <IconChevronLeft className="mr-2 size-4" />
              {t.common.back()}
            </Link>
          )}
          className="mt-6 rounded-xl"
          variant="outline"
        />
      </div>
    )
  }

  const user = teacher.user

  return (
    <div className="space-y-8 pb-10">
      <div className="
        flex flex-col gap-6
        lg:flex-row lg:items-end lg:justify-between
      "
      >
        <div className="space-y-4">
          <Breadcrumbs
            items={[
              { label: t.hr.title(), href: '/users' },
              { label: t.hr.teachers.title(), href: '/users/teachers' },
              { label: user?.name || teacherId },
            ]}
          />

          <div className="
            flex flex-col gap-6
            sm:flex-row sm:items-center
          "
          >
            <Avatar className="
              ring-background border-primary/20 size-24 border-2 shadow-xl
              ring-4
            "
            >
              <AvatarImage src={user?.avatarUrl || undefined} />
              <AvatarFallback className="
                bg-primary/5 text-primary text-3xl font-black
              "
              >
                {user?.name?.charAt(0).toUpperCase() || 'T'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="
                  text-foreground text-4xl font-black tracking-tight
                "
                >
                  {user?.name}
                </h1>
                <Badge
                  className={cn(
                    'px-2 text-[10px] font-bold tracking-widest uppercase',
                    teacher.status === 'active'
                      ? 'bg-success/10 text-success border-success/20'
                      : teacher.status === 'on_leave'
                        ? 'bg-accent/10 text-accent-foreground border-accent/20'
                        : 'bg-muted text-muted-foreground',
                  )}
                  variant="outline"
                >
                  {t.hr.status[
                    teacher.status as keyof typeof t.hr.status
                  ]?.() || teacher.status}
                </Badge>
              </div>
              <div className="
                text-muted-foreground mt-2 flex flex-wrap items-center gap-x-5
                gap-y-2 text-sm
              "
              >
                <div className="flex items-center gap-1.5 font-medium">
                  <IconBook className="text-primary/60 size-4" />
                  {teacher.specialization || t.hr.teachers.noSpecialization()}
                </div>
                {user?.email && (
                  <div className="flex items-center gap-1.5">
                    <IconMail className="size-4 opacity-70" />
                    <a
                      href={`mailto:${user.email}`}
                      className="
                        hover:text-primary
                        underline-offset-4 transition-colors
                        hover:underline
                      "
                    >
                      {user.email}
                    </a>
                  </div>
                )}
                {user?.phone && (
                  <div className="flex items-center gap-1.5">
                    <IconPhone className="size-4 opacity-70" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            className="
              border-border/40 rounded-2xl shadow-sm transition-all
              hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-500
            "
            onClick={() => setShowDeleteDialog(true)}
          >
            <IconTrash className="mr-2 size-4" />
            {t.common.delete()}
          </Button>
          <Button
            render={(
              <Link to="/users/teachers/$teacherId/edit" params={{ teacherId }}>
                <IconEdit className="mr-2 size-4" />
                {t.common.edit()}
              </Link>
            )}
            size="lg"
            className="
              shadow-primary/20 rounded-2xl shadow-lg transition-all
              hover:-translate-y-0.5
              active:translate-y-0
            "
          />
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="
          border-border/40 bg-card/40 h-14 w-full justify-start gap-1
          rounded-2xl border p-1.5 backdrop-blur-md
        "
        >
          <TabsTrigger
            value="info"
            className="
              data-[state=active]:bg-background data-[state=active]:text-primary
              h-full rounded-xl px-6 font-semibold transition-all
              data-[state=active]:shadow-sm
            "
          >
            {t.hr.teachers.tabs.info()}
          </TabsTrigger>
          <TabsTrigger
            value="subjects"
            className="
              data-[state=active]:bg-background data-[state=active]:text-primary
              h-full rounded-xl px-6 font-semibold transition-all
              data-[state=active]:shadow-sm
            "
          >
            {t.hr.teachers.tabs.subjects()}
          </TabsTrigger>
          <TabsTrigger
            value="classes"
            className="
              data-[state=active]:bg-background data-[state=active]:text-primary
              h-full rounded-xl px-6 font-semibold transition-all
              data-[state=active]:shadow-sm
            "
          >
            {t.hr.teachers.tabs.classes()}
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="
              data-[state=active]:bg-background data-[state=active]:text-primary
              h-full rounded-xl px-6 font-semibold transition-all
              data-[state=active]:shadow-sm
            "
          >
            {t.hr.teachers.tabs.schedule()}
          </TabsTrigger>
        </TabsList>

        <motion.div
          key="tabs-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TabsContent value="info" className="m-0 space-y-6">
            <div className="
              border-border/40 bg-card/40 rounded-3xl border p-8 shadow-sm
              backdrop-blur-md
            "
            >
              <h2 className="mb-8 flex items-center gap-2 text-xl font-bold">
                <IconUser className="text-primary size-5" />
                {t.hr.teachers.personalInfo()}
              </h2>
              <div className="
                grid gap-8
                md:grid-cols-2
                lg:grid-cols-3
              "
              >
                {teacher.hireDate && (
                  <div className="flex flex-col gap-1">
                    <span className="
                      text-muted-foreground/60 text-xs font-bold tracking-widest
                      uppercase
                    "
                    >
                      {t.hr.teachers.hireDate()}
                    </span>
                    <div className="
                      text-foreground mt-1 flex items-center gap-2.5
                      font-semibold
                    "
                    >
                      <div className="
                        bg-primary/5 border-primary/10 flex size-8 items-center
                        justify-center rounded-lg border
                      "
                      >
                        <IconCalendar className="text-primary size-4" />
                      </div>
                      {formatDate(teacher.hireDate, 'FULL')}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <span className="
                    text-muted-foreground/60 text-xs font-bold tracking-widest
                    uppercase
                  "
                  >
                    {t.hr.teachers.status()}
                  </span>
                  <div className="mt-1 flex items-center gap-2.5">
                    <div
                      className={cn(
                        `
                          flex size-8 items-center justify-center rounded-lg
                          border
                        `,
                        teacher.status === 'active'
                          ? 'bg-success/10 border-success/20'
                          : teacher.status === 'on_leave'
                            ? 'bg-accent/10 border-accent/20'
                            : 'bg-muted border-border/40',
                      )}
                    >
                      <div
                        className={cn(
                          'size-2 rounded-full',
                          teacher.status === 'active'
                            ? 'bg-success animate-pulse'
                            : teacher.status === 'on_leave'
                              ? 'bg-accent'
                              : 'bg-muted-foreground',
                        )}
                      />
                    </div>
                    <span className="font-semibold">
                      {t.hr.status[
                        teacher.status as keyof typeof t.hr.status
                      ]?.() || teacher.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="
                    text-muted-foreground/60 text-xs font-bold tracking-widest
                    uppercase
                  "
                  >
                    {t.hr.teachers.specialization()}
                  </span>
                  <div className="
                    text-foreground mt-1 flex items-center gap-2.5 text-lg
                    font-semibold
                  "
                  >
                    <div className="
                      flex size-8 items-center justify-center rounded-lg border
                      border-blue-500/10 bg-blue-500/5
                    "
                    >
                      <IconBook className="size-4 text-blue-500" />
                    </div>
                    {teacher.specialization || t.hr.teachers.noSpecialization()}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="m-0">
            <div className="
              border-border/40 bg-card/40 rounded-3xl border p-8 shadow-sm
              backdrop-blur-md
            "
            >
              <h2 className="mb-8 flex items-center gap-2 text-xl font-bold">
                <IconBook className="text-primary size-5" />
                {t.hr.teachers.assignedSubjects()}
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                {teacher.subjects && teacher.subjects.length > 0
                  ? (
                      teacher.subjects.map((sub: TeacherSubject) => (
                        <Badge
                          key={sub.subjectId}
                          className="
                            bg-primary/5 text-primary border-primary/20
                            hover:bg-primary/10
                            cursor-default rounded-xl px-4 py-2 text-sm
                            font-semibold transition-colors
                          "
                          variant="outline"
                        >
                          <IconBook className="mr-2 size-3.5" />
                          {sub.subjectName}
                        </Badge>
                      ))
                    )
                  : (
                      !isAddingSubject && (
                        <div className="
                          flex w-full flex-col items-center justify-center py-10
                          text-center
                        "
                        >
                          <IconBook className="
                            text-muted-foreground/30 mb-4 size-10
                          "
                          />
                          <p className="text-muted-foreground font-medium">
                            {t.hr.teachers.noSubjects()}
                          </p>
                        </div>
                      )
                    )}

                {isAddingSubject
                  ? (
                      <div className="
                        animate-in fade-in zoom-in-95 flex items-center gap-2
                        duration-200
                      "
                      >
                        <Select
                          value={selectedSubjectId}
                          onValueChange={v => setSelectedSubjectId(v || '')}
                        >
                          <SelectTrigger className="
                            border-primary/20 bg-background/50 h-9 w-[200px]
                            rounded-xl
                          "
                          >
                            <SelectValue placeholder="Choose subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSubjects.map(subject => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="
                            bg-primary/10 text-primary
                            hover:bg-primary/20
                            size-9 rounded-full
                          "
                          onClick={handleAddSubject}
                          disabled={!selectedSubjectId || assignSubjectsMutation.isPending}
                        >
                          <IconCheck className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="
                            hover:bg-destructive/10 hover:text-destructive
                            size-9 rounded-full
                          "
                          onClick={() => setIsAddingSubject(false)}
                        >
                          <IconX className="size-4" />
                        </Button>
                      </div>
                    )
                  : (
                      <Button
                        variant="outline"
                        className="
                          border-primary/30 bg-primary/5 text-primary
                          hover:bg-primary/10 hover:border-primary/50
                          h-9 rounded-xl border-dashed
                        "
                        onClick={() => setIsAddingSubject(true)}
                      >
                        <IconPlus className="mr-2 size-4" />
                        Add subject
                      </Button>
                    )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="m-0">
            <TeacherClasses
              classes={classes || []}
              isPending={isPendingClasses}
              teacherId={teacherId}
            />
          </TabsContent>

          <TabsContent value="schedule" className="m-0">
            <TeacherTimetable teacherId={teacherId} />
          </TabsContent>
        </motion.div>
      </Tabs>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t.hr.teachers.deleteTeacher()}
        description={t.hr.teachers.deleteConfirm()}
        onConfirm={() => deleteMutation.mutate()}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
