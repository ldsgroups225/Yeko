import { zodResolver } from '@hookform/resolvers/zod'
import { IconAlertCircle, IconCheck, IconCopy, IconLoader2, IconSparkles } from '@tabler/icons-react'
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
import { Switch } from '@workspace/ui/components/switch'
import { motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { classSubjectsKeys } from '@/lib/queries/class-subjects'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { copyClassSubjects } from '@/school/functions/class-subjects'
import { getClasses } from '@/school/functions/classes'

const copyFormSchema = z.object({
  sourceClassId: z.string().min(1, 'Select a source class'),
  overwrite: z.boolean(),
})

type CopyFormValues = z.infer<typeof copyFormSchema>

interface SubjectCopyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetClassId: string
  targetClassName: string
}

export function SubjectCopyDialog({
  open,
  onOpenChange,
  targetClassId,
  targetClassName,
}: SubjectCopyDialogProps) {
  const t = useTranslations()
  const { schoolYearId } = useSchoolYearContext()
  const queryClient = useQueryClient()

  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes', 'list', schoolYearId],
    queryFn: () => getClasses({ data: { schoolYearId: schoolYearId! } }),
    enabled: !!schoolYearId && open,
  })

  // Safe unwrapping of Result type
  const classesList = classesData?.success ? classesData.data : []
  const sourceClasses = classesList.filter(c => c.class.id !== targetClassId)

  const form = useForm<CopyFormValues>({
    resolver: zodResolver(copyFormSchema),
    defaultValues: {
      sourceClassId: '',
      overwrite: false,
    },
  })

  const copyMutation = useMutation({
    mutationKey: schoolMutationKeys.classSubjects.copy,
    mutationFn: (values: CopyFormValues) =>
      copyClassSubjects({
        data: {
          sourceClassId: values.sourceClassId,
          targetClassId,
          overwrite: values.overwrite,
        },
      }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error)
        return
      }

      queryClient.invalidateQueries({
        queryKey: classSubjectsKeys.list({ classId: targetClassId }),
      })
      toast.success(
        t.academic.classes.copySubjectsSuccess({ count: result.data.count }),
      )
      onOpenChange(false)
      form.reset()
    },
    onError: () => {
      toast.error(t.academic.classes.copySubjectsError())
    },
  })

  function onSubmit(values: CopyFormValues) {
    copyMutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-card/95 border-border/40 p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b border-border/10">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <IconCopy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{t.academic.classes.copySubjectsTitle()}</DialogTitle>
                <DialogDescription className="text-xs font-semibold opacity-70 uppercase tracking-wider">
                  {targetClassName}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <Form {...form}>
          <motion.form
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 space-y-6"
          >
            <FormField
              control={form.control}
              name="sourceClassId"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                    <IconSparkles className="h-3 w-3" />
                    {t.academic.classes.sourceClass()}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        disabled={isLoadingClasses}
                        className="h-11 bg-white/5 border-white/10 focus:ring-primary/40"
                      >
                        <SelectValue
                          placeholder={t.academic.classes.selectSourceClassError()}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="backdrop-blur-xl bg-card/95 border-white/10">
                      {sourceClasses.map(cls => (
                        <SelectItem key={cls.class.id} value={cls.class.id}>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">
                              {cls.grade.name}
                              {' '}
                              {cls.class.section}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase">{cls.series?.name || ''}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[11px] leading-relaxed">
                    {t.academic.classes.sourceClassDescription()}
                  </FormDescription>
                  <FormMessage className="text-[11px] font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="overwrite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                  <div className="space-y-1">
                    <FormLabel className="text-sm font-bold flex items-center gap-2">
                      <IconAlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      {t.academic.classes.overwriteExisting()}
                    </FormLabel>
                    <FormDescription className="text-[11px] leading-relaxed max-w-[200px]">
                      {t.academic.classes.overwriteDescription()}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-primary"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="pt-2">
              <DialogFooter className="gap-3 sm:gap-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 sm:flex-none hover:bg-white/10"
                >
                  {t.common.cancel()}
                </Button>
                <Button
                  type="submit"
                  disabled={copyMutation.isPending}
                  className="flex-1 sm:min-w-[140px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  {copyMutation.isPending
                    ? (
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      )
                    : (
                        <IconCheck className="mr-2 h-4 w-4" />
                      )}
                  {t.academic.classes.copySubjects()}
                </Button>
              </DialogFooter>
            </div>
          </motion.form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
