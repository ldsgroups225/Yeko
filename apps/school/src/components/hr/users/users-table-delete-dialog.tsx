import type { UseMutationResult } from '@tanstack/react-query'
import type { IconUser } from './users-table-columns'
import { IconLoader2, IconTrash } from '@tabler/icons-react'
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

interface UsersTableDeleteDialogProps {
  userToDelete: IconUser | null
  setUserToDelete: (user: IconUser | null) => void
  deleteMutation: UseMutationResult<any, Error, string, unknown>
}

export function UsersTableDeleteDialog({
  userToDelete,
  setUserToDelete,
  deleteMutation,
}: UsersTableDeleteDialogProps) {
  const t = useTranslations()

  return (
    <AlertDialog
      open={!!userToDelete}
      onOpenChange={open => !open && setUserToDelete(null)}
    >
      <AlertDialogContent className="rounded-2xl border-border/40 bg-card/95 backdrop-blur-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-serif">
            {t.common.deleteConfirmTitle()}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {t.common.deleteConfirmDescription({ name: userToDelete?.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-xl border-border/40 bg-background/50 hover:bg-background">
            {t.common.cancel()}
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (userToDelete) {
                deleteMutation.mutate(userToDelete.id)
              }
            }}
          >
            {deleteMutation.isPending
              ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              : <IconTrash className="mr-2 h-4 w-4" />}
            {deleteMutation.isPending ? t.common.deleting() : t.common.delete()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
