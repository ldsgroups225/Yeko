'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, RefreshCw, Upload } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { studentsKeys } from '@/lib/queries/students'
import { createStudent, generateMatricule, updateStudent } from '@/school/functions/students'

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
  student?: any
  mode: 'create' | 'edit'
}

export function StudentForm({ student, mode }: StudentFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [_showPhotoCropper, setShowPhotoCropper] = useState(false)

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: student?.firstName || '',
      lastName: student?.lastName || '',
      dob: student?.dob || '',
      gender: student?.gender || undefined,
      photoUrl: student?.photoUrl || '',
      matricule: student?.matricule || '',
      birthPlace: student?.birthPlace || '',
      nationality: student?.nationality || 'Ivoirien',
      address: student?.address || '',
      emergencyContact: student?.emergencyContact || '',
      emergencyPhone: student?.emergencyPhone || '',
      bloodType: student?.bloodType || undefined,
      medicalNotes: student?.medicalNotes || '',
      previousSchool: student?.previousSchool || '',
      admissionDate: student?.admissionDate || new Date().toISOString().split('T')[0],
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: StudentFormData) => createStudent({ data }),
    onSuccess: (newStudent) => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      toast.success(t('students.createSuccess'))
      navigate({ to: '/app/students/$studentId', params: { studentId: newStudent.id } })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: StudentFormData) =>
      updateStudent({ data: { id: student.id, updates: data } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      toast.success(t('students.updateSuccess'))
      navigate({ to: '/app/students/$studentId', params: { studentId: student.id } })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const generateMatriculeMutation = useMutation({
    mutationFn: () => generateMatricule(),
    onSuccess: (matricule) => {
      form.setValue('matricule', matricule)
      toast.success(t('students.matriculeGenerated'))
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
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">{t('students.personalInfo')}</TabsTrigger>
            <TabsTrigger value="contact">{t('students.contactInfo')}</TabsTrigger>
            <TabsTrigger value="medical">{t('students.medicalInfo')}</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('students.personalInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Photo Upload */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={form.watch('photoUrl') || undefined} />
                    <AvatarFallback className="text-2xl">
                      {form.watch('firstName')?.[0]}
                      {form.watch('lastName')?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPhotoCropper(true)}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {t('students.uploadPhoto')}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      {t('students.photoRequirements')}
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
                          {t('students.lastName')}
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
                          {t('students.firstName')}
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
                          {t('students.dateOfBirth')}
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
                        <FormLabel>{t('students.gender')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('students.selectGender')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="M">{t('students.male')}</SelectItem>
                            <SelectItem value="F">{t('students.female')}</SelectItem>
                            <SelectItem value="other">{t('students.other')}</SelectItem>
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
                        <FormLabel>{t('students.birthPlace')}</FormLabel>
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
                        <FormLabel>{t('students.nationality')}</FormLabel>
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
                        <FormLabel>{t('students.matricule')}</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} placeholder={t('students.matriculePlaceholder')} />
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
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  )
                                : (
                                    <RefreshCw className="h-4 w-4" />
                                  )}
                            </Button>
                          )}
                        </div>
                        <FormDescription>
                          {t('students.matriculeDescription')}
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
                        <FormLabel>{t('students.admissionDate')}</FormLabel>
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
                      <FormLabel>{t('students.previousSchool')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('students.contactInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('students.address')}</FormLabel>
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
                        <FormLabel>{t('students.emergencyContact')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          {t('students.emergencyContactDescription')}
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
                        <FormLabel>{t('students.emergencyPhone')}</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical Information Tab */}
          <TabsContent value="medical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('students.medicalInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="bloodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('students.bloodType')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder={t('students.selectBloodType')} />
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
                      <FormLabel>{t('students.medicalNotes')}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} placeholder={t('students.medicalNotesPlaceholder')} />
                      </FormControl>
                      <FormDescription>
                        {t('students.medicalNotesDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate({ to: '/app/students', search: { page: 1 } })}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? t('students.createStudent') : t('students.updateStudent')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
