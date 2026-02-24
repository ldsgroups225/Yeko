import type { StudentFormData, StudentFormProps } from './types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n'
import { studentsKeys, studentsMutations } from '@/lib/queries/students'
import { getPresignedUploadUrl } from '@/school/functions/storage'
import { generateUUID } from '@/utils/generateUUID'
import { StudentFormContext } from './student-form-context'
import { studentSchema } from './types'

export function StudentFormProvider({
  student,
  mode,
  children,
}: StudentFormProps & { children: React.ReactNode }) {
  const t = useTranslations()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: student?.firstName,
      lastName: student?.lastName,
      dob: student?.dob,
      gender: student?.gender,
      photoUrl: student?.photoUrl,
      matricule: student?.matricule,
      birthPlace: student?.birthPlace,
      nationality: student?.nationality || 'Ivoirienne',
      address: student?.address,
      emergencyContact: student?.emergencyContact,
      emergencyPhone: student?.emergencyPhone,
      bloodType: student?.bloodType,
      medicalNotes: student?.medicalNotes,
      previousSchool: student?.previousSchool,
      admissionDate: student?.admissionDate || new Date().toISOString().split('T')[0],
    },
  })

  const createMutation = useMutation({
    ...studentsMutations.create,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      if (result.success) {
        toast.success(t.students.createSuccess())
        navigate({ to: '/students/$studentId', params: { studentId: result.data.id } })
      }
      else {
        toast.error(result.error)
      }
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const updateMutation = useMutation({
    ...studentsMutations.update,
    mutationFn: (data: StudentFormData) =>
      studentsMutations.update.mutationFn({ id: student!.id, data }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      if (result.success) {
        toast.success(t.students.updateSuccess())
        navigate({ to: '/students/$studentId', params: { studentId: student!.id } })
      }
      else {
        toast.error(result.error)
      }
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const generateMatriculeMutation = useMutation({
    ...studentsMutations.generateMatricule,
    onSuccess: (result) => {
      if (result.success) {
        form.setValue('matricule', result.data)
        toast.success(t.students.matriculeGenerated())
      }
      else {
        toast.error(result.error)
      }
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t.students.invalidFileType())
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.students.fileTooLarge())
      return
    }

    setIsUploadingPhoto(true)
    try {
      const tempEntityId = student?.id || generateUUID()
      const result = await getPresignedUploadUrl({
        data: {
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
          entityType: 'student',
          entityId: tempEntityId,
        },
      })

      if (!result.success) {
        toast.error(result.error || t.students.uploadError())
        return
      }

      const uploadResponse = await fetch(result.data.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        toast.error(t.students.uploadError())
        return
      }

      form.setValue('photoUrl', result.data.publicUrl)
      toast.success(t.students.photoUploadSuccess())
    }
    catch (error) {
      console.error('Upload error:', error)
      toast.error(t.students.uploadError())
    }
    finally {
      setIsUploadingPhoto(false)
    }
  }

  const onSubmit = (data: StudentFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data)
    }
    else {
      updateMutation.mutate(data)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending || generateMatriculeMutation.isPending

  return (
    <StudentFormContext
      value={{
        state: {
          mode,
          student,
          isPending,
          isUploadingPhoto,
          showPhotoDialog,
        },
        actions: {
          form,
          onSubmit,
          setShowPhotoDialog,
          setIsUploadingPhoto,
          generateMatricule: () => generateMatriculeMutation.mutate(undefined),
          handlePhotoUpload,
        },
      }}
    >
      {children}
    </StudentFormContext>
  )
}
