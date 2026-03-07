import type { UseFormReturn } from 'react-hook-form'
import type { ConductRecordFormData } from './conduct-record-schema'
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUsers,
} from '@tabler/icons-react'
import { DatePicker } from '@workspace/ui/components/date-picker'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'

interface ConductRecordIncidentFieldsProps {
  form: UseFormReturn<ConductRecordFormData>
  compact?: boolean
  hideDate?: boolean
}

export function ConductRecordIncidentFields({
  form,
  compact = false,
  hideDate = false,
}: ConductRecordIncidentFieldsProps) {
  const t = useTranslations()

  return (
    <>
      {!hideDate && (
        <div className={`grid gap-5 ${compact ? 'md:grid-cols-1' : 'md:grid-cols-3'}`}>
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

          {!compact && (
            <>
              <div className="space-y-2">
                <Label className="ml-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <IconClock className="size-3.5" />
                  {t.conduct.form.incidentTime()}
                </Label>
                <Input
                  id="incidentTime"
                  type="time"
                  {...form.register('incidentTime')}
                  className="h-11 rounded-xl border-slate-200 bg-white transition-[border-color,box-shadow] focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="space-y-2">
                <Label className="ml-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <IconMapPin className="size-3.5" />
                  {t.conduct.form.location()}
                </Label>
                <Input
                  id="location"
                  {...form.register('location')}
                  className="h-11 rounded-xl border-slate-200 bg-white transition-[border-color,box-shadow] focus:ring-2 focus:ring-orange-100"
                  placeholder={t.conduct.form.location()}
                />
              </div>
            </>
          )}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <Label className="ml-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
          <IconUsers className="size-3.5" />
          {t.conduct.form.witnesses()}
        </Label>
        <Input
          id="witnesses"
          {...form.register('witnesses')}
          className="h-11 rounded-xl border-slate-200 bg-white transition-[border-color,box-shadow] focus:ring-2 focus:ring-orange-100"
          placeholder={t.conduct.form.witnessesPlaceholder()}
        />
      </motion.div>
    </>
  )
}
