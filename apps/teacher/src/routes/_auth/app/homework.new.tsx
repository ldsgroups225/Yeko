import { IconArrowLeft, IconCalendar, IconDeviceFloppy, IconSend } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'

import { Input } from '@workspace/ui/components/input'

import { Label } from '@workspace/ui/components/label'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Textarea } from '@workspace/ui/components/textarea'
import { lazy, Suspense, useState } from 'react'
import { toast } from 'sonner'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useI18nContext } from '@/i18n/i18n-react'
import { teacherClassesQueryOptions } from '@/lib/queries/dashboard'
import { homeworkMutations } from '@/lib/queries/homework'

const DatePicker = lazy(() => import('@workspace/ui/components/date-picker').then(m => ({ default: m.DatePicker })))

export const Route = createFileRoute('/_auth/app/homework/new')({
  component: NewHomeworkPage,
})

function NewHomeworkPage() {
  const { LL } = useI18nContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { context, isLoading: contextLoading } = useRequiredTeacherContext()

  const { data: classesData, isPending: classesPending } = useQuery({
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
    c => c.id === selectedClassId,
  )

  const createMutation = useMutation({
    ...homeworkMutations.create,
    onSuccess: () => {
      toast.success(LL.homework.created())
      queryClient.invalidateQueries({ queryKey: ['teacher', 'homework'] })
      navigate({ to: '/app/homework' })
    },
    onError: () => {
      toast.error(LL.errors.serverError())
    },
  })

  const handleSubmit = (status: 'draft' | 'active') => {
    if (!context || !selectedClassId || !selectedSubjectId || !title || !dueDate)
      return

    createMutation.mutate({
      teacherId: context.teacherId,
      schoolId: context.schoolId,
      classId: selectedClassId,
      subjectId: selectedSubjectId,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      dueTime: dueTime || undefined,
      status,
    })
  }

  const isPending = contextLoading || classesPending
  const canSubmit = selectedClassId && selectedSubjectId && title.trim() && dueDate

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="flex items-center gap-3">
        <Link to="/app/homework">
          <Button variant="ghost" size="icon">
            <IconArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">{LL.homework.new()}</h1>
      </div>

      {isPending
        ? <FormSkeleton />
        : (
            <div className="space-y-4">
              {/* Class selection */}
              <div className="space-y-2">
                <Label>{LL.grades.selectClass()}</Label>
                <Select
                  value={selectedClassId || null}
                  onValueChange={(v) => {
                    setSelectedClassId(v ?? '')
                    setSelectedSubjectId('')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue>{selectedClassId ? classesData?.classes?.find(c => c.id === selectedClassId)?.name : LL.grades.selectClass()}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {classesData?.classes?.map(cls => (
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
                  <Label>{LL.grades.selectSubject()}</Label>
                  <Select value={selectedSubjectId || null} onValueChange={v => setSelectedSubjectId(v ?? '')}>
                    <SelectTrigger>
                      <SelectValue>{selectedSubjectId ? selectedClass.subjects?.find(s => s.id === selectedSubjectId)?.name : LL.grades.selectSubject()}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {selectedClass.subjects?.map(subject => (
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
                <Label>{LL.homework.titleField()}</Label>
                <Input
                  placeholder={LL.homework.titleField()}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>{LL.homework.description()}</Label>
                <Textarea
                  placeholder={LL.homework.description()}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Due date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{LL.homework.dueDate()}</Label>
                  <div className="relative">
                    <IconCalendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Suspense fallback={<Skeleton className="h-10 w-full" />}>
                      <DatePicker
                        date={dueDate ? new Date(dueDate) : undefined}
                        onSelect={(date: Date | undefined) => setDueDate(date ? (date.toISOString().split('T')[0] ?? '') : '')}
                        className="pl-9 justify-start font-normal"
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
            <IconDeviceFloppy className="mr-2 h-4 w-4" />
            {LL.homework.status.draft()}
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleSubmit('active')}
            disabled={!canSubmit || createMutation.isPending}
          >
            <IconSend className="mr-2 h-4 w-4" />
            {LL.homework.create()}
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
