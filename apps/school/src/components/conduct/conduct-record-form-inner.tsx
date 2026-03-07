import type { UseFormReturn } from 'react-hook-form'
import type { ConductRecordFormData } from './conduct-record-schema'
import { IconAlertCircle, IconCalendar, IconTag, IconUsers } from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { DatePicker } from '@workspace/ui/components/date-picker'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Textarea } from '@workspace/ui/components/textarea'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { StudentCombobox } from '@/components/attendance/student/student-combobox'
import { useLocale, useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'
import { getConductIncidentPresets } from './conduct-incident-presets'
import { ConductRecordIncidentFields } from './conduct-record-incident-fields'
import { conductCategories, conductTypes, severityLevels } from './conduct-record-schema'

interface ConductRecordFormInnerProps {
  form: UseFormReturn<ConductRecordFormData>
  initialStudentId?: string
  onSubmit: (data: ConductRecordFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
  stickyFooter?: boolean
}

export function ConductRecordFormInner({
  form,
  initialStudentId,
  onSubmit,
  onCancel,
  isSubmitting,
  stickyFooter = false,
}: ConductRecordFormInnerProps) {
  const t = useTranslations()
  const locale = useLocale()
  const watchType = form.watch('type')
  const watchPresetId = form.watch('incidentPresetId')
  const showSeverity = watchType === 'incident' || watchType === 'sanction'
  const incidentPresets = getConductIncidentPresets(locale.locale)
  const selectedPreset = incidentPresets.find(preset => preset.id === watchPresetId) ?? null
  const primaryFieldsClassName = showSeverity ? 'grid gap-5 md:grid-cols-3' : 'grid gap-5 md:grid-cols-2'
  const submitDisabled = isSubmitting || form.formState.isSubmitting

  useEffect(() => {
    if (watchType !== 'incident') {
      form.setValue('incidentPresetId', undefined)
      return
    }

    if (!watchPresetId) {
      form.setValue('incidentPresetId', incidentPresets[0]?.id)
      return
    }

    if (!selectedPreset)
      return

    form.setValue('category', selectedPreset.category)
    form.setValue('severity', selectedPreset.severity)
    form.setValue('title', selectedPreset.label)
  }, [form, incidentPresets, selectedPreset, watchPresetId, watchType])

  const handleValidSubmit = (data: ConductRecordFormData) => {
    const nextData: ConductRecordFormData = {
      ...data,
      studentId: data.studentId || initialStudentId || '',
    }

    if (watchType === 'incident' && selectedPreset) {
      nextData.type = 'incident'
      nextData.incidentPresetId = selectedPreset.id
      nextData.category = selectedPreset.category
      nextData.severity = selectedPreset.severity
      nextData.title = selectedPreset.label
    }

    onSubmit(nextData)
  }

  const handleInvalidSubmit = (errors: typeof form.formState.errors) => {
    const [firstEntry] = Object.entries(errors)
    const [fieldName, fieldError] = firstEntry ?? []

    const fieldLabel = fieldName === 'studentId'
      ? t.conduct.student()
      : fieldName === 'description'
        ? 'Description detaillee'
        : fieldName === 'incidentDate'
          ? t.conduct.form.incidentDate()
          : fieldName === 'title'
            ? watchType === 'incident' ? 'Type d\'incident' : t.conduct.form.title()
            : fieldName === 'category' || fieldName === 'severity'
              ? 'Type d\'incident'
              : fieldName === 'witnesses'
                ? t.conduct.form.witnesses()
                : 'Formulaire'

    toast.error(`${fieldLabel} requis ou invalide.`)
    if (fieldError?.message) {
      console.error('Conduct form validation error:', fieldName, fieldError.message)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleValidSubmit, handleInvalidSubmit)} className="space-y-6">
      {!initialStudentId && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <Label className="ml-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
            <IconUsers className="size-3.5" />
            {t.conduct.student()}
          </Label>
          <StudentCombobox value={form.watch('studentId')} onSelect={id => form.setValue('studentId', id)} />
          {form.formState.errors.studentId && (
            <p className="text-destructive ml-1 text-xs font-medium">
              {form.formState.errors.studentId.message}
            </p>
          )}
        </motion.div>
      )}

      {watchType === 'incident' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="ml-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
                <IconAlertCircle className="size-3.5" />
                Type d'incident
              </Label>
              <Select value={watchPresetId ?? ''} onValueChange={value => form.setValue('incidentPresetId', value ?? undefined)}>
                <SelectTrigger className="border-slate-200 bg-white focus:ring-2 focus:ring-orange-100 h-11 rounded-xl transition-[border-color,box-shadow]">
                  <SelectValue placeholder="Sélectionner un incident">
                    {selectedPreset && (
                      <span className="text-sm font-medium text-slate-800">
                        {`${selectedPreset.label} ${selectedPreset.penaltyLabel}`}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-slate-200 bg-white shadow-lg">
                  {incidentPresets.map(preset => (
                    <SelectItem key={preset.id} value={preset.id} className="rounded-lg py-2.5 text-sm font-medium text-slate-800">
                      {`${preset.label} ${preset.penaltyLabel}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="ml-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
                <IconCalendar className="size-3.5" />
                {t.conduct.form.incidentDate()}
              </Label>
              <DatePicker
                date={form.watch('incidentDate')}
                onSelect={d => form.setValue('incidentDate', d)}
                className="h-11 rounded-xl border-slate-200 bg-white transition-[border-color,box-shadow] hover:bg-white focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {selectedPreset && (
            <div className="space-y-3 rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    {selectedPreset.domainLabel}
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{selectedPreset.description}</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-orange-600 shadow-sm">
                  {selectedPreset.penaltyLabel}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {watchType !== 'incident' && (
        <div className={primaryFieldsClassName}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
            <Label className="ml-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
              <IconTag className="size-3.5" />
              {t.conduct.form.type()}
            </Label>
            <Select value={form.watch('type')} onValueChange={v => form.setValue('type', v as (typeof conductTypes)[number])}>
              <SelectTrigger className="border-slate-200 bg-white focus:ring-2 focus:ring-orange-100 h-11 rounded-xl transition-[border-color,box-shadow]">
                <SelectValue placeholder={t.conduct.form.type()}>
                  {form.watch('type') && (
                    <span className="text-xs font-semibold tracking-[0.08em] uppercase text-slate-800">
                      {t.conduct.type[form.watch('type') as (typeof conductTypes)[number]]()}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-slate-200 bg-white shadow-lg">
                {conductTypes.map(type => (
                  <SelectItem key={type} value={type} className="rounded-lg py-2.5 text-xs font-semibold tracking-[0.08em] uppercase">
                    {t.conduct.type[type]()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
            <Label className="ml-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
              <IconTag className="size-3.5" />
              {t.conduct.form.category()}
            </Label>
            <Select value={form.watch('category')} onValueChange={v => form.setValue('category', v as (typeof conductCategories)[number])}>
              <SelectTrigger className="border-slate-200 bg-white focus:ring-2 focus:ring-orange-100 h-11 rounded-xl transition-[border-color,box-shadow]">
                <SelectValue placeholder={t.conduct.form.category()}>
                  {form.watch('category') && (
                    <span className="text-xs font-semibold tracking-[0.08em] uppercase text-slate-800">
                      {t.conduct.category[form.watch('category') as (typeof conductCategories)[number]]()}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                {conductCategories.map(cat => (
                  <SelectItem key={cat} value={cat} className="rounded-lg py-2.5 text-xs font-semibold tracking-[0.08em] uppercase">
                    {t.conduct.category[cat]()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {showSeverity && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 overflow-hidden">
              <Label className="ml-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
                <IconAlertCircle className="size-3.5" />
                {t.conduct.form.severity()}
              </Label>
              <Select value={form.watch('severity') ?? ''} onValueChange={v => form.setValue('severity', v as (typeof severityLevels)[number])}>
                <SelectTrigger className="border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-orange-100 h-11 rounded-xl font-semibold transition-[border-color,box-shadow]">
                  <SelectValue placeholder={t.conduct.form.selectSeverity()}>
                    {form.watch('severity') && (
                      <span className="text-sm font-semibold text-slate-800">
                        {t.conduct.severity[form.watch('severity') as (typeof severityLevels)[number]]()}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-slate-200 bg-white shadow-lg">
                  {severityLevels.map(level => (
                    <SelectItem key={level} value={level} className="rounded-lg py-2.5 text-xs font-semibold tracking-[0.08em] uppercase">
                      {t.conduct.severity[level]()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
        <Label className="ml-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
          <IconTag className="size-3.5" />
          Description détaillée
        </Label>
        <Textarea
          id="description"
          {...form.register('description')}
          className="min-h-[112px] rounded-xl border-slate-200 bg-white font-medium text-slate-900 transition-[border-color,box-shadow] focus:ring-2 focus:ring-orange-100"
          placeholder="Décrivez l'incident en détail, avec les faits constatés et les éventuels témoins."
        />
        {form.formState.errors.description && (
          <p className="text-destructive ml-1 text-xs font-medium">
            {form.formState.errors.description.message}
          </p>
        )}
      </motion.div>

      <ConductRecordIncidentFields form={form} compact={watchType === 'incident'} hideDate={watchType === 'incident'} />

      <div
        className={cn(
          'flex justify-end gap-3 border-t border-slate-100 pt-4',
          stickyFooter && 'sticky bottom-0 z-10 -mx-2 bg-white px-2 pb-1 pt-4',
        )}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitDisabled}
          className="h-11 rounded-xl border-slate-200 px-6 text-xs font-semibold tracking-[0.08em] uppercase text-slate-700 transition-[border-color,background-color,color] hover:bg-slate-50"
        >
          {t.common.cancel()}
        </Button>
        <button
          type="submit"
          disabled={submitDisabled}
          className="h-11 rounded-xl bg-orange-500 px-7 text-xs font-semibold tracking-[0.08em] uppercase text-white transition-[background-color,box-shadow,transform] hover:bg-orange-600 active:scale-[0.99]"
        >
          {submitDisabled ? t.common.saving() : t.common.save()}
        </button>
      </div>
    </form>
  )
}
