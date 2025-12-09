import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Save, Send } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { teacherClassesQueryOptions } from '@/lib/queries/dashboard'
import { createHomework } from '@/teacher/functions/homework'

export const Route = createFileRoute('/_auth/app/homework/new')({
  component: NewHomeworkPage,
})

function NewHomeworkPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const { data: classesData, isLoading: classesLoading } = useQuery({
    ...teacherClassesQueryOptions({
      teacherId: context?.teacherId ?? '',
      schoolId: context?.schoolId ?? '',
      schoolYearId: context?.schoolYearId ?? '',
    }),
    enabled: !!context,
  })

  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')

  const selectedClass = classesData?.classes?.find(
    (c: any) => c.id === selectedClassId,
  )

  const createMutation = useMutation({
    mutationFn: createHomework,
    onSuccess: () => {
      toast.success(t('homework.created', 'Devoir créé'))
      queryClient.invalidateQueries({ queryKey: ['teacher', 'homework'] })
      navigate({ to: '/app/homework' })
    },
    onError: () => {
      toast.error(t('errors.serverError'))
    },
  })

  const handleSubmit = (status: 'draft' | 'active') => {
    if (!context || !selectedClassId || !selectedSubjectId || !title || !dueDate)
      return

    createMutation.mutate({
      data: {
        teacherId: context.teacherId,
        schoolId: context.schoolId,
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate,
        dueTime: dueTime || undefined,
        status,
      },
    })
  }

  const isLoading = contextLoading || classesLoading
  const canSubmit = selectedClassId && selectedSubjectId && title.trim() && dueDate

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="flex items-center gap-3">
        <Link to="/app/homework">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">{t('homework.new')}</h1>
      </div>

      {isLoading
        ? <FormSkeleton />
        : (
            <div className="space-y-4">
              {/* Class selection */}
              <div className="space-y-2">
                <Label>{t('grades.selectClass')}</Label>
                <Select
                  value={selectedClassId}
                  onValueChange={(v) => {
                    setSelectedClassId(v)
                    setSelectedSubjectId('')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('grades.selectClass')} />
                  </SelectTrigger>
                  <SelectContent>
                    {classesData?.classes?.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject selection */}
              {selectedClass && (
                <div className="space-y-2">
                  <Label>{t('grades.selectSubject')}</Label>
                  <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('grades.selectSubject')} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedClass.subjects?.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label>{t('homework.titleField')}</Label>
                <Input
                  placeholder={t('homework.titleField')}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>{t('homework.description')}</Label>
                <Textarea
                  placeholder={t('homework.description')}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Due date */}
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
                      min={new Date().toISOString().split('T')[0]}
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
            </div>
          )}

      {/* Action buttons */}
      <div className="fixed inset-x-0 bottom-16 border-t bg-background p-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleSubmit('draft')}
            disabled={!canSubmit || createMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {t('homework.status.draft')}
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleSubmit('active')}
            disabled={!canSubmit || createMutation.isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            {t('homework.create')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
