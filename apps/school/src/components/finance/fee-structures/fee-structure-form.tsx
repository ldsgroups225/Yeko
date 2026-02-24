import type { UseFormReturn } from 'react-hook-form'
import type { FeeStructureFormData } from './fee-structure-schema'
import { IconLoader2 } from '@tabler/icons-react'
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
import { useTranslation } from 'react-i18next'

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

  const selectedFeeType = feeTypeList.find(
    (ft: { id: string }) => ft.id === form.watch('feeTypeId'),
  )

  const selectedGrade = gradesList.find(
    (g: { id: string }) => g.id === form.watch('gradeId'),
  )

  const selectedSeries = seriesList.find(
    (s: { id: string }) => s.id === form.watch('seriesId'),
  )

  return (
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

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl border-border/40"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="rounded-xl shadow-lg shadow-primary/20"
          >
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
