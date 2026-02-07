import { zodResolver } from '@hookform/resolvers/zod'
import { IconLoader2 } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'
import { DatePicker } from '@workspace/ui/components/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'

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

export function EnrollmentDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
}: EnrollmentDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { schoolYearId: contextSchoolYearId } = useSchoolYearContext()

  const { data: schoolYearsData } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
    enabled: open,
  })

  // Find the active school year or use context school year
  const activeSchoolYear = schoolYearsData?.success ? schoolYearsData.data.find(sy => sy.isActive) : undefined
  const schoolYears = schoolYearsData?.success ? schoolYearsData.data : []
  const defaultSchoolYearId = contextSchoolYearId || activeSchoolYear?.id || ''

  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      classId: '',
      schoolYearId: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      rollNumber: undefined,
    },
  })

  // Auto-select school year when data loads
  useEffect(() => {
    if (open && defaultSchoolYearId && !form.getValues('schoolYearId')) {
      form.setValue('schoolYearId', defaultSchoolYearId)
    }
  }, [open, defaultSchoolYearId, form])

  const selectedYearId = form.watch('schoolYearId')

  const { data: classes, isPending: isPendingClasses } = useQuery({
    ...classesOptions.list({ schoolYearId: selectedYearId }),
    enabled: open && !!selectedYearId,
  })

  const enrollMutation = useMutation({
    mutationKey: schoolMutationKeys.enrollments.create,
    mutationFn: (data: EnrollmentFormData) =>
      createEnrollment({ data: { ...data, studentId } }),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: studentsKeys.detail(studentId),
        })
        toast.success(t.students.enrollmentSuccess())
        onOpenChange(false)
        form.reset()
      }
      else {
        toast.error(result.error)
      }
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
      <DialogContent className="sm:max-w-[425px] backdrop-blur-xl bg-card/95 border-border/40">
        <DialogHeader>
          <DialogTitle>{t.students.enrollStudent()}</DialogTitle>
          <DialogDescription>
            {t.students.enrollStudentDescription({ name: studentName })}
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
                    {t.students.schoolYear()}
                    {' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.students.selectSchoolYear()}>
                          {field.value
                            ? (() => {
                                const year = schoolYears.find(y => y.id === field.value)
                                return year
                                  ? (
                                      <div className="flex items-center gap-2">
                                        <span>{year.template.name}</span>
                                        {year.isActive && (
                                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                            {t.common.active()}
                                          </span>
                                        )}
                                      </div>
                                    )
                                  : undefined
                              })()
                            : undefined}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schoolYears?.map(year => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.template.name}
                          {year.isActive && ` (${t.common.active()})`}
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
                    {t.students.class()}
                    {' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedYearId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.students.selectClass()}>
                          {field.value
                            ? (() => {
                                const cls = classes?.find(c => c.class.id === field.value)
                                return cls
                                  ? (
                                      <div className="flex items-center gap-2">
                                        <span>
                                          {cls.grade?.name}
                                          {' '}
                                          {cls.class.section}
                                        </span>
                                        {cls.series?.name && (
                                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                            {cls.series.name}
                                          </span>
                                        )}
                                      </div>
                                    )
                                  : undefined
                              })()
                            : undefined}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes?.map(cls => (
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
                    {!selectedYearId && t.students.selectSchoolYearFirst()}
                    {selectedYearId && isPendingClasses && t.common.loading()}
                    {selectedYearId
                      && !isPendingClasses
                      && (!classes || classes.length === 0)
                      && t.students.noClassesForYear()}
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
                    {t.students.enrollmentDate()}
                    {' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      captionLayout="dropdown"
                      date={field.value ? new Date(field.value) : undefined}
                      onSelect={(date: Date | undefined) => field.onChange(date ? (date.toISOString().split('T')[0] ?? '') : '')}
                      placeholder={t.students.enrollmentDate()}
                    />
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
                  <FormLabel>{t.students.rollNumber()}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined,
                        )}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    {t.students.rollNumberDescription()}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t.common.cancel()}
              </Button>
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
