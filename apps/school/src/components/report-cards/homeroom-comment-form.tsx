import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const homeroomCommentSchema = z.object({
  comment: z.string().max(1000, 'Commentaire trop long'),
})

type HomeroomCommentInput = z.infer<typeof homeroomCommentSchema>

interface HomeroomCommentFormProps {
  reportCardId: string
  initialComment?: string
  onSubmit: (reportCardId: string, comment: string) => Promise<void>
  isSubmitting?: boolean
}

export function HomeroomCommentForm({
  reportCardId,
  initialComment = '',
  onSubmit,
  isSubmitting,
}: HomeroomCommentFormProps) {
  const { t } = useTranslation()

  const form = useForm<HomeroomCommentInput>({
    resolver: zodResolver(homeroomCommentSchema),
    defaultValues: {
      comment: initialComment,
    },
  })

  const handleSubmit = async (data: HomeroomCommentInput) => {
    await onSubmit(reportCardId, data.comment)
  }

  const charCount = form.watch('comment')?.length ?? 0

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="homeroom-comment">{t('reportCards.homeroomComment')}</Label>
        <Textarea
          id="homeroom-comment"
          placeholder={t('reportCards.homeroomCommentPlaceholder')}
          rows={4}
          {...form.register('comment')}
          aria-describedby="comment-count"
        />
        <div className="flex items-center justify-between text-sm">
          <span id="comment-count" className="text-muted-foreground">
            {charCount}/1000
          </span>
          {form.formState.errors.comment && (
            <span className="text-destructive">
              {form.formState.errors.comment.message}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {t('common.save')}
        </Button>
      </div>
    </form>
  )
}
