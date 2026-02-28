import { zodResolver } from '@hookform/resolvers/zod'
import { IconLoader2 } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Form } from '@workspace/ui/components/form'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { classesOptions } from '@/lib/queries/classes'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { studentsKeys } from '@/lib/queries/students'
import { createEnrollment } from '@/school/functions/enrollments'
import { getSchoolYears } from '@/school/functions/school-years'
import { EnrollmentFormFields } from './enrollments/enrollment-form-fields'

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
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { schoolYearId: contextSchoolYearId } = useSchoolYearContext()

  const { data: schoolYearsData } = useQuery({ queryKey: ['school-years'], queryFn: () => getSchoolYears(), enabled: open })
  const activeSchoolYear = schoolYearsData?.success ? schoolYearsData.data.find(sy => sy.isActive) : undefined
  const schoolYears = schoolYearsData?.success ? schoolYearsData.data : []
  const defaultSchoolYearId = contextSchoolYearId || activeSchoolYear?.id || ''

  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: { classId: '', schoolYearId: '', enrollmentDate: new Date().toISOString().split('T')[0], rollNumber: undefined },
  })

  useEffect(() => {
    if (open && defaultSchoolYearId && !form.getValues('schoolYearId'))
      form.setValue('schoolYearId', defaultSchoolYearId)
  }, [open, defaultSchoolYearId, form])

  const selectedYearId = form.watch('schoolYearId')
  const { data: classes, isPending: isPendingClasses } = useQuery({ ...classesOptions.list({ schoolYearId: selectedYearId }), enabled: open && !!selectedYearId })

  const enrollMutation = useMutation({
    mutationKey: schoolMutationKeys.enrollments.create,
    mutationFn: (data: EnrollmentFormData) => createEnrollment({ data: { ...data, studentId } }),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: studentsKeys.detail(studentId) })
        toast.success(t.students.enrollmentSuccess())
        onOpenChange(false)
        form.reset()
      }
      else {
        toast.error(result.error)
      }
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        bg-card/95 border-border/40 backdrop-blur-xl
        sm:max-w-[425px]
      "
      >
        <DialogHeader>
          <DialogTitle>{t.students.enrollStudent()}</DialogTitle>
          <DialogDescription>{t.students.enrollStudentDescription({ name: studentName })}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(d => enrollMutation.mutate(d))}
            className="space-y-4"
          >
            <EnrollmentFormFields form={form} schoolYears={schoolYears} classes={classes || []} isPendingClasses={isPendingClasses} selectedYearId={selectedYearId} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t.common.cancel()}</Button>
              <Button type="submit" disabled={enrollMutation.isPending}>
                {enrollMutation.isPending && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t.students.enroll()}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
