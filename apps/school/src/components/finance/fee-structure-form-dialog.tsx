import type { FeeStructure } from '@repo/data-ops'
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
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'
import { feeStructuresKeys, feeTypesKeys, feeTypesOptions } from '@/lib/queries'
import { createNewFeeStructure, updateExistingFeeStructure } from '@/school/functions/fee-structures'
import { getGrades } from '@/school/functions/grades'
import { getSeries } from '@/school/functions/series'
import { getSchoolYearContext } from '@/school/middleware/school-context'

export type { FeeStructure }

interface FeeStructureFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<FeeStructure>
}

export function FeeStructureFormDialog({
  open,
  onOpenChange,
  initialData,
}: FeeStructureFormDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const feeStructureFormSchema = z.object({
    feeTypeId: z.string().min(1, t('finance.feeStructures.errors.feeTypeRequired')),
    gradeId: z.string().optional().nullable(),
    seriesId: z.string().optional().nullable(),
    amount: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, t('finance.feeStructures.errors.invalidAmount'))
      .min(1, t('finance.feeStructures.errors.amountRequired')),
    currency: z.string(),
    newStudentAmount: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, t('finance.feeStructures.errors.invalidAmount'))
      .optional()
      .nullable(),
    effectiveDate: z.string().optional().nullable(),
  })

  type FeeStructureFormData = z.infer<typeof feeStructureFormSchema>

  const { data: feeTypes } = useQuery(feeTypesOptions.list())
  const { data: grades } = useQuery({
    queryKey: ['grades', 'list'],
    queryFn: () => getGrades({ data: {} }),
  })
  const { data: series } = useQuery({
    queryKey: ['series', 'list'],
    queryFn: () => getSeries({ data: {} }),
  })

  const feeTypeList = feeTypes || []
  const gradesList = grades?.success ? grades.data : []
  const seriesList = series?.success ? series.data : []

  const form = useForm<FeeStructureFormData>({
    resolver: zodResolver(feeStructureFormSchema),
    defaultValues: {
      feeTypeId: '',
      gradeId: 'all',
      seriesId: 'all',
      amount: '',
      currency: 'XOF',
      newStudentAmount: '',
      effectiveDate: new Date().toISOString().split('T')[0],
    },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          feeTypeId: initialData.feeTypeId || '',
          gradeId: initialData.gradeId || 'all',
          seriesId: initialData.seriesId || 'all',
          amount: String(initialData.amount || ''),
          currency: initialData.currency || 'XOF',
          newStudentAmount: initialData.newStudentAmount
            ? String(initialData.newStudentAmount)
            : '',
          effectiveDate: initialData.effectiveDate || '',
        })
      }
      else {
        form.reset({
          feeTypeId: '',
          gradeId: 'all',
          seriesId: 'all',
          amount: '',
          currency: 'XOF',
          newStudentAmount: '',
          effectiveDate: '',
        })
      }
    }
  }, [open, initialData, form])

  const isEditing = !!initialData

  // Get selected fee type for display
  const selectedFeeType = feeTypeList.find(
    (ft: { id: string }) => ft.id === form.watch('feeTypeId'),
  )

  const selectedGrade = gradesList.find(
    (g: { id: string }) => g.id === form.watch('gradeId'),
  )

  const selectedSeries = seriesList.find(
    (s: { id: string }) => s.id === form.watch('seriesId'),
  )

  const mutation = useMutation({
    mutationFn: async (data: FeeStructureFormData) => {
      const yearContext = await getSchoolYearContext()
      if (!yearContext?.schoolYearId) {
        throw new Error(t('errors.generic'))
      }

      const gradeId = data.gradeId === 'all' ? null : data.gradeId
      const seriesId = data.seriesId === 'all' ? null : data.seriesId

      if (isEditing) {
        return updateExistingFeeStructure({
          data: {
            id: initialData.id!,
            feeTypeId: data.feeTypeId,
            gradeId: gradeId?.trim() || null,
            seriesId: seriesId?.trim() || null,
            amount: data.amount,
            currency: data.currency,
            newStudentAmount:
              data.newStudentAmount && data.newStudentAmount.trim() !== ''
                ? data.newStudentAmount.trim()
                : null,
            effectiveDate: data.effectiveDate || null,
          },
        })
      }

      return createNewFeeStructure({
        data: {
          schoolYearId: yearContext.schoolYearId,
          feeTypeId: data.feeTypeId,
          gradeId: gradeId?.trim() || null,
          seriesId: seriesId?.trim() || null,
          amount: data.amount,
          currency: data.currency,
          newStudentAmount:
            data.newStudentAmount && data.newStudentAmount.trim() !== ''
              ? data.newStudentAmount.trim()
              : null,
          effectiveDate: data.effectiveDate || null,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeTypesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: feeStructuresKeys.lists() })
      toast.success(
        isEditing
          ? t('finance.feeStructures.success.update')
          : t('finance.feeStructures.success.create'),
      )
      form.reset()
      onOpenChange(false)
    },
    onError: (err: { message?: string, p?: { v?: Array<{ s?: { message?: string | { s: string } } }> } }) => {
      console.error('Fee creation error:', err)
      let message = err.message || t('errors.generic')

      try {
        const errorNode = err?.p?.v?.[1]?.s?.message
        const serverError = typeof errorNode === 'string' ? errorNode : errorNode?.s
        if (serverError && typeof serverError === 'string') {
          message = serverError
        }
      }
      catch {
        // Keep original
      }

      if (message.includes('unique_fee_structure')) {
        message = t('finance.feeStructures.errors.duplicate')
      }
      else if (message.includes('foreign key constraint')) {
        message = t('errors.validationError')
      }
      else if (message.includes('Failed query')) {
        message = t('errors.serverError')
      }

      toast.error(message, {
        duration: 5000,
      })
    },
  })

  const onSubmit = (data: FeeStructureFormData) => {
    mutation.mutate(data)
  }

  const isPending = mutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing
              ? t('finance.feeStructures.edit')
              : t('finance.feeStructures.create')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            {isEditing
              ? t('finance.feeStructures.editDescription')
              : t('finance.feeStructures.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="feeTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    {t('finance.feeStructures.feeType')}
                    {' '}
                    *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors">
                        <SelectValue>
                          {selectedFeeType
                            ? (
                                <span className="flex items-center gap-2">
                                  {selectedFeeType.name}
                                  {' '}
                                  (
                                  {selectedFeeType.code}
                                  )
                                </span>
                              )
                            : (
                                <span className="text-muted-foreground">
                                  {t('finance.feeStructures.selectFeeType')}
                                </span>
                              )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl backdrop-blur-xl bg-popover/95 border-border/40 shadow-xl">
                      {feeTypeList?.map(ft => (
                        <SelectItem
                          key={ft.id}
                          value={ft.id}
                          className="rounded-lg cursor-pointer focus:bg-primary/10"
                        >
                          {ft.name}
                          {' '}
                          (
                          {ft.code}
                          )
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gradeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                      {t('finance.feeStructures.grade')}
                      {' '}
                      (
                      {t('common.optional')}
                      )
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? 'all'}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors">
                          <SelectValue placeholder={t('finance.feeStructures.allLevels')}>
                            {field.value === 'all'
                              ? t('finance.feeStructures.allLevels')
                              : selectedGrade?.name}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl backdrop-blur-xl">
                        <SelectItem value="all">
                          {t('finance.feeStructures.allLevels')}
                        </SelectItem>
                        {gradesList?.map(g => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name}
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
                name="seriesId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                      {t('finance.feeStructures.series')}
                      {' '}
                      (
                      {t('common.optional')}
                      )
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? 'all'}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors">
                          <SelectValue placeholder={t('finance.feeStructures.allSeries')}>
                            {field.value === 'all'
                              ? t('finance.feeStructures.allSeries')
                              : selectedSeries?.name}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl backdrop-blur-xl">
                        <SelectItem value="all">{t('finance.feeStructures.allSeries')}</SelectItem>
                        {seriesList.map((s: { id: string, name: string }) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    {t('finance.feeStructures.amount')}
                    {' '}
                    *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="0.00"
                      value={field.value ?? ''}
                      className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newStudentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    {t('finance.feeStructures.newStudentAmount')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="0.00"
                      value={field.value ?? ''}
                      className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="effectiveDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    {t('finance.feeStructures.effectiveDate')}
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value ? new Date(field.value) : undefined}
                      onSelect={(date: Date | undefined) => field.onChange(date ? (date.toISOString().split('T')[0] ?? '') : null)}
                      placeholder={t('finance.feeStructures.effectiveDate')}
                      className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl border-border/40"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl shadow-lg shadow-primary/20"
              >
                {isPending && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
