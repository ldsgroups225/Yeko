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
}

export function ConductRecordIncidentFields({ form }: ConductRecordIncidentFieldsProps) {
  const t = useTranslations()

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
            <IconCalendar className="size-3.5" />
            {t.conduct.form.incidentDate()}
          </Label>
          <DatePicker
            date={form.watch('incidentDate')}
            onSelect={d => form.setValue('incidentDate', d)}
            className="h-12 rounded-2xl bg-card/50 backdrop-blur-xl border-border/40 hover:bg-card/70 transition-all"
          />
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
            <IconClock className="size-3.5" />
            {t.conduct.form.incidentTime()}
          </Label>
          <Input
            id="incidentTime"
            type="time"
            {...form.register('incidentTime')}
            className="h-12 rounded-2xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
            <IconMapPin className="size-3.5" />
            {t.conduct.form.location()}
          </Label>
          <Input
            id="location"
            {...form.register('location')}
            className="h-12 rounded-2xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all"
            placeholder={t.conduct.form.location()}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
          <IconUsers className="size-3.5" />
          {t.conduct.form.witnesses()}
        </Label>
        <Input
          id="witnesses"
          {...form.register('witnesses')}
          className="h-12 rounded-2xl bg-card/50 backdrop-blur-xl border-border/40 focus:ring-primary/20 transition-all"
          placeholder={t.conduct.form.witnessesPlaceholder()}
        />
      </motion.div>
    </>
  )
}
