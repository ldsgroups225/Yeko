import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconAlertCircle,
  IconCircleCheck,
  IconLoader2,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert'
import { Button } from '@workspace/ui/components/button'
import { Checkbox } from '@workspace/ui/components/checkbox'
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
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { studentsKeys } from '@/lib/queries/students'
import { bulkReEnroll } from '@/school/functions/enrollments'
import { getSchoolYears } from '@/school/functions/school-years'
import { generateUUID } from '@/utils/generateUUID'

const reEnrollSchema = z.object({
  fromYearId: z.string().min(1, 'Source year is required'),
  toYearId: z.string().min(1, 'Target year is required'),
  autoConfirm: z.boolean(),
})

type ReEnrollFormData = z.infer<typeof reEnrollSchema>

interface BulkReEnrollDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ReEnrollResult {
  success: number
  skipped: number
  errors: Array<{ studentId: string, error: string }>
}

export function BulkReEnrollDialog({
  open,
  onOpenChange,
}: BulkReEnrollDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const [result, setResult] = useState<ReEnrollResult | null>(null)

  const { data: schoolYearsData } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
    enabled: open,
  })

  const schoolYears = schoolYearsData?.success ? schoolYearsData.data : []

  const form = useForm<ReEnrollFormData>({
    resolver: zodResolver(reEnrollSchema),
    defaultValues: {
      fromYearId: '',
      toYearId: '',
      autoConfirm: false,
    },
  })

  const reEnrollMutation = useMutation({
    mutationKey: schoolMutationKeys.students.bulkReEnroll,
    mutationFn: (data: ReEnrollFormData) => bulkReEnroll({ data }),
    onSuccess: (result) => {
      if (result.success) {
        setResult(result.data)
        queryClient.invalidateQueries({ queryKey: studentsKeys.all })
        if (result.data.success > 0) {
          toast.success(t.students.reEnrollSuccess({ count: result.data.success }))
        }
      }
      else {
        toast.error(result.error)
      }
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const onSubmit = (data: ReEnrollFormData) => {
    setResult(null)
    reEnrollMutation.mutate(data)
  }

  const handleClose = () => {
    setResult(null)
    form.reset()
    onOpenChange(false)
  }

  const fromYearId = form.watch('fromYearId')

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="
        bg-card/95 border-border/40 max-w-lg backdrop-blur-xl
      "
      >
        <DialogHeader>
          <DialogTitle>{t.students.bulkReEnroll()}</DialogTitle>
          <DialogDescription>
            {t.students.bulkReEnrollDescription()}
          </DialogDescription>
        </DialogHeader>

        {result
          ? (
              <div className="space-y-4">
                <Alert
                  variant={result.errors.length > 0 ? 'destructive' : 'default'}
                >
                  {result.errors.length > 0
                    ? (
                        <IconAlertCircle className="h-4 w-4" />
                      )
                    : (
                        <IconCircleCheck className="h-4 w-4" />
                      )}
                  <AlertTitle>{t.students.reEnrollComplete()}</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>
                        {t.students.reEnrollSuccessCount({ count: result.success })}
                      </li>
                      <li>
                        {t.students.reEnrollSkippedCount({ count: result.skipped })}
                      </li>
                      {result.errors.length > 0 && (
                        <li className="text-destructive">
                          {t.students.reEnrollErrorCount({
                            count: result.errors.length,
                          })}
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>

                {result.errors.length > 0 && (
                  <div className="
                    max-h-32 overflow-y-auto rounded-sm border p-2 text-sm
                  "
                  >
                    {}
                    {result.errors.slice(0, 5).map(err => (
                      <p
                        key={`error-${generateUUID()}-${err.error}`}
                        className="text-destructive"
                      >
                        {err.error}
                      </p>
                    ))}
                    {result.errors.length > 5 && (
                      <p className="text-muted-foreground">
                        {t.common.andMore({ count: result.errors.length - 5 })}
                      </p>
                    )}
                  </div>
                )}

                <DialogFooter>
                  <Button onClick={handleClose}>{t.common.close()}</Button>
                </DialogFooter>
              </div>
            )
          : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="fromYearId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.students.fromSchoolYear()}
                          {' '}
                          *
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t.students.selectSourceYear()}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {schoolYears?.map(year => (
                              <SelectItem key={year.id} value={year.id}>
                                {year.template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t.students.fromSchoolYearDescription()}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="toYearId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.students.toSchoolYear()}
                          {' '}
                          *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!fromYearId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t.students.selectTargetYear()}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {schoolYears
                              ?.filter(year => year.id !== fromYearId)
                              .map(year => (
                                <SelectItem key={year.id} value={year.id}>
                                  {year.template.name}
                                  {year.isActive && ` (${t.common.active()})`}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t.students.toSchoolYearDescription()}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="autoConfirm"
                    render={({ field }) => (
                      <FormItem className="
                        flex flex-row items-start space-y-0 space-x-3 rounded-md
                        border p-4
                      "
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {t.students.autoConfirmEnrollments()}
                          </FormLabel>
                          <FormDescription>
                            {t.students.autoConfirmEnrollmentsDescription()}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose}>
                      {t.common.cancel()}
                    </Button>
                    <Button type="submit" disabled={reEnrollMutation.isPending}>
                      {reEnrollMutation.isPending && (
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {t.students.startReEnrollment()}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
      </DialogContent>
    </Dialog>
  )
}
