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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { ClassForm } from '@/components/academic/class-form'
import { useTranslations } from '@/i18n'
import { useClassesTable } from './classes-table-context'

export function ClassesTableDialogs() {
  const t = useTranslations()
  const { state, actions } = useClassesTable()
  const {
    isAddDialogOpen,
    isEditDialogOpen,
    classToDelete,
    classToEdit,
  } = state
  const {
    setIsAddDialogOpen,
    setIsEditDialogOpen,
    setClassToDelete,
    setClassToEdit,
    handleDelete,
    refetch,
  } = actions

  return (
    <>
      <AlertDialog
        open={!!classToDelete}
        onOpenChange={open => !open && setClassToDelete(null)}
      >
        <AlertDialogContent className="backdrop-blur-xl bg-card/95 border-border/40">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t.dialogs.deleteConfirmation.title()}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.dialogs.deleteConfirmation.description({
                item: classToDelete
                  ? `${classToDelete.grade.name} ${classToDelete.class.section}`
                  : '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/40 bg-card/50">
              {t.dialogs.deleteConfirmation.cancel()}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {t.dialogs.deleteConfirmation.delete()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl sm:max-w-3xl backdrop-blur-xl bg-card/95 border-border/40">
          <DialogHeader>
            <DialogTitle>{t.dialogs.createClass.title()}</DialogTitle>
            <DialogDescription>
              {t.dialogs.createClass.description()}
            </DialogDescription>
          </DialogHeader>
          <ClassForm
            onSuccess={() => {
              setIsAddDialogOpen(false)
              refetch()
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl sm:max-w-3xl backdrop-blur-xl bg-card/95 border-border/40">
          <DialogHeader>
            <DialogTitle>{t.classes.editClass()}</DialogTitle>
            <DialogDescription>
              {t.classes.description()}
            </DialogDescription>
          </DialogHeader>
          <ClassForm
            classData={classToEdit || undefined}
            onSuccess={() => {
              setIsEditDialogOpen(false)
              setClassToEdit(null)
              refetch()
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
