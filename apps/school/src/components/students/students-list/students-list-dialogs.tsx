import type { StudentStatus } from '@repo/data-ops/drizzle/school-schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { studentsKeys, studentsMutations } from '@/lib/queries/students'
import { AutoMatchDialog } from '../auto-match-dialog'
import { BulkReEnrollDialog } from '../bulk-reenroll-dialog'
import { ImportDialog } from '../import-dialog'
import { StudentStatusDialog } from '../student-status-dialog'
import { useStudentsList } from './students-list-context'

export function StudentsListDialogs() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { state, actions } = useStudentsList()
  const {
    selectedStudent,
    deleteDialogOpen,
    statusDialogOpen,
    reEnrollDialogOpen,
    importDialogOpen,
    autoMatchDialogOpen,
  } = state
  const {
    setDeleteDialogOpen,
    setStatusDialogOpen,
    setReEnrollDialogOpen,
    setImportDialogOpen,
    setAutoMatchDialogOpen,
  } = actions

  const deleteMutation = useMutation({
    ...studentsMutations.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      toast.success(t.students.deleteSuccess())
      setDeleteDialogOpen(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const statusMutation = useMutation({
    ...studentsMutations.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      toast.success(t.students.statusUpdateSuccess())
      setStatusDialogOpen(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return (
    <>
      {/* Delete Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t.students.deleteTitle()}
        description={t.students.deleteDescription({
          name: `${selectedStudent?.student.firstName} ${selectedStudent?.student.lastName}`,
        })}
        onConfirm={() => {
          if (selectedStudent) {
            deleteMutation.mutate(selectedStudent.student.id)
          }
        }}
        isPending={deleteMutation.isPending}
      />

      {/* Status Change Dialog */}
      <StudentStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        student={selectedStudent?.student}
        onConfirm={(newStatus, reason) =>
          selectedStudent
          && statusMutation.mutate({
            id: selectedStudent.student.id,
            status: newStatus as StudentStatus,
            reason,
          })}
        isPending={statusMutation.isPending}
      />

      {/* Bulk Re-enrollment Dialog */}
      <BulkReEnrollDialog open={reEnrollDialogOpen} onOpenChange={setReEnrollDialogOpen} />

      {/* Import Dialog */}
      <ImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />

      {/* Auto-Match Parents Dialog */}
      <AutoMatchDialog open={autoMatchDialogOpen} onOpenChange={setAutoMatchDialogOpen} />
    </>
  )
}
