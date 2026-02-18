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
import { useI18nContext } from '@/i18n/i18n-react'

interface ParticipationCommentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  comment: string
  setComment: (comment: string) => void
  onCancel: () => void
  onSave: () => void
}

export function ParticipationCommentDialog({
  open,
  onOpenChange,
  comment,
  setComment,
  onCancel,
  onSave,
}: ParticipationCommentDialogProps) {
  const { LL } = useI18nContext()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{LL.participation.comment()}</DialogTitle>
          <DialogDescription>
            {LL.session.addCommentDescription()}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={LL.session.commentPlaceholder()}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {LL.common.cancel()}
          </Button>
          <Button onClick={onSave}>
            {LL.common.save()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
