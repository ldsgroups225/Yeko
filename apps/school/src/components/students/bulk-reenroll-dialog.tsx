'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

export function BulkReEnrollDialog({ open, onOpenChange }: BulkReEnrollDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [result, setResult] = useState<ReEnrollResult | null>(null)

  const { data: schoolYears } = useQuery({
    queryKey: ['school-years'],
    queryFn: () => getSchoolYears(),
    enabled: open,
  })

  const form = useForm<ReEnrollFormData>({
    resolver: zodResolver(reEnrollSchema),
    defaultValues: {
      fromYearId: '',
      toYearId: '',
      autoConfirm: false,
    },
  })

  const reEnrollMutation = useMutation({
    mutationFn: (data: ReEnrollFormData) => bulkReEnroll({ data }),
    onSuccess: (data) => {
      setResult(data)
      queryClient.invalidateQueries({ queryKey: studentsKeys.all })
      if (data.success > 0) {
        toast.success(t('students.reEnrollSuccess', { count: data.success }))
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('students.bulkReEnroll')}</DialogTitle>
          <DialogDescription>
            {t('students.bulkReEnrollDescription')}
          </DialogDescription>
        </DialogHeader>

        {result
          ? (
            <div className="space-y-4">
              <Alert variant={result.errors.length > 0 ? 'destructive' : 'default'}>
                {result.errors.length > 0
                  ? (
                    <AlertCircle className="h-4 w-4" />
                  )
                  : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                <AlertTitle>{t('students.reEnrollComplete')}</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>{t('students.reEnrollSuccessCount', { count: result.success })}</li>
                    <li>{t('students.reEnrollSkippedCount', { count: result.skipped })}</li>
                    {result.errors.length > 0 && (
                      <li className="text-destructive">
                        {t('students.reEnrollErrorCount', { count: result.errors.length })}
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>

              {result.errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto rounded border p-2 text-sm">
                  { }
                  {result.errors.slice(0, 5).map(err => (
                    <p key={`error-${generateUUID()}-${err.error}`} className="text-destructive">{err.error}</p>
                  ))}
                  {result.errors.length > 5 && (
                    <p className="text-muted-foreground">
                      {t('common.andMore', { count: result.errors.length - 5 })}
                    </p>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button onClick={handleClose}>{t('common.close')}</Button>
              </DialogFooter>
            </div>
          )
          : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fromYearId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('students.fromSchoolYear')}
                        {' '}
                        *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('students.selectSourceYear')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {schoolYears?.map((year: any) => (
                            <SelectItem key={year.id} value={year.id}>
                              {year.template?.name || year.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>{t('students.fromSchoolYearDescription')}</FormDescription>
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
                        {t('students.toSchoolYear')}
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
                            <SelectValue placeholder={t('students.selectTargetYear')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {schoolYears
                            ?.filter((year: any) => year.id !== fromYearId)
                            .map((year: any) => (
                              <SelectItem key={year.id} value={year.id}>
                                {year.template?.name || year.name}
                                {year.isActive && ` (${t('common.active')})`}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>{t('students.toSchoolYearDescription')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="autoConfirm"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t('students.autoConfirmEnrollments')}</FormLabel>
                        <FormDescription>
                          {t('students.autoConfirmEnrollmentsDescription')}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={reEnrollMutation.isPending}>
                    {reEnrollMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('students.startReEnrollment')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
      </DialogContent>
    </Dialog>
  )
}
