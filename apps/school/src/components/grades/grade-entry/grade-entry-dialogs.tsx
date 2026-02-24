import { ConfirmationDialog } from '@workspace/ui/components/confirmation-dialog'
import { useTranslations } from '@/i18n'
import { useGradeEntry } from './grade-entry-context'

export function GradeEntryDialogs() {
  const t = useTranslations()
  const { state, actions, dialogs } = useGradeEntry()
  const { subjectName, gradesByStudent, pendingChanges, isPendingAction } = state
  const { confirmAssignment, confirmSubmit, confirmReset, setPendingAssignment, setIsConfirmingSubmit, setIsConfirmingReset } = actions
  const { pendingAssignment, isConfirmingSubmit, isConfirmingReset } = dialogs

  return (
    <>
      <ConfirmationDialog
        open={!!pendingAssignment}
        onOpenChange={open => !open && setPendingAssignment(null)}
        title={t.dialogs.updateAssignment.title()}
        description={t.dialogs.updateAssignment.description({
          teacherName: pendingAssignment?.teacherName || '',
          subjectName,
        })}
        confirmLabel={t.dialogs.updateAssignment.confirm()}
        onConfirm={() => {
          if (pendingAssignment) {
            confirmAssignment(pendingAssignment.teacherId)
          }
        }}
        isPending={isPendingAction}
      />

      <ConfirmationDialog
        open={isConfirmingSubmit}
        onOpenChange={setIsConfirmingSubmit}
        title={t.academic.grades.validations.confirmSubmitTitle()}
        description={t.academic.grades.validations.confirmSubmitDescription({ count: gradesByStudent.size })}
        onConfirm={confirmSubmit}
        isPending={isPendingAction}
      />

      <ConfirmationDialog
        open={isConfirmingReset}
        onOpenChange={setIsConfirmingReset}
        title={t.academic.grades.entry.confirmResetTitle()}
        description={t.academic.grades.entry.confirmResetDescription({ count: pendingChanges.size + gradesByStudent.size })}
        onConfirm={confirmReset}
        variant="destructive"
        isPending={isPendingAction}
      />
    </>
  )
}
