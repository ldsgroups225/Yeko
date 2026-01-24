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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Textarea } from '@workspace/ui/components/textarea'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTranslations } from '@/i18n'
import { classesOptions } from '@/lib/queries/classes'
import { studentsKeys } from '@/lib/queries/students'
import { transferStudent } from '@/school/functions/enrollments'

const transferSchema = z.object({
  newClassId: z.string().min(1, 'New class is required'),
  reason: z.string().max(500).optional(),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
})

type TransferFormData = z.infer<typeof transferSchema>

interface TransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  studentName: string
  currentEnrollmentId: string
  currentClassName: string
  schoolYearId: string
}

export function TransferDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  currentEnrollmentId,
  currentClassName,
  schoolYearId,
}: TransferDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const { data: classesData, isLoading: classesLoading } = useQuery({
    ...classesOptions.list({ schoolYearId }),
    enabled: open && !!schoolYearId,
  })

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      newClassId: '',
      reason: '',
      effectiveDate: new Date().toISOString().split('T')[0],
    },
  })

  const transferMutation = useMutation({
    mutationFn: (data: TransferFormData) =>
      transferStudent({
        data: {
          enrollmentId: currentEnrollmentId,
          newClassId: data.newClassId,
          reason: data.reason,
          effectiveDate: data.effectiveDate,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentsKeys.detail(studentId),
      })
      queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      toast.success(t.students.transferSuccess())
      onOpenChange(false)
      form.reset()
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const onSubmit = (data: TransferFormData) => {
    // Prevent transferring to the same class
    const selectedClass = classesData?.find(
      c => c.class.id === data.newClassId,
    )
    const newClassName = selectedClass
      ? `${selectedClass.grade?.name} ${selectedClass.class.section}${selectedClass.series?.name ? ` (${selectedClass.series.name})` : ''}`
      : ''

    if (newClassName === currentClassName) {
      form.setError('newClassId', {
        type: 'manual',
        message: t.students.cannotTransferToSameClass(),
      })
      return
    }

    transferMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-xl bg-card/95 border-border/40">
        <DialogHeader>
          <DialogTitle>{t.students.transferStudent()}</DialogTitle>
          <DialogDescription>
            {t.students.transferStudentDescription({
              name: studentName,
              class: currentClassName,
            })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newClassId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.students.newClass()}
                    {' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            classesLoading
                              ? t.common.loading()
                              : t.students.selectNewClass()
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classesData?.map(cls => (
                        <SelectItem key={cls.class.id} value={cls.class.id}>
                          {cls.grade?.name}
                          {' '}
                          {cls.class.section}
                          {cls.series?.name && ` (${cls.series.name})`}
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
              name="effectiveDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t.students.effectiveDate()}
                    {' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value ? new Date(field.value) : undefined}
                      onSelect={(date: Date | undefined) => field.onChange(date ? (date.toISOString().split('T')[0] ?? '') : '')}
                      placeholder={t.students.effectiveDate()}
                    />
                  </FormControl>
                  <FormDescription>
                    {t.students.effectiveDateDescription()}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.students.transferReason()}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t.students.transferReasonPlaceholder()}
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={transferMutation.isPending}>
                {transferMutation.isPending && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t.students.transfer()}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
