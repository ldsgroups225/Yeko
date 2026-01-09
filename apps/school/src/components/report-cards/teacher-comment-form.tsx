import { zodResolver } from '@hookform/resolvers/zod'
import { IconDeviceFloppy, IconLoader2 } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTranslations } from '@/i18n'

const teacherCommentSchema = z.object({
  comment: z.string().min(1, 'Commentaire requis').max(500, 'Commentaire trop long'),
})

type TeacherCommentInput = z.infer<typeof teacherCommentSchema>

interface TeacherCommentFormProps {
  reportCardId: string
  subjectId: string
  subjectName: string
  teacherId: string
  initialComment?: string
  onSubmit: (data: {
    reportCardId: string
    subjectId: string
    teacherId: string
    comment: string
  }) => Promise<void>
  isSubmitting?: boolean
}

export function TeacherCommentForm({
  reportCardId,
  subjectId,
  subjectName,
  teacherId,
  initialComment = '',
  onSubmit,
  isSubmitting,
}: TeacherCommentFormProps) {
  const t = useTranslations()

  const form = useForm<TeacherCommentInput>({
    resolver: zodResolver(teacherCommentSchema),
    defaultValues: {
      comment: initialComment,
    },
  })

  const handleSubmit = async (data: TeacherCommentInput) => {
    await onSubmit({
      reportCardId,
      subjectId,
      teacherId,
      comment: data.comment,
    })
  }

  const charCount = form.watch('comment')?.length ?? 0

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={`comment-${subjectId}`}>
          {t.reportCards.commentFor({ subject: subjectName })}
        </Label>
        <Textarea
          id={`comment-${subjectId}`}
          placeholder={t.reportCards.teacherCommentPlaceholder()}
          rows={3}
          {...form.register('comment')}
          aria-describedby={`comment-count-${subjectId}`}
        />
        <div className="flex items-center justify-between text-sm">
          <span id={`comment-count-${subjectId}`} className="text-muted-foreground">
            {charCount}
            /500
          </span>
          {form.formState.errors.comment && (
            <span className="text-destructive">
              {form.formState.errors.comment.message}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !form.formState.isDirty}
        >
          {isSubmitting
            ? (
                <IconLoader2 className="mr-1 h-3 w-3 animate-spin" />
              )
            : (
                <IconDeviceFloppy className="mr-1 h-3 w-3" />
              )}
          {t.common.save()}
        </Button>
      </div>
    </form>
  )
}
