import { zodResolver } from '@hookform/resolvers/zod'
import { IconAlertCircle, IconCircleCheck, IconCircleX, IconMessage } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

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
  isPending?: boolean
}

export function GradeValidationDialog({
  open,
  onOpenChange,
  mode,
  gradeCount,
  onConfirm,
  isPending,
}: GradeValidationDialogProps) {
  const t = useTranslations()
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

  const isReject = mode === 'reject'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-border/40 bg-popover/90 backdrop-blur-2xl shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-4 mb-2">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner transition-transform group-hover:scale-110',
              isReject ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-600',
            )}
            >
              {isReject ? <IconCircleX className="size-6" /> : <IconCircleCheck className="size-6" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {isReject ? t.academic.grades.validations.rejectTitle() : t.academic.grades.validations.validateTitle()}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-70">
                {isReject ? t.academic.grades.validations.rejectDescription() : t.academic.grades.validations.validateDescription({ count: gradeCount })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {isReject
            ? (
                <Form {...form}>
                  <form className="space-y-4">
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                            <IconAlertCircle className="size-3" />
                            {t.academic.grades.validations.rejectReason()}
                            {' '}
                            *
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t.academic.grades.validations.rejectReasonPlaceholder()}
                              className="min-h-[120px] rounded-2xl border-border/40 bg-background/50 focus:bg-background transition-all resize-none p-4"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-[10px] font-bold uppercase tracking-tight" />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              )
            : (
                <div className="space-y-3">
                  <Label htmlFor="comment" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    <IconMessage className="size-3" />
                    {t.academic.grades.validations.comment()}
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder={t.academic.grades.validations.commentPlaceholder()}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="min-h-[100px] rounded-2xl border-border/40 bg-background/50 focus:bg-background transition-all resize-none p-4"
                  />
                </div>
              )}
        </div>

        <DialogFooter className="p-6 bg-muted/20 gap-3 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
            className="rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-background/80"
          >
            {t.common.cancel()}
          </Button>
          <Button
            variant={isReject ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(
              'rounded-xl font-bold uppercase tracking-widest text-[10px] px-8 shadow-lg transition-all',
              !isReject && 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20',
              isReject && 'shadow-destructive/20',
            )}
          >
            {isPending
              ? t.common.loading()
              : isReject
                ? t.academic.grades.validations.confirmReject()
                : t.academic.grades.validations.confirmValidate()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
