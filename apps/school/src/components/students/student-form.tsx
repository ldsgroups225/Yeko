import { zodResolver } from '@hookform/resolvers/zod'
import { IconDeviceFloppy, IconLoader2, IconRefresh, IconUpload, IconX } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Textarea } from '@workspace/ui/components/textarea'
import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTranslations } from '@/i18n'
import { studentsKeys } from '@/lib/queries/students'
import { getPresignedUploadUrl } from '@/school/functions/storage'
import { createStudent, generateMatricule, updateStudent } from '@/school/functions/students'
import { generateUUID } from '@/utils/generateUUID'
import { PhotoUploadDialog } from './photo-upload-dialog'

const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  gender: z.enum(['M', 'F', 'other']).optional(),
  photoUrl: z.string().optional(),
  matricule: z.string().max(20).optional(),
  birthPlace: z.string().max(100).optional(),
  nationality: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  emergencyContact: z.string().max(100).optional(),
  emergencyPhone: z.string().max(20).optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  medicalNotes: z.string().max(1000).optional(),
  previousSchool: z.string().max(200).optional(),
  admissionDate: z.string().optional(),
})

type StudentFormData = z.infer<typeof studentSchema>

interface StudentFormProps {
  student?: StudentFormData & { id: string }
  mode: 'create' | 'edit'
}

