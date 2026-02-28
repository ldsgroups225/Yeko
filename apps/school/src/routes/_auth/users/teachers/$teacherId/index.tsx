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
import { schoolSubjectsOptions } from '@/lib/queries/school-subjects'
import { teacherKeys, teacherMutations, teacherOptions } from '@/lib/queries/teachers'

import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/users/teachers/$teacherId/')({
  component: TeacherDetailsPage,
})

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
    ...teacherMutations.delete,
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
    const currentSubjectIds = teacher.subjects?.map(s => s.subjectId) || []
    assignSubjectsMutation.mutate({
      teacherId,
      subjectIds: [...currentSubjectIds, selectedSubjectId],
    })
  }

  const handleRemoveSubject = (subjectId: string) => {
    if (!teacher)
      return
    const currentSubjectIds = teacher.subjects?.map(s => s.subjectId) || []
    assignSubjectsMutation.mutate({
      teacherId,
      subjectIds: currentSubjectIds.filter((id: string) => id !== subjectId),
    })
  }

  const availableSubjects = useMemo(() => {
    return allSubjects?.subjects?.filter(
      s => !teacher?.subjects?.some(ts => ts.subjectId === s.subject.id),
    ) || []
  }, [allSubjects?.subjects, teacher?.subjects])
  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-1/4" />
        <div className="flex items-center gap-6">
          <Skeleton className="size-24 rounded-full" />
          <div className="space-y-3 flex-1">
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
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
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
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <Breadcrumbs
            items={[
              { label: t.hr.title(), href: '/users' },
              { label: t.hr.teachers.title(), href: '/users/teachers' },
              { label: user?.name || teacherId },
            ]}
          />

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar className="size-24 ring-4 ring-background shadow-xl border-2 border-primary/20">
              <AvatarImage src={user?.avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/5 text-primary text-3xl font-black">
                {user?.name?.charAt(0).toUpperCase() || 'T'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                  {user?.name}
                </h1>
                <Badge
                  className={cn(
                    'text-[10px] uppercase font-bold tracking-widest px-2',
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
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium">
                  <IconBook className="size-4 text-primary/60" />
                  {teacher.specialization || t.hr.teachers.noSpecialization()}
                </div>
                {user?.email && (
                  <div className="flex items-center gap-1.5">
                    <IconMail className="size-4 opacity-70" />
                    <a
                      href={`mailto:${user.email}`}
                      className="hover:text-primary transition-colors underline-offset-4 hover:underline"
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
            className="rounded-2xl border-border/40 hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/20 transition-all shadow-sm"
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
            className="rounded-2xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          />
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="h-14 w-full justify-start gap-1 rounded-2xl border border-border/40 bg-card/40 p-1.5 backdrop-blur-md">
          <TabsTrigger
            value="info"
            className="h-full rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm font-semibold transition-all"
          >
            {t.hr.teachers.tabs.info()}
          </TabsTrigger>
          <TabsTrigger
            value="subjects"
            className="h-full rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm font-semibold transition-all"
          >
            {t.hr.teachers.tabs.subjects()}
          </TabsTrigger>
          <TabsTrigger
            value="classes"
            className="h-full rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm font-semibold transition-all"
          >
            {t.hr.teachers.tabs.classes()}
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="h-full rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm font-semibold transition-all"
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
          <TabsContent value="info" className="space-y-6 m-0">
            <div className="rounded-3xl border border-border/40 bg-card/40 p-8 backdrop-blur-md shadow-sm">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                <IconUser className="size-5 text-primary" />
                {t.hr.teachers.personalInfo()}
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {teacher.hireDate && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                      {t.hr.teachers.hireDate()}
                    </span>
                    <div className="flex items-center gap-2.5 mt-1 font-semibold text-foreground">
                      <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                        <IconCalendar className="size-4 text-primary" />
                      </div>
                      {formatDate(teacher.hireDate, 'FULL')}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    {t.hr.teachers.status()}
                  </span>
                  <div className="flex items-center gap-2.5 mt-1">
                    <div
                      className={cn(
                        'size-8 rounded-lg flex items-center justify-center border',
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
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    {t.hr.teachers.specialization()}
                  </span>
                  <div className="flex items-center gap-2.5 mt-1 font-semibold text-foreground text-lg">
                    <div className="size-8 rounded-lg bg-blue-500/5 flex items-center justify-center border border-blue-500/10">
                      <IconBook className="size-4 text-blue-500" />
                    </div>
                    {teacher.specialization || t.hr.teachers.noSpecialization()}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="m-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Add Subject Card */}
              <motion.div
                layout
                className={cn(
                  'relative overflow-hidden rounded-2xl border backdrop-blur-md transition-all',
                  isAddingSubject
                    ? 'border-primary/40 bg-primary/5 p-5 shadow-sm'
                    : 'border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 cursor-pointer flex flex-col items-center justify-center min-h-[160px]',
                )}
                onClick={!isAddingSubject ? () => setIsAddingSubject(true) : undefined}
              >
                {isAddingSubject
                  ? (
                      <div className="flex flex-col gap-3 h-full">
                        <h3 className="font-semibold text-primary text-sm uppercase tracking-wider">{t.hr.teachers.newAssignment()}</h3>
                        <div className="space-y-3 flex-1 flex flex-col justify-center">
                          <Select
                            value={selectedSubjectId}
                            onValueChange={v => setSelectedSubjectId(v || '')}
                          >
                            <SelectTrigger className="w-full bg-background/50 border-primary/20 h-9 font-bold">
                              <SelectValue placeholder={t.hr.teachers.chooseSubject()}>
                                {selectedSubjectId
                                  ? (() => {
                                      const item = availableSubjects.find(s => s.subject.id === selectedSubjectId)
                                      return item
                                        ? (
                                            <div className="flex items-center gap-2">
                                              <IconBook className="size-3.5 text-primary/60" />
                                              <span>{item.subject.name}</span>
                                            </div>
                                          )
                                        : undefined
                                    })()
                                  : undefined}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="backdrop-blur-xl bg-popover/90 border-border/40 rounded-xl">
                              {availableSubjects.map(item => (
                                <SelectItem key={item.subject.id} value={item.subject.id} className="rounded-lg focus:bg-primary/10">
                                  <p className="font-semibold">{item.subject.name}</p>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs font-bold"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddSubject()
                            }}
                            disabled={!selectedSubjectId || assignSubjectsMutation.isPending}
                          >
                            <IconCheck className="mr-2 size-3.5" />
                            {t.common.confirm()}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 rounded-xl hover:bg-destructive/10 hover:text-destructive h-8 text-xs font-bold"
                            onClick={(e) => {
                              e.stopPropagation()
                              setIsAddingSubject(false)
                            }}
                          >
                            <IconX className="mr-2 size-3.5" />
                            {t.common.cancel()}
                          </Button>
                        </div>
                      </div>
                    )
                  : (
                      <>
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <IconPlus className="size-5 text-primary" />
                        </div>
                        <span className="font-semibold text-primary text-sm">{t.hr.teachers.add()}</span>
                      </>
                    )}
              </motion.div>

              {/* Existing Subjects Cards */}
              {teacher.subjects && teacher.subjects.length > 0
                ? (
                    teacher.subjects.map((sub, index) => (
                      <motion.div
                        key={sub.subjectId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-5 shadow-sm backdrop-blur-md transition-all hover:shadow-md hover:border-primary/20"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <IconBook className="size-5 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-base tracking-tight">{sub.subjectName}</h4>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t.hr.teachers.assignedSubjects()}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(sub.subjectId)}
                            className="size-8 flex items-center justify-center rounded-xl bg-destructive/5 text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-white transition-all"
                          >
                            <IconTrash className="size-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )
                : (
                    !isAddingSubject && (
                      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-card/40 rounded-2xl border border-dashed border-border/40 backdrop-blur-sm">
                        <IconBook className="mb-4 size-12 text-muted-foreground/40" />
                        <h3 className="text-lg font-semibold">{t.hr.teachers.noSubjects()}</h3>
                      </div>
                    )
                  )}
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
        onConfirm={() => deleteMutation.mutate(teacherId)}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
