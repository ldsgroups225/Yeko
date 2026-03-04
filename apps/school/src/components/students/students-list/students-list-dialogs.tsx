import type { StudentStatus } from '@repo/data-ops/drizzle/school-schema'
import type { StudentWithDetails } from '@repo/data-ops/queries/students-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { invalidateAll, rollback, snapshotAndUpdate } from '@/lib/mutations'
import { studentsKeys, studentsMutations } from '@/lib/queries/students'
import { AutoMatchDialog } from '../auto-match-dialog'
import { BulkReEnrollDialog } from '../bulk-reenroll-dialog'
import { ImportDialog } from '../import-dialog'
import { StudentStatusDialog } from '../student-status-dialog'
import { useStudentsList } from './students-list-context'

interface PaginatedStudents {
  data: StudentWithDetails[]
  total: number
  page: number
  totalPages: number
}

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
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: studentsKeys.lists() })
      return snapshotAndUpdate<PaginatedStudents>(
        queryClient,
        studentsKeys.lists(),
        old => ({
          ...old,
          data: old.data.filter(s => s.student.id !== id),
          total: old.total - 1,
        }),
      )
    },
    onSuccess: () => {
      toast.success(t.students.deleteSuccess())
      setDeleteDialogOpen(false)
    },
    onError: (err: Error, _vars, context) => {
      rollback(queryClient, context)
      toast.error(err.message)
    },
    onSettled: () => invalidateAll(queryClient, [studentsKeys.all]),
  })

  const statusMutation = useMutation({
    ...studentsMutations.updateStatus,
    onMutate: async (vars: { id: string, status: StudentStatus, reason?: string }) => {
      await queryClient.cancelQueries({ queryKey: studentsKeys.lists() })
      return snapshotAndUpdate<PaginatedStudents>(
        queryClient,
        studentsKeys.lists(),
        old => ({
          ...old,
          data: old.data.map(s =>
            s.student.id === vars.id
              ? { ...s, student: { ...s.student, status: vars.status } }
              : s,
          ),
        }),
      )
    },
    onSuccess: () => {
      toast.success(t.students.statusUpdateSuccess())
      setStatusDialogOpen(false)
    },
    onError: (err: Error, _vars, context) => {
      rollback(queryClient, context)
      toast.error(err.message)
    },
    onSettled: () => invalidateAll(queryClient, [studentsKeys.all]),
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
