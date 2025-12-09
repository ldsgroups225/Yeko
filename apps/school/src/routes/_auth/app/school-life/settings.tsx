import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Skeleton } from '@/components/ui/skeleton'
import { getSettings, updateSettings } from '@/school/functions/attendance-settings'

export const Route = createFileRoute('/_auth/app/school-life/settings')({
  component: AttendanceSettingsPage,
})

const settingsSchema = z.object({
  teacherExpectedArrival: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
  teacherLateThresholdMinutes: z.coerce.number().min(1).max(60),
  teacherLatenessAlertCount: z.coerce.number().min(1).max(10),
  studentLateThresholdMinutes: z.coerce.number().min(1).max(60),
  chronicAbsenceThresholdPercent: z.coerce.number().min(1).max(50),
  notifyParentOnAbsence: z.boolean(),
  notifyParentOnLate: z.boolean(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

function AttendanceSettingsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['attendance-settings'],
    queryFn: () => getSettings(),
  })

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as never,
    values: settings
      ? {
          teacherExpectedArrival: settings.teacherExpectedArrival ?? '07:30',
          teacherLateThresholdMinutes: settings.teacherLateThresholdMinutes ?? 15,
          teacherLatenessAlertCount: settings.teacherLatenessAlertCount ?? 3,
          studentLateThresholdMinutes: settings.studentLateThresholdMinutes ?? 10,
          chronicAbsenceThresholdPercent: Number(settings.chronicAbsenceThresholdPercent) || 10,
          notifyParentOnAbsence: settings.notifyParentOnAbsence ?? true,
          notifyParentOnLate: settings.notifyParentOnLate ?? false,
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: (values: SettingsFormValues) =>
      updateSettings({
        data: {
          ...values,
          chronicAbsenceThresholdPercent: String(values.chronicAbsenceThresholdPercent),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-settings'] })
      toast.success(t('settings.saved'))
    },
    onError: () => {
      toast.error(t('settings.saveFailed'))
    },
  })

  const onSubmit = (values: SettingsFormValues) => {
    mutation.mutate(values)
  }

  if (isLoading) {
    return <SettingsSkeleton />
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.schoolLife'), href: '/app/school-life' },
          { label: t('schoolLife.settings') },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t('schoolLife.settings')}</h1>
        <p className="text-muted-foreground">{t('settings.attendanceDescription')}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.teacherAttendance')}</CardTitle>
              <CardDescription>{t('settings.teacherAttendanceDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="teacherExpectedArrival"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.expectedArrival')}</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="w-[150px]" />
                    </FormControl>
                    <FormDescription>{t('settings.expectedArrivalDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teacherLateThresholdMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.lateThreshold')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="w-[100px]" />
                    </FormControl>
                    <FormDescription>{t('settings.lateThresholdDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teacherLatenessAlertCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.alertThreshold')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="w-[100px]" />
                    </FormControl>
                    <FormDescription>{t('settings.alertThresholdDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('settings.studentAttendance')}</CardTitle>
              <CardDescription>{t('settings.studentAttendanceDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="studentLateThresholdMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.studentLateThreshold')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="w-[100px]" />
                    </FormControl>
                    <FormDescription>{t('settings.studentLateThresholdDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chronicAbsenceThresholdPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.chronicAbsenceThreshold')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="w-[100px]" />
                    </FormControl>
                    <FormDescription>{t('settings.chronicAbsenceThresholdDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('settings.notifications')}</CardTitle>
              <CardDescription>{t('settings.notificationsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notifyParentOnAbsence"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div>
                      <FormLabel>{t('settings.notifyOnAbsence')}</FormLabel>
                      <FormDescription>{t('settings.notifyOnAbsenceDescription')}</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notifyParentOnLate"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div>
                      <FormLabel>{t('settings.notifyOnLate')}</FormLabel>
                      <FormDescription>{t('settings.notifyOnLateDescription')}</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-96 mb-6" />
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}
