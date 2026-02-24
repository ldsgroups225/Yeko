import { useMutation, useQueryClient } from '@tanstack/react-query'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { studentsKeys } from '@/lib/queries/students'
import { updateStudent } from '@/school/functions/students'
import { EnrollmentDialog } from '../enrollment-dialog'
import { ParentLinkDialog } from '../parent-link-dialog'
import { PhotoUploadDialog } from '../photo-upload-dialog'
import { TransferDialog } from '../transfer-dialog'

interface StudentDetailDialogsProps {
  studentId: string
  studentName: string
  photoUrl?: string | null
  currentEnrollment: any
  currentClass: any
  parentDialogOpen: boolean
  setParentDialogOpen: (open: boolean) => void
  enrollmentDialogOpen: boolean
  setEnrollmentDialogOpen: (open: boolean) => void
  transferDialogOpen: boolean
  setTransferDialogOpen: (open: boolean) => void
  photoDialogOpen: boolean
  setPhotoDialogOpen: (open: boolean) => void
}

export function StudentDetailDialogs({
  studentId,
  studentName,
  photoUrl,
  currentEnrollment,
  currentClass,
  parentDialogOpen,
  setParentDialogOpen,
  enrollmentDialogOpen,
  setEnrollmentDialogOpen,
  transferDialogOpen,
  setTransferDialogOpen,
  photoDialogOpen,
  setPhotoDialogOpen,
}: StudentDetailDialogsProps) {
  const queryClient = useQueryClient()

  const updatePhotoMutation = useMutation({
    mutationKey: schoolMutationKeys.students.uploadPhoto,
    mutationFn: (newPhotoUrl: string) =>
      updateStudent({ data: { id: studentId, data: { photoUrl: newPhotoUrl } } }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentsKeys.detail(studentId),
      })
    },
  })

  return (
    <>
      <ParentLinkDialog
        open={parentDialogOpen}
        onOpenChange={setParentDialogOpen}
        studentId={studentId}
      />
      <EnrollmentDialog
        open={enrollmentDialogOpen}
        onOpenChange={setEnrollmentDialogOpen}
        studentId={studentId}
        studentName={studentName}
      />
      {currentEnrollment && currentClass && (
        <TransferDialog
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          studentId={studentId}
          studentName={studentName}
          currentEnrollmentId={currentEnrollment.id}
          currentClassName={`${currentClass.gradeName} ${currentClass.section}`}
          schoolYearId={currentEnrollment.schoolYearId}
        />
      )}
      <PhotoUploadDialog
        open={photoDialogOpen}
        onOpenChange={setPhotoDialogOpen}
        currentPhotoUrl={photoUrl}
        entityType="student"
        entityId={studentId}
        entityName={studentName}
        onPhotoUploaded={(newPhotoUrl) => {
          updatePhotoMutation.mutate(newPhotoUrl)
        }}
      />
    </>
  )
}
