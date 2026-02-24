import type { EnrollmentWithDetails } from '@repo/data-ops/queries/enrollments'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Textarea } from '@workspace/ui/components/textarea'
import { useTranslations } from '@/i18n'

interface EnrollmentCancelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enrollment: EnrollmentWithDetails | null
  reason: string
  onReasonChange: (reason: string) => void
  onConfirm: () => void
  isPending: boolean
}

export function EnrollmentCancelDialog({
  open,
  onOpenChange,
  enrollment,
  reason,
  onReasonChange,
  onConfirm,
  isPending,
}: EnrollmentCancelDialogProps) {
  const t = useTranslations()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-xl bg-card/95 border-border/40">
        <DialogHeader>
          <DialogTitle>{t.enrollments.cancelTitle()}</DialogTitle>
          <DialogDescription>
            {t.enrollments.cancelDescription({
              name: `${enrollment?.student?.lastName} ${enrollment?.student?.firstName}`,
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              {t.enrollments.cancelReason()}
            </label>
            <Textarea
              placeholder={t.enrollments.cancelReasonPlaceholder()}
              value={reason}
              onChange={e => onReasonChange(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common.cancel()}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {t.enrollments.confirmCancel()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
