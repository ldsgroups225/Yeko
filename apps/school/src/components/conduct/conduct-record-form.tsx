import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const conductTypes = ['incident', 'sanction', 'reward', 'note'] as const
const conductCategories = [
  'behavior',
  'academic',
  'attendance',
  'uniform',
  'property',
  'violence',
  'bullying',
  'cheating',
  'achievement',
  'improvement',
  'other',
] as const
const severityLevels = ['low', 'medium', 'high', 'critical'] as const

const conductRecordFormSchema = z.object({
  studentId: z.string().min(1),
  type: z.enum(conductTypes),
  category: z.enum(conductCategories),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  severity: z.enum(severityLevels).optional(),
  incidentDate: z.date().optional(),
  incidentTime: z.string().optional(),
  location: z.string().optional(),
  witnesses: z.string().optional(),
})

type ConductRecordFormData = z.infer<typeof conductRecordFormSchema>

interface ConductRecordFormProps {
  studentId?: string
  defaultType?: typeof conductTypes[number]
  onSubmit: (data: ConductRecordFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function ConductRecordForm({
  studentId,
  defaultType = 'incident',
  onSubmit,
  onCancel,
  isSubmitting,
}: ConductRecordFormProps) {
  const { t } = useTranslation()

  const form = useForm<ConductRecordFormData>({
    resolver: zodResolver(conductRecordFormSchema),
    defaultValues: {
      studentId: studentId ?? '',
      type: defaultType,
      category: 'behavior',
      title: '',
      description: '',
    },
  })

  const watchType = form.watch('type')
  const showSeverity = watchType === 'incident' || watchType === 'sanction'

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">{t('conduct.form.type')}</Label>
          <Select
            value={form.watch('type')}
            onValueChange={v => form.setValue('type', v as typeof conductTypes[number])}
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {conductTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {t(`conduct.type.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">{t('conduct.form.category')}</Label>
          <Select
            value={form.watch('category')}
            onValueChange={v => form.setValue('category', v as typeof conductCategories[number])}
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {conductCategories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {t(`conduct.category.${cat}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">{t('conduct.form.title')}</Label>
        <Input id="title" {...form.register('title')} />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('conduct.form.description')}</Label>
        <Textarea id="description" {...form.register('description')} rows={4} />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>

      {showSeverity && (
        <div className="space-y-2">
          <Label htmlFor="severity">{t('conduct.form.severity')}</Label>
          <Select
            value={form.watch('severity') ?? ''}
            onValueChange={v => form.setValue('severity', v as typeof severityLevels[number])}
          >
            <SelectTrigger id="severity">
              <SelectValue placeholder={t('conduct.form.selectSeverity')} />
            </SelectTrigger>
            <SelectContent>
              {severityLevels.map(level => (
                <SelectItem key={level} value={level}>
                  {t(`conduct.severity.${level}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>{t('conduct.form.incidentDate')}</Label>
          <DatePicker
            date={form.watch('incidentDate')}
            onSelect={d => form.setValue('incidentDate', d)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="incidentTime">{t('conduct.form.incidentTime')}</Label>
          <Input id="incidentTime" type="time" {...form.register('incidentTime')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">{t('conduct.form.location')}</Label>
          <Input id="location" {...form.register('location')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="witnesses">{t('conduct.form.witnesses')}</Label>
        <Input
          id="witnesses"
          {...form.register('witnesses')}
          placeholder={t('conduct.form.witnessesPlaceholder')}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </form>
  )
}
