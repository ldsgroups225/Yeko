/* eslint-disable max-lines */
import type { UseFormReturn } from 'react-hook-form'
import type { FeeStructureFormData } from './fee-structure-schema'
import { IconInfoCircle, IconLoader2 } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { DatePicker } from '@workspace/ui/components/date-picker'
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
import { useTranslation } from 'react-i18next'
import { useSeriesForGrade } from '@/hooks/use-series-for-grade'

interface FeeStructureFormProps {
  form: UseFormReturn<FeeStructureFormData>
  onSubmit: (data: FeeStructureFormData) => void
  onCancel: () => void
  isPending: boolean
  feeTypeList: any[]
  gradesList: any[]
  seriesList: any[]
}

export function FeeStructureForm({
  form,
  onSubmit,
  onCancel,
  isPending,
  feeTypeList,
  gradesList,
  seriesList,
}: FeeStructureFormProps) {
  const { t } = useTranslation()

  const selectedGradeId = form.watch('gradeId')
  const { series: filteredSeries, hasSeries, isLoading: isSeriesLoading } = useSeriesForGrade(
    selectedGradeId === 'all' ? null : selectedGradeId,
  )

  // Use all series if 'all grades' is selected, otherwise use filtered ones
  const effectiveSeries = selectedGradeId === 'all' ? seriesList : filteredSeries

  const selectedSeriesId = form.watch('seriesId')

  // Auto-reset seriesId when gradeId changes and the current series is not in the new list
  useEffect(() => {
    // Skip when all grades is selected.
    if (selectedGradeId === 'all')
      return

    // Wait for grade-series query to settle before validating/resetting.
    if (isSeriesLoading)
      return

    // If grade selected has no series, set to all/null
    if (!hasSeries) {
      form.setValue('seriesId', 'all')
    }
    // If current series is not in filtered list, reset to all
    else if (selectedSeriesId && selectedSeriesId !== 'all' && !filteredSeries.find(s => s.id === selectedSeriesId)) {
      form.setValue('seriesId', 'all')
    }
  }, [selectedGradeId, filteredSeries, hasSeries, isSeriesLoading, form, selectedSeriesId])

  const selectedFeeType = feeTypeList.find(
    (ft: { id: string }) => ft.id === form.watch('feeTypeId'),
  )

  const selectedGrade = gradesList.find(
    (g: { id: string }) => g.id === form.watch('gradeId'),
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="feeTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="
                text-muted-foreground text-xs font-bold tracking-wider uppercase
              "
              >
                {t('finance.feeStructures.feeType')}
                {' '}
                *
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="
                    border-border/40 bg-muted/20
                    focus:bg-background
                    rounded-xl transition-colors
                  "
                  >
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
                <SelectContent className="
                  bg-popover/95 border-border/40 rounded-xl shadow-xl
                  backdrop-blur-xl
                "
                >
                  {feeTypeList?.map(ft => (
                    <SelectItem
                      key={ft.id}
                      value={ft.id}
                      className="
                        focus:bg-primary/10
                        cursor-pointer rounded-lg
                      "
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
                <FormLabel className="
                  text-muted-foreground text-xs font-bold tracking-wider
                  uppercase
                "
                >
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
                    <SelectTrigger className="
                      border-border/40 bg-muted/20
                      focus:bg-background
                      rounded-xl transition-colors
                    "
                    >
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
                <FormLabel className="
                  text-muted-foreground text-xs font-bold tracking-wider
                  uppercase
                "
                >
                  {t('finance.feeStructures.series')}
                  {' '}
                  (
                  {t('common.optional')}
                  )
                </FormLabel>

                {selectedGradeId !== 'all' && !isSeriesLoading && !hasSeries
                  ? (
                      <div className="border-border/40 text-muted-foreground flex items-center gap-2 rounded-xl border bg-muted/10 px-3 py-2 text-sm italic">
                        <IconInfoCircle className="h-4 w-4 shrink-0" />
                        {t('classes.noSeriesForGrade') || 'Aucune série pour ce niveau'}
                      </div>
                    )
                  : (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? 'all'}
                        disabled={isSeriesLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="
                        border-border/40 bg-muted/20
                        focus:bg-background
                        rounded-xl transition-colors
                      "
                          >
                            <SelectValue placeholder={t('finance.feeStructures.allSeries')}>
                              {field.value === 'all'
                                ? t('finance.feeStructures.allSeries')
                                : effectiveSeries?.find((s: any) => s.id === field.value)?.name}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl backdrop-blur-xl">
                          <SelectItem value="all">{t('finance.feeStructures.allSeries')}</SelectItem>
                          {effectiveSeries?.map((s: { id: string, name: string }) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
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
              <FormLabel className="
                text-muted-foreground text-xs font-bold tracking-wider uppercase
              "
              >
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
                  className="
                    border-border/40 bg-muted/20
                    focus:bg-background
                    rounded-xl transition-colors
                  "
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
              <FormLabel className="
                text-muted-foreground text-xs font-bold tracking-wider uppercase
              "
              >
                {t('finance.feeStructures.newStudentAmount')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="0.00"
                  value={field.value ?? ''}
                  className="
                    border-border/40 bg-muted/20
                    focus:bg-background
                    rounded-xl transition-colors
                  "
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
              <FormLabel className="
                text-muted-foreground text-xs font-bold tracking-wider uppercase
              "
              >
                {t('finance.feeStructures.effectiveDate')}
              </FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value ? new Date(field.value) : undefined}
                  onSelect={(date: Date | undefined) => field.onChange(date ? (date.toISOString().split('T')[0] ?? '') : null)}
                  placeholder={t('finance.feeStructures.effectiveDate')}
                  className="
                    border-border/40 bg-muted/20
                    focus:bg-background
                    rounded-xl transition-colors
                  "
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-border/40 rounded-xl"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="shadow-primary/20 rounded-xl shadow-lg"
          >
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
