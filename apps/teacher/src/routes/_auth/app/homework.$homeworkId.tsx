import {
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconDeviceFloppy,
  IconEdit,
  IconSend,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'

import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Textarea } from '@workspace/ui/components/textarea'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { lazy, Suspense, useState } from 'react'
import { toast } from 'sonner'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useI18nContext } from '@/i18n/i18n-react'
import { homeworkDetailsQueryOptions, homeworkMutations } from '@/lib/queries/homework'

const DatePicker = lazy(() => import('@workspace/ui/components/date-picker').then(m => ({ default: m.DatePicker })))

export const Route = createFileRoute('/_auth/app/homework/$homeworkId')({
  component: HomeworkDetailPage,
})

function HomeworkDetailPage() {
  const { LL, locale: currentLocale } = useI18nContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { homeworkId } = Route.useParams()
  const locale = currentLocale === 'fr' ? fr : undefined

  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const { data, isPending: dataPending } = useQuery({
    ...homeworkDetailsQueryOptions({ homeworkId }),
    enabled: !!homeworkId,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')

  const homework = data?.homework

  // Initialize edit form when data loads
  const initEditForm = () => {
    if (homework) {
      setTitle(homework.title)
      setDescription(homework.description ?? '')
      setDueDate(homework.dueDate)
      setDueTime(homework.dueTime ?? '')
      setIsEditing(true)
    }
  }

  const updateMutation = useMutation({
    ...homeworkMutations.update,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(LL.homework.updated())
        queryClient.invalidateQueries({ queryKey: ['teacher', 'homework'] })
        setIsEditing(false)
      }
      else {
        toast.error(LL.errors.serverError())
      }
    },
    onError: () => {
      toast.error(LL.errors.serverError())
    },
  })

  const deleteMutation = useMutation({
    ...homeworkMutations.delete,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(LL.homework.deleted())
        queryClient.invalidateQueries({ queryKey: ['teacher', 'homework'] })
        navigate({ to: '/app/homework' })
      }
      else {
        toast.error(LL.errors.serverError())
      }
    },
    onError: () => {
      toast.error(LL.errors.serverError())
    },
  })

  const handleSave = (newStatus?: 'draft' | 'active' | 'closed') => {
    if (!context || !homework)
      return

    updateMutation.mutate({
      id: homework.id,
      teacherId: context.teacherId,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      dueTime: dueTime || undefined,
      status: newStatus ?? homework.status,
    })
  }

  const handleDelete = () => {
    if (!context || !homework)
      return
    deleteMutation.mutate({
      homeworkId: homework.id,
      teacherId: context.teacherId,
    })
  }

  const isPending = contextLoading || dataPending

  if (isPending) {
    return <DetailSkeleton />
  }

  if (!homework) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground">
          {LL.homework.notFound()}
        </p>
        <Link to="/app/homework">
          <Button variant="outline" className="mt-4">
            {LL.common.back()}
          </Button>
        </Link>
      </div>
    )
  }

  const dueDateTime = new Date(homework.dueDate)
  const statusColors: Record<
    string,
    'default' | 'secondary' | 'outline' | 'destructive'
  > = {
    active: 'default',
    closed: 'secondary',
    draft: 'outline',
    cancelled: 'destructive',
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/app/homework">
          <Button variant="ghost" size="icon">
            <IconArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            {isEditing
              ? LL.homework.edit()
              : LL.homework.details()}
          </h1>
        </div>
        {!isEditing && homework.status !== 'cancelled' && (
          <Button variant="ghost" size="icon" onClick={initEditForm}>
            <IconEdit className="h-5 w-5" />
          </Button>
        )}
      </div>

      {isEditing
        ? (
      /* Edit Form */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{LL.homework.titleField()}</Label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={LL.homework.titleField()}
                />
              </div>

              <div className="space-y-2">
                <Label>{LL.homework.description()}</Label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={LL.homework.description()}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{LL.homework.dueDate()}</Label>
                  <div className="relative">
                    <IconCalendar className="
                      text-muted-foreground absolute top-1/2 left-3 h-4 w-4
                      -translate-y-1/2
                    "
                    />
                    <Suspense fallback={<Skeleton className="h-10 w-full" />}>
                      <DatePicker
                        date={dueDate ? new Date(dueDate) : undefined}
                        onSelect={(date: Date | undefined) => setDueDate(date ? (date.toISOString().split('T')[0] ?? '') : '')}
                        className="justify-start pl-9 font-normal"
                      />
                    </Suspense>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{LL.homework.dueTime()}</Label>
                  <Input
                    type="time"
                    value={dueTime}
                    onChange={e => setDueTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Edit Actions */}
              <div className="
                bg-background fixed inset-x-0 bottom-16 border-t p-4
              "
              >
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsEditing(false)}
                  >
                    <IconX className="mr-2 h-4 w-4" />
                    {LL.common.cancel()}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleSave()}
                    disabled={!title.trim() || !dueDate || updateMutation.isPending}
                  >
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    {LL.common.save()}
                  </Button>
                </div>
              </div>
            </div>
          )
        : (
          /* View Mode */
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{homework.title}</CardTitle>
                    <Badge variant={statusColors[homework.status] ?? 'default'}>
                      {LL.homework.status[homework.status]()}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {homework.className}
                    {' '}
                    •
                    {homework.subjectName}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {homework.description && (
                    <div>
                      <Label className="text-muted-foreground text-xs">
                        {LL.homework.description()}
                      </Label>
                      <p className="mt-1 text-sm whitespace-pre-wrap">
                        {homework.description}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <IconCalendar className="text-muted-foreground h-4 w-4" />
                      <span>{format(dueDateTime, 'd MMMM yyyy', { locale })}</span>
                    </div>
                    {homework.dueTime && (
                      <div className="flex items-center gap-2">
                        <IconClock className="text-muted-foreground h-4 w-4" />
                        <span>{homework.dueTime}</span>
                      </div>
                    )}
                  </div>

                  {homework.instructions && (
                    <div>
                      <Label className="text-muted-foreground text-xs">
                        {LL.homework.instructions()}
                      </Label>
                      <p className="mt-1 text-sm whitespace-pre-wrap">
                        {homework.instructions}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              {homework.status !== 'cancelled' && (
                <div className="
                  bg-background fixed inset-x-0 bottom-16 border-t p-4
                "
                >
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={(
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        )}
                      />
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {LL.homework.deleteConfirm()}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {LL.homework.deleteWarning()}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {LL.common.cancel()}
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>
                            {LL.common.delete()}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {homework.status === 'draft' && (
                      <Button
                        className="flex-1"
                        onClick={() => handleSave('active')}
                        disabled={updateMutation.isPending}
                      >
                        <IconSend className="mr-2 h-4 w-4" />
                        {LL.homework.publish()}
                      </Button>
                    )}

                    {homework.status === 'active' && (
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => handleSave('closed')}
                        disabled={updateMutation.isPending}
                      >
                        {LL.homework.close()}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-6 w-48" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    </div>
  )
}
