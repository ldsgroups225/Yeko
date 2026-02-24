import type { ClassroomItem } from './types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'
import { useTranslations } from '@/i18n'

interface ClassroomsTableDeleteDialogProps {
  itemToDelete: ClassroomItem | null
  setItemToDelete: (item: ClassroomItem | null) => void
  handleDelete: () => void
}

export function ClassroomsTableDeleteDialog({
  itemToDelete,
  setItemToDelete,
  handleDelete,
}: ClassroomsTableDeleteDialogProps) {
  const t = useTranslations()

  return (
    <AlertDialog
      open={!!itemToDelete}
      onOpenChange={open => !open && setItemToDelete(null)}
    >
      <AlertDialogContent className="backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">
            {t.dialogs.deleteConfirmation.title()}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground/80">
            {t.dialogs.deleteConfirmation.description({
              item: itemToDelete ? itemToDelete.name : '',
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="rounded-xl border-border/40">
            {t.dialogs.deleteConfirmation.cancel()}
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20"
            onClick={handleDelete}
          >
            {t.dialogs.deleteConfirmation.delete()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
