import { zodResolver } from '@hookform/resolvers/zod'
import { IconAlertCircle, IconCheck, IconCopy, IconLoader2 } from '@tabler/icons-react'
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

  const { data: classesData, isPending: isPendingClasses } = useQuery({
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
      <DialogContent className="
        bg-card/95 border-border/40 overflow-hidden p-0 backdrop-blur-xl
        sm:max-w-md
      "
      >
        <div className="border-border/10 border-b p-6 pb-4">
          <DialogHeader>
            <div className="mb-1 flex items-center gap-3">
              <div className="
                bg-primary/10 flex h-10 w-10 items-center justify-center
                rounded-xl
              "
              >
                <IconCopy className="text-primary h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{t.academic.classes.copySubjectsTitle()}</DialogTitle>
                <DialogDescription className="
                  text-xs font-semibold tracking-wider uppercase opacity-70
                "
                >
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
            className="space-y-6 p-6"
          >
            <FormField
              control={form.control}
              name="sourceClassId"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="
                    text-muted-foreground flex items-center gap-2 text-[10px]
                    font-bold tracking-[0.1em] uppercase
                  "
                  >
                    <IconCopy className="h-3 w-3" />
                    {t.academic.classes.sourceClass()}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        disabled={isPendingClasses}
                        className="
                          border-border/10
                          focus:ring-primary/40
                          h-11 bg-white/5
                        "
                      >
                        <SelectValue
                          placeholder={t.academic.classes.selectSourceClassError()}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="
                      bg-card/95 border-border/10 backdrop-blur-xl
                    "
                    >
                      {sourceClasses.map(cls => (
                        <SelectItem key={cls.class.id} value={cls.class.id}>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">
                              {cls.grade.name}
                              {' '}
                              {cls.class.section}
                            </span>
                            <span className="
                              text-muted-foreground text-[10px] uppercase
                            "
                            >
                              {cls.series?.name || ''}
                            </span>
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
                <FormItem className="
                  border-border/5 flex flex-row items-center justify-between
                  rounded-xl border bg-white/5 p-4 transition-colors
                  hover:bg-white/10
                "
                >
                  <div className="space-y-1">
                    <FormLabel className="
                      flex items-center gap-2 text-sm font-bold
                    "
                    >
                      <IconAlertCircle className="text-accent h-3.5 w-3.5" />
                      {t.academic.classes.overwriteExisting()}
                    </FormLabel>
                    <FormDescription className="
                      max-w-[200px] text-[11px] leading-relaxed
                    "
                    >
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
              <DialogFooter className="
                gap-3
                sm:gap-0
              "
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="
                    flex-1
                    hover:bg-white/10
                    sm:flex-none
                  "
                >
                  {t.common.cancel()}
                </Button>
                <Button
                  type="submit"
                  disabled={copyMutation.isPending}
                  className="
                    bg-primary
                    hover:bg-primary/90
                    shadow-primary/20 flex-1 shadow-lg
                    sm:min-w-[140px]
                  "
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
