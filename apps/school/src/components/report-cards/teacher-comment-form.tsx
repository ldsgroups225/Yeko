import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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
  const { t } = useTranslation()

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
          {t('reportCards.commentFor', { subject: subjectName })}
        </Label>
        <Textarea
          id={`comment-${subjectId}`}
          placeholder={t('reportCards.teacherCommentPlaceholder')}
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
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              )
            : (
                <Save className="mr-1 h-3 w-3" />
              )}
          {t('common.save')}
        </Button>
      </div>
    </form>
  )
}
