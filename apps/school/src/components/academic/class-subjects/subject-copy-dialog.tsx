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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { classSubjectsKeys } from '@/lib/queries/class-subjects'
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
  const { t } = useTranslation()
  const { schoolYearId } = useSchoolYearContext()
  const queryClient = useQueryClient()

  // Fetch available classes to copy from
  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes', 'list', schoolYearId],
    queryFn: () => getClasses({ data: { schoolYearId: schoolYearId! } }),
    enabled: !!schoolYearId && open,
  })

  // Filter out the current class from source options
  const sourceClasses
    = classesData?.data?.filter((c: any) => c.id !== targetClassId) || []

  const form = useForm({
    resolver: zodResolver(copyFormSchema),
    defaultValues: {
      sourceClassId: '',
      overwrite: false,
    },
  })

  const copyMutation = useMutation({
    mutationFn: (values: CopyFormValues) =>
      copyClassSubjects({
        data: {
          sourceClassId: values.sourceClassId,
          targetClassId,
          overwrite: values.overwrite,
        },
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: classSubjectsKeys.list({ classId: targetClassId }),
      })
      toast.success(
        t('academic.classes.copySubjectsSuccess', { count: data.count }),
      )
      onOpenChange(false)
      form.reset()
    },
    onError: () => {
      toast.error(t('academic.classes.copySubjectsError'))
    },
  })

  function onSubmit(values: z.infer<typeof copyFormSchema>) {
    copyMutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('academic.classes.copySubjectsTitle')}</DialogTitle>
          <DialogDescription>
            {t('academic.classes.copySubjectsDescription')}
            {' '}
            {targetClassName}
            .
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sourceClassId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('academic.classes.sourceClass')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger disabled={isLoadingClasses}>
                        <SelectValue
                          placeholder={t(
                            'academic.classes.selectSourceClass',
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sourceClasses.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.grade?.name}
                          {' '}
                          {cls.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t('academic.classes.sourceClassDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="overwrite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t('academic.classes.overwriteExisting')}
                    </FormLabel>
                    <FormDescription>
                      {t('academic.classes.overwriteDescription')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={copyMutation.isPending}>
                {copyMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('academic.classes.copySubjects')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
