import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const rejectSchema = z.object({
  reason: z.string()
    .min(10, 'Le motif doit contenir au moins 10 caractères')
    .max(500, 'Le motif ne peut pas dépasser 500 caractères'),
})

type RejectFormValues = z.infer<typeof rejectSchema>

interface GradeValidationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'validate' | 'reject'
  gradeCount: number
  onConfirm: (reason?: string) => void
  isLoading?: boolean
}

export function GradeValidationDialog({
  open,
  onOpenChange,
  mode,
  gradeCount,
  onConfirm,
  isLoading,
}: GradeValidationDialogProps) {
  const { t } = useTranslation()
  const [comment, setComment] = useState('')

  const form = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: '' },
  })

  const handleConfirm = () => {
    if (mode === 'reject') {
      form.handleSubmit((data) => {
        onConfirm(data.reason)
      })()
    }
    else {
      onConfirm(comment || undefined)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
      setComment('')
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'validate'
              ? t('academic.grades.validations.validateTitle')
              : t('academic.grades.validations.rejectTitle')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'validate'
              ? t('academic.grades.validations.validateDescription', { count: gradeCount })
              : t('academic.grades.validations.rejectDescription')}
          </DialogDescription>
        </DialogHeader>

        {mode === 'reject'
          ? (
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('academic.grades.validations.rejectReason')}
                          {' '}
                          *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('academic.grades.validations.rejectReasonPlaceholder')}
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )
          : (
              <div className="space-y-2">
                <Label htmlFor="comment">
                  {t('academic.grades.validations.comment')}
                </Label>
                <Textarea
                  id="comment"
                  placeholder={t('academic.grades.validations.commentPlaceholder')}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant={mode === 'reject' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isLoading}
            className={mode === 'validate' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {isLoading
              ? t('common.loading')
              : mode === 'validate'
                ? t('academic.grades.validations.confirmValidate')
                : t('academic.grades.validations.confirmReject')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
