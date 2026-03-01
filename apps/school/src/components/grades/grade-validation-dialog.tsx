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
      <DialogContent className="
        border-border/40 bg-popover/90 max-w-md overflow-hidden rounded-3xl p-0
        shadow-2xl backdrop-blur-2xl
      "
      >
        <DialogHeader className="p-6 pb-0">
          <div className="mb-2 flex items-center gap-4">
            <div className={cn(
              `
                flex h-12 w-12 items-center justify-center rounded-2xl
                shadow-inner transition-transform
                group-hover:scale-110
              `,
              isReject
                ? 'bg-destructive/10 text-destructive'
                : `bg-success/10 text-success`,
            )}
            >
              {isReject
                ? <IconCircleX className="size-6" />
                : (
                    <IconCircleCheck className="size-6" />
                  )}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {isReject ? t.academic.grades.validations.rejectTitle() : t.academic.grades.validations.validateTitle()}
              </DialogTitle>
              <DialogDescription className="
                text-muted-foreground text-xs font-medium tracking-widest
                uppercase opacity-70
              "
              >
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
                          <FormLabel className="
                            text-muted-foreground flex items-center gap-2
                            text-[11px] font-bold tracking-widest uppercase
                          "
                          >
                            <IconAlertCircle className="size-3" />
                            {t.academic.grades.validations.rejectReason()}
                            {' '}
                            *
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t.academic.grades.validations.rejectReasonPlaceholder()}
                              className="
                                border-border/40 bg-background/50
                                focus:bg-background
                                min-h-[120px] resize-none rounded-2xl p-4
                                transition-all
                              "
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="
                            text-[10px] font-bold tracking-tight uppercase
                          "
                          />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              )
            : (
                <div className="space-y-3">
                  <Label
                    htmlFor="comment"
                    className="
                      text-muted-foreground flex items-center gap-2 text-[11px]
                      font-bold tracking-widest uppercase
                    "
                  >
                    <IconMessage className="size-3" />
                    {t.academic.grades.validations.comment()}
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder={t.academic.grades.validations.commentPlaceholder()}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="
                      border-border/40 bg-background/50
                      focus:bg-background
                      min-h-[100px] resize-none rounded-2xl p-4 transition-all
                    "
                  />
                </div>
              )}
        </div>

        <DialogFooter className="
          bg-muted/20 gap-3 p-6
          sm:gap-0
        "
        >
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
            className="
              hover:bg-background/80
              rounded-xl text-[10px] font-bold tracking-widest uppercase
            "
          >
            {t.common.cancel()}
          </Button>
          <Button
            variant={isReject ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(
              `
                rounded-xl px-8 text-[10px] font-bold tracking-widest uppercase
                shadow-lg transition-all
              `,
              !isReject && `
                bg-success
                hover:bg-success/90
                shadow-success/20
              `,
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
