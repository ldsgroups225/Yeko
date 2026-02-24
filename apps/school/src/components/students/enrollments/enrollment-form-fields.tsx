import type { UseFormReturn } from 'react-hook-form'
import { DatePicker } from '@workspace/ui/components/date-picker'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { useTranslations } from '@/i18n'

interface EnrollmentFormFieldsProps {
  form: UseFormReturn<any>
  schoolYears: any[]
  classes: any[]
  isPendingClasses: boolean
  selectedYearId: string
}

export function EnrollmentFormFields({ form, schoolYears, classes, isPendingClasses, selectedYearId }: EnrollmentFormFieldsProps) {
  const t = useTranslations()

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="schoolYearId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t.students.schoolYear()}
              {' '}
              <span className="text-destructive">*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t.students.selectSchoolYear()}>
                    {field.value
                      ? (() => {
                          const year = schoolYears.find(y => y.id === field.value)
                          return year
                            ? (
                                <div className="flex items-center gap-2">
                                  <span>{year.template.name}</span>
                                  {year.isActive && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t.common.active()}</span>}
                                </div>
                              )
                            : undefined
                        })()
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {schoolYears?.map(year => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.template.name}
                    {year.isActive && ` (${t.common.active()})`}
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
        name="classId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t.students.class()}
              {' '}
              <span className="text-destructive">*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedYearId}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t.students.selectClass()}>
                    {field.value
                      ? (() => {
                          const cls = classes?.find(c => c.class.id === field.value)
                          return cls
                            ? (
                                <div className="flex items-center gap-2">
                                  <span>
                                    {cls.grade?.name}
                                    {' '}
                                    {cls.class.section}
                                  </span>
                                  {cls.series?.name && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{cls.series.name}</span>}
                                </div>
                              )
                            : undefined
                        })()
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {classes?.map(cls => (
                  <SelectItem key={cls.class.id} value={cls.class.id}>
                    {cls.grade?.name}
                    {' '}
                    {cls.class.section}
                    {cls.series?.name && ` (${cls.series.name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              {!selectedYearId && t.students.selectSchoolYearFirst()}
              {selectedYearId && isPendingClasses && t.common.loading()}
              {selectedYearId && !isPendingClasses && (!classes || classes.length === 0) && t.students.noClassesForYear()}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="enrollmentDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t.students.enrollmentDate()}
              {' '}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <DatePicker
                captionLayout="dropdown"
                date={field.value ? new Date(field.value) : undefined}
                onSelect={(date: Date | undefined) => field.onChange(date ? (date.toISOString().split('T')[0] ?? '') : '')}
                placeholder={t.students.enrollmentDate()}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="rollNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t.students.rollNumber()}</FormLabel>
            <FormControl>
              <Input type="number" {...field} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} value={field.value || ''} />
            </FormControl>
            <FormDescription>{t.students.rollNumberDescription()}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
