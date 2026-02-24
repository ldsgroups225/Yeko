import { PhotoUploadDialog } from '../photo-upload-dialog'
import { useStudentForm } from './student-form-context'

export default function StudentFormDialogs() {
  const { state, actions } = useStudentForm()
  const { showPhotoDialog, mode, student } = state
  const { setShowPhotoDialog, form } = actions

  if (mode !== 'edit' || !student?.id)
    return null

  return (
    <PhotoUploadDialog
      open={showPhotoDialog}
      onOpenChange={setShowPhotoDialog}
      currentPhotoUrl={form.watch('photoUrl')}
      entityType="student"
      entityId={student.id}
      entityName={`${form.watch('firstName')} ${form.watch('lastName')} `}
      onPhotoUploaded={(photoUrl) => {
        form.setValue('photoUrl', photoUrl)
      }}
    />
  )
}
