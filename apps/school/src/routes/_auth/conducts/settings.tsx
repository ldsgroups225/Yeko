import { zodResolver } from '@hookform/resolvers/zod'
import { IconBell, IconDeviceFloppy, IconSchool, IconSettings, IconSparkles, IconUserCheck } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Checkbox } from '@workspace/ui/components/checkbox'
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
import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { getSettings, updateSettings } from '@/school/functions/attendance-settings'

export const Route = createFileRoute('/_auth/conducts/settings')({
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
  const t = useTranslations()
  const queryClient = useQueryClient()

  const { data: result, isPending } = useQuery({
    queryKey: ['attendance-settings'],
    queryFn: () => getSettings(),
  })

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as never,
    defaultValues: {
      teacherExpectedArrival: '07:30',
      teacherLateThresholdMinutes: 15,
      teacherLatenessAlertCount: 3,
      studentLateThresholdMinutes: 10,
      chronicAbsenceThresholdPercent: 10,
      notifyParentOnAbsence: true,
      notifyParentOnLate: false,
    },
  })

  // Update form values when settings data loads
  React.useEffect(() => {
    if (result?.success) {
      const settings = result.data
      form.reset({
        teacherExpectedArrival: settings.teacherExpectedArrival ?? '07:30',
        teacherLateThresholdMinutes: settings.teacherLateThresholdMinutes ?? 15,
        teacherLatenessAlertCount: settings.teacherLatenessAlertCount ?? 3,
        studentLateThresholdMinutes: settings.studentLateThresholdMinutes ?? 10,
        chronicAbsenceThresholdPercent: Number(settings.chronicAbsenceThresholdPercent) || 10,
        notifyParentOnAbsence: settings.notifyParentOnAbsence ?? true,
        notifyParentOnLate: settings.notifyParentOnLate ?? false,
      })
    }
  }, [result, form])

  const mutation = useMutation({
    mutationKey: schoolMutationKeys.conductSettings.update,
    mutationFn: (values: SettingsFormValues) =>
      updateSettings({
        data: {
          ...values,
          chronicAbsenceThresholdPercent: String(values.chronicAbsenceThresholdPercent),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-settings'] })
      toast.success(t.settings.saved(), {
        className: 'rounded-2xl backdrop-blur-xl bg-background/80 border-border/40 font-bold',
      })
    },
    onError: () => {
      toast.error(t.settings.saveFailed())
    },
  })

  const onSubmit = (values: SettingsFormValues) => {
    mutation.mutate(values)
  }

  if (isPending) {
    return <SettingsSkeleton />
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.schoolLife(), href: '/conducts' },
          { label: t.schoolLife.settings() },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
          <IconSettings className="size-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.schoolLife.settings()}</h1>
          <p className="text-sm font-medium text-muted-foreground italic max-w-md">{t.settings.attendanceDescription()}</p>
        </div>
      </motion.div>

      <Form {...form}>
        <motion.form
          variants={container}
          initial="hidden"
          animate="show"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <motion.div variants={item}>
            <Card className="relative overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <IconUserCheck className="size-32" />
              </div>
              <CardHeader className="relative border-b border-border/10 bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  <IconUserCheck className="h-3 w-3" />
                  {t.settings.teacherAttendance()}
                </CardTitle>
                <CardDescription className="italic font-medium">{t.settings.teacherAttendanceDescription()}</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="teacherExpectedArrival"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.settings.expectedArrival()}</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} className="h-12 rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold" />
                        </FormControl>
                        <FormDescription className="text-[10px] italic">{t.settings.expectedArrivalDescription()}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="teacherLateThresholdMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.settings.lateThreshold()}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="h-12 rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold" />
                        </FormControl>
                        <FormDescription className="text-[10px] italic">{t.settings.lateThresholdDescription()}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="teacherLatenessAlertCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.settings.alertThreshold()}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="h-12 rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold" />
                      </FormControl>
                      <FormDescription className="text-[10px] italic">{t.settings.alertThresholdDescription()}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="relative overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <IconSchool className="size-32" />
              </div>
              <CardHeader className="relative border-b border-border/10 bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  <IconSchool className="h-3 w-3" />
                  {t.settings.studentAttendance()}
                </CardTitle>
                <CardDescription className="italic font-medium">{t.settings.studentAttendanceDescription()}</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="studentLateThresholdMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.settings.studentLateThreshold()}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="h-12 rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold" />
                        </FormControl>
                        <FormDescription className="text-[10px] italic">{t.settings.studentLateThresholdDescription()}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chronicAbsenceThresholdPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.settings.chronicAbsenceThreshold()}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="h-12 rounded-2xl bg-background/50 border-border/40 focus:ring-primary/20 transition-all font-bold" />
                        </FormControl>
                        <FormDescription className="text-[10px] italic">{t.settings.chronicAbsenceThresholdDescription()}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="relative overflow-hidden rounded-3xl border-border/40 bg-card/30 backdrop-blur-xl shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <IconBell className="size-32" />
              </div>
              <CardHeader className="relative border-b border-border/10 bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  <IconBell className="h-3 w-3" />
                  {t.settings.notifications()}
                </CardTitle>
                <CardDescription className="italic font-medium">{t.settings.notificationsDescription()}</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <FormField
                  control={form.control}
                  name="notifyParentOnAbsence"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/10">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} className="size-5 rounded-lg border-border/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                      </FormControl>
                      <div>
                        <FormLabel className="font-black uppercase tracking-widest text-[10px]">{t.settings.notifyOnAbsence()}</FormLabel>
                        <FormDescription className="text-[10px] italic">{t.settings.notifyOnAbsenceDescription()}</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notifyParentOnLate"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/10">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} className="size-5 rounded-lg border-border/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                      </FormControl>
                      <div>
                        <FormLabel className="font-black uppercase tracking-widest text-[10px]">{t.settings.notifyOnLate()}</FormLabel>
                        <FormDescription className="text-[10px] italic">{t.settings.notifyOnLateDescription()}</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item} className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl transition-all"
            >
              {mutation.isPending
                ? (
                    <>
                      <IconSparkles className="mr-2 size-4 animate-spin" />
                      {t.common.saving()}
                    </>
                  )
                : (
                    <>
                      <IconDeviceFloppy className="mr-2 size-4 font-black" />
                      {t.common.save()}
                    </>
                  )}
            </Button>
          </motion.div>
        </motion.form>
      </Form>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-8 p-1">
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <div className="space-y-8">
        <Skeleton className="h-[300px] w-full rounded-3xl" />
        <Skeleton className="h-[200px] w-full rounded-3xl" />
      </div>
    </div>
  )
}
