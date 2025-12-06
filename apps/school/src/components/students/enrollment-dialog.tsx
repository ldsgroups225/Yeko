'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { classesOptions } from '@/lib/queries/classes'
import { studentsKeys } from '@/lib/queries/students'
import { createEnrollment } from '@/school/functions/enrollments'
import { getSchoolYears } from '@/school/functions/school-years'

const enrollmentSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  schoolYearId: z.string().min(1, 'School year is required'),
  enrollmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  rollNumber: z.number().int().positive().optional(),
})

type EnrollmentFormData = z.infer<typeof enrollmentSchema>

interface EnrollmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  studentName: string
}

export function EnrollmentDialog({ open, onOpenChange, studentId, studentName }: EnrollmentDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: schoolYears } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
    enabled: open,
  })

  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      classId: '',
      schoolYearId: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      rollNumber: undefined,
    },
  })

  const selectedYearId = form.watch('schoolYearId')

  const { data: classesData } = useQuery({
    ...classesOptions.list({ schoolYearId: selectedYearId }),
    enabled: open && !!selectedYearId,
  })

  const enrollMutation = useMutation({
    mutationFn: (data: EnrollmentFormData) =>
      createEnrollment({ data: { ...data, studentId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.detail(studentId) })
      toast.success(t('students.enrollmentSuccess'))
      onOpenChange(false)
      form.reset()
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const onSubmit = (data: EnrollmentFormData) => {
    enrollMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('students.enrollStudent')}</DialogTitle>
          <DialogDescription>
            {t('students.enrollStudentDescription', { name: studentName })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="schoolYearId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('students.schoolYear')}
                    {' '}
                    *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('students.selectSchoolYear')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schoolYears?.map((year: any) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                          {year.isActive && ` (${t('common.active')})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('students.class')}
                    {' '}
                    *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedYearId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('students.selectClass')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classesData?.map((cls: any) => (
                        <SelectItem key={cls.class.id} value={cls.class.id}>
                          {cls.grade?.name}
                          {' '}
                          {cls.class.section}
                          {cls.series?.name && ` (${cls.series.name})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {!selectedYearId && t('students.selectSchoolYearFirst')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enrollmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('students.enrollmentDate')}
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
              name="rollNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('students.rollNumber')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>{t('students.rollNumberDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={enrollMutation.isPending}>
                {enrollMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('students.enroll')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