export function StudentForm({ student, mode }: StudentFormProps) {
  const t = useTranslations()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      nationality: student?.nationality || 'Ivoirien',
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
    mutationFn: (data: StudentFormData) => createStudent({ data }),
    onSuccess: (newStudent) => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      toast.success(t.students.createSuccess())
      if (newStudent) {
        navigate({ to: '/students/$studentId', params: { studentId: newStudent.id } })
      }
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: StudentFormData) =>
      updateStudent({ data: { id: student!.id, updates: data } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      toast.success(t.students.updateSuccess())
      navigate({ to: '/students/$studentId', params: { studentId: student!.id } })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const generateMatriculeMutation = useMutation({
    mutationFn: () => generateMatricule(),
    onSuccess: (matricule) => {
      form.setValue('matricule', matricule)
      toast.success(t.students.matriculeGenerated())
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const onSubmit = (data: StudentFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data)
    }
    else {
      updateMutation.mutate(data)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="personal" className="w-full space-y-8">
          <TabsList className="p-1 h-auto bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-full border border-white/20 dark:border-white/10 w-full md:w-auto inline-flex justify-start">
            <TabsTrigger value="personal" className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">{t.students.personalInfo()}</TabsTrigger>
            <TabsTrigger value="contact" className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">{t.students.contactInfo()}</TabsTrigger>
            <TabsTrigger value="medical" className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">{t.students.medicalInfo()}</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/20 bg-white/50 backdrop-blur-xl dark:bg-black/20"
            >
              <div className="border-b border-white/10 bg-white/30 px-6 py-4">
                <h3 className="text-lg font-semibold">{t.students.personalInfo()}</h3>
              </div>
              <div className="p-6 space-y-8">
                {/* Photo IconUpload */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={form.watch('photoUrl') || undefined} />
                    <AvatarFallback className="text-2xl">
                      {form.watch('firstName')?.[0]}
                      {form.watch('lastName')?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    {mode === 'edit' && student?.id
                      ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPhotoDialog(true)}
                          >
                            <IconUpload className="mr-2 h-4 w-4" />
                            {t.students.uploadPhoto()}
                          </Button>
                        )
                      : (
                          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                            {isUploadingPhoto ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconUpload className="h-4 w-4" />}
                            {isUploadingPhoto ? t.common.uploading() : t.students.uploadPhoto()}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="sr-only"
                              disabled={isUploadingPhoto}
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file)
                                  return
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
                                // Get presigned URL from server
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
                                    setIsUploadingPhoto(false)
                                    return
                                  }

                                  // IconUpload file directly to R2
                                  const uploadResponse = await fetch(result.presignedUrl, {
                                    method: 'PUT',
                                    body: file,
                                    headers: {
                                      'Content-Type': file.type,
                                    },
                                  })

                                  if (!uploadResponse.ok) {
                                    toast.error(t.students.uploadError())
                                    setIsUploadingPhoto(false)
                                    return
                                  }

                                  // Set the public URL in the form
                                  form.setValue('photoUrl', result.publicUrl)
                                  toast.success(t.students.photoUploadSuccess())
                                }
                                catch (error) {
                                  console.error('IconUpload error:', error)
                                  toast.error(t.students.uploadError())
                                }
                                finally {
                                  setIsUploadingPhoto(false)
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = ''
                                  }
                                }
                              }}
                            />
                          </label>
                        )}
                    <p className="text-sm text-muted-foreground">
                      {t.students.photoRequirements()}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.students.lastName()}
                          {' '}
                          *
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.students.firstName()}
                          {' '}
                          *
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.students.dateOfBirth()}
                          {' '}
                          *
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.students.gender()}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t.students.selectGender()}>
                                {field.value && (
                                  <div className="flex items-center gap-2">
                                    {field.value === 'M'
                                      ? (
                                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        )
                                      : field.value === 'F'
                                        ? (
                                            <div className="h-2 w-2 rounded-full bg-pink-500" />
                                          )
                                        : (
                                            <div className="h-2 w-2 rounded-full bg-gray-500" />
                                          )}
                                    <span className="ml-2">
                                      {field.value === 'M' ? t.students.male() : field.value === 'F' ? t.students.female() : t.students.other()}
                                    </span>
                                  </div>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="M">{t.students.male()}</SelectItem>
                            <SelectItem value="F">{t.students.female()}</SelectItem>
                            <SelectItem value="other">{t.students.other()}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthPlace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.students.birthPlace()}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.students.nationality()}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Matricule */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="matricule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.students.matricule()}</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} placeholder={t.students.matriculePlaceholder()} />
                          </FormControl>
                          {mode === 'create' && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => generateMatriculeMutation.mutate()}
                              disabled={generateMatriculeMutation.isPending}
                            >
                              {generateMatriculeMutation.isPending
                                ? (
                                    <IconLoader2 className="h-4 w-4 animate-spin" />
                                  )
                                : (
                                    <IconRefresh className="h-4 w-4" />
                                  )}
                            </Button>
                          )}
                        </div>
                        <FormDescription>
                          {t.students.matriculeDescription()}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="admissionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.students.admissionDate()}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="previousSchool"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.students.previousSchool()}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </motion.div>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/20 bg-white/50 backdrop-blur-xl dark:bg-black/20"
            >
              <div className="border-b border-white/10 bg-white/30 px-6 py-4">
                <h3 className="text-lg font-semibold">{t.students.contactInfo()}</h3>
              </div>
              <div className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.students.address()}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.students.emergencyContact()}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          {t.students.emergencyContactDescription()}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.students.emergencyPhone()}</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Medical Information Tab */}
          <TabsContent value="medical" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/20 bg-white/50 backdrop-blur-xl dark:bg-black/20"
            >
              <div className="border-b border-white/10 bg-white/30 px-6 py-4">
                <h3 className="text-lg font-semibold">{t.students.medicalInfo()}</h3>
              </div>
              <div className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="bloodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.students.bloodType()}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder={t.students.selectBloodType()}>
                              {field.value && (
                                <div className="flex items-center gap-2">
                                  <div className={`h-2 w-2 rounded-full ${
                                    field.value.includes('+') ? 'bg-red-500' : 'bg-blue-500'
                                  }`}
                                  />
                                  <span className="ml-2">{field.value}</span>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.students.medicalNotes()}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} placeholder={t.students.medicalNotesPlaceholder()} />
                      </FormControl>
                      <FormDescription>
                        {t.students.medicalNotesDescription()}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 sticky bottom-4 z-10 p-4 rounded-xl border border-white/20 bg-white/80 backdrop-blur-md shadow-sm dark:bg-black/80 dark:border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate({ to: '/students', search: { page: 1 } })}
            className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            <IconX className="mr-2 h-4 w-4" />
            {t.common.cancel()}
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-all">
            {isLoading ? <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> : <IconDeviceFloppy className="mr-2 h-4 w-4" />}
            {mode === 'create' ? t.students.createStudent() : t.students.updateStudent()}
          </Button>
        </div>
      </form>

      {mode === 'edit' && student?.id && (
        <PhotoUploadDialog
          open={showPhotoDialog}
          onOpenChange={setShowPhotoDialog}
          currentPhotoUrl={form.watch('photoUrl')}
          entityType="student"
          entityId={student!.id}
          entityName={`${form.watch('firstName')} ${form.watch('lastName')} `}
          onPhotoUploaded={(photoUrl) => {
            form.setValue('photoUrl', photoUrl)
          }}
        />
      )}
    </Form>
  )
}
