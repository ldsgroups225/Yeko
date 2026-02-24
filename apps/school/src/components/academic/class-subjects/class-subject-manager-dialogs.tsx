import { ConfirmationDialog } from '@workspace/ui/components/confirmation-dialog'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import { useTranslations } from '@/i18n'
import { ClassSubjectDialog } from './class-subject-dialog'
import { useClassSubjectManager } from './class-subject-manager-context'
import { SubjectCopyDialog } from './subject-copy-dialog'

export function ClassSubjectManagerDialogs() {
  const t = useTranslations()
  const { state, actions } = useClassSubjectManager()
  const {
    classId,
    className,
    isDialogOpen,
    isCopyDialogOpen,
    subjectToDelete,
    pendingAssignment,
    isPending,
    isAssigning,
  } = state
  const {
    setIsDialogOpen,
    setIsCopyDialogOpen,
    setSubjectToDelete,
    setPendingAssignment,
    handleDelete,
    handleAssign,
  } = actions

  return (
    <>
      <ClassSubjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        classId={classId}
        className={className}
      />

      <SubjectCopyDialog
        open={isCopyDialogOpen}
        onOpenChange={setIsCopyDialogOpen}
        targetClassId={classId}
        targetClassName={className}
      />

      <DeleteConfirmationDialog
        open={!!subjectToDelete}
        onOpenChange={open => !open && setSubjectToDelete(null)}
        title={t.classes.removeSubject()}
        description={t.academic.classes.removeSubjectConfirmation({
          subjectName: subjectToDelete?.name,
        })}
        onConfirm={handleDelete}
        isPending={isPending}
      />

      <ConfirmationDialog
        open={!!pendingAssignment}
        onOpenChange={open => !open && setPendingAssignment(null)}
        title={t.dialogs.updateAssignment.title()}
        description={t.dialogs.updateAssignment.description({
          teacherName: pendingAssignment?.teacherName || '',
          subjectName: pendingAssignment?.subjectName || '',
        })}
        confirmLabel={t.dialogs.updateAssignment.confirm()}
        onConfirm={handleAssign}
        isPending={isAssigning}
      />
    </>
  )
}
