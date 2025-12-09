import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Save,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

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
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { homeworkDetailsQueryOptions } from '@/lib/queries/homework'
import { deleteHomework, updateHomework } from '@/teacher/functions/homework'

export const Route = createFileRoute('/_auth/app/homework/$homeworkId')({
  component: HomeworkDetailPage,
})

function HomeworkDetailPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { homeworkId } = Route.useParams()
  const locale = i18n.language === 'fr' ? fr : undefined

  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const { data, isLoading: dataLoading } = useQuery({
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
    mutationFn: updateHomework,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t('homework.updated', 'Devoir mis à jour'))
        queryClient.invalidateQueries({ queryKey: ['teacher', 'homework'] })
        setIsEditing(false)
      } else {
        toast.error(t('errors.serverError'))
      }
    },
    onError: () => {
      toast.error(t('errors.serverError'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteHomework,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t('homework.deleted', 'Devoir supprimé'))
        queryClient.invalidateQueries({ queryKey: ['teacher', 'homework'] })
        navigate({ to: '/app/homework' })
      } else {
        toast.error(t('errors.serverError'))
      }
    },
    onError: () => {
      toast.error(t('errors.serverError'))
    },
  })

  const handleSave = (newStatus?: 'draft' | 'active' | 'closed') => {
    if (!context || !homework) return

    updateMutation.mutate({
      data: {
        id: homework.id,
        teacherId: context.teacherId,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate,
        dueTime: dueTime || undefined,
        status: newStatus ?? homework.status,
      },
    })
  }

  const handleDelete = () => {
    if (!context || !homework) return
    deleteMutation.mutate({
      data: {
        homeworkId: homework.id,
        teacherId: context.teacherId,
      },
    })
  }

  const isLoading = contextLoading || dataLoading

  if (isLoading) {
    return <DetailSkeleton />
  }

  if (!homework) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground">{t('homework.notFound', 'Devoir non trouvé')}</p>
        <Link to="/app/homework">
          <Button variant="outline" className="mt-4">
            {t('common.back')}
          </Button>
        </Link>
      </div>
    )
  }

  const dueDateTime = new Date(homework.dueDate)
  const statusColors: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
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
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            {isEditing ? t('homework.edit', 'Modifier le devoir') : t('homework.details', 'Détails du devoir')}
          </h1>
        </div>
        {!isEditing && homework.status !== 'cancelled' && (
          <Button variant="ghost" size="icon" onClick={initEditForm}>
            <Edit className="h-5 w-5" />
          </Button>
        )}
      </div>

      {isEditing ? (
        /* Edit Form */
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('homework.titleField')}</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('homework.titleField')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('homework.description')}</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('homework.description')}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t('homework.dueDate')}</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('homework.dueTime')}</Label>
              <Input
                type="time"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
              />
            </div>
          </div>

          {/* Edit Actions */}
          <div className="fixed inset-x-0 bottom-16 border-t bg-background p-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsEditing(false)}
              >
                <X className="mr-2 h-4 w-4" />
                {t('common.cancel')}
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleSave()}
                disabled={!title.trim() || !dueDate || updateMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {t('common.save')}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* View Mode */
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{homework.title}</CardTitle>
                <Badge variant={statusColors[homework.status] ?? 'default'}>
                  {t(`homework.status.${homework.status}`)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {homework.className} • {homework.subjectName}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {homework.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t('homework.description')}
                  </Label>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{homework.description}</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(dueDateTime, 'd MMMM yyyy', { locale })}</span>
                </div>
                {homework.dueTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{homework.dueTime}</span>
                  </div>
                )}
              </div>

              {homework.instructions && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t('homework.instructions', 'Instructions')}
                  </Label>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{homework.instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {homework.status !== 'cancelled' && (
            <div className="fixed inset-x-0 bottom-16 border-t bg-background p-4">
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('homework.deleteConfirm', 'Supprimer ce devoir ?')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('homework.deleteWarning', 'Cette action est irréversible.')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        {t('common.delete')}
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
                    <Send className="mr-2 h-4 w-4" />
                    {t('homework.publish', 'Publier')}
                  </Button>
                )}

                {homework.status === 'active' && (
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => handleSave('closed')}
                    disabled={updateMutation.isPending}
                  >
                    {t('homework.close', 'Clôturer')}
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
