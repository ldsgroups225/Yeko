import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { useTranslations } from '@/i18n'

interface ParentDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parent: any | null
  onConfirm: () => void
  isPending: boolean
}

export function ParentDeleteDialog({
  open,
  onOpenChange,
  parent,
  onConfirm,
  isPending,
}: ParentDeleteDialogProps) {
  const t = useTranslations()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-xl bg-card/95 border-border/40">
        <DialogHeader>
          <DialogTitle>{t.parents.deleteTitle()}</DialogTitle>
          <DialogDescription>
            {t.parents.deleteDescription({
              name: `${parent?.lastName} ${parent?.firstName}`,
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t.common.cancel()}</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>{t.common.delete()}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
