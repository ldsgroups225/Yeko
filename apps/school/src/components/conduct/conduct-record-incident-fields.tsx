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
      <div className="
        grid gap-6
        md:grid-cols-3
      "
      >
        <div className="space-y-3">
          <Label className="
            text-muted-foreground/60 ml-1 flex items-center gap-2 text-[10px]
            font-black tracking-[0.2em] uppercase
          "
          >
            <IconCalendar className="size-3.5" />
            {t.conduct.form.incidentDate()}
          </Label>
          <DatePicker
            date={form.watch('incidentDate')}
            onSelect={d => form.setValue('incidentDate', d)}
            className="
              bg-card/50 border-border/40
              hover:bg-card/70
              h-12 rounded-2xl backdrop-blur-xl transition-all
            "
          />
        </div>

        <div className="space-y-3">
          <Label className="
            text-muted-foreground/60 ml-1 flex items-center gap-2 text-[10px]
            font-black tracking-[0.2em] uppercase
          "
          >
            <IconClock className="size-3.5" />
            {t.conduct.form.incidentTime()}
          </Label>
          <Input
            id="incidentTime"
            type="time"
            {...form.register('incidentTime')}
            className="
              bg-card/50 border-border/40
              focus:ring-primary/20
              h-12 rounded-2xl backdrop-blur-xl transition-all
            "
          />
        </div>

        <div className="space-y-3">
          <Label className="
            text-muted-foreground/60 ml-1 flex items-center gap-2 text-[10px]
            font-black tracking-[0.2em] uppercase
          "
          >
            <IconMapPin className="size-3.5" />
            {t.conduct.form.location()}
          </Label>
          <Input
            id="location"
            {...form.register('location')}
            className="
              bg-card/50 border-border/40
              focus:ring-primary/20
              h-12 rounded-2xl backdrop-blur-xl transition-all
            "
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
        <Label className="
          text-muted-foreground/60 ml-1 flex items-center gap-2 text-[10px]
          font-black tracking-[0.2em] uppercase
        "
        >
          <IconUsers className="size-3.5" />
          {t.conduct.form.witnesses()}
        </Label>
        <Input
          id="witnesses"
          {...form.register('witnesses')}
          className="
            bg-card/50 border-border/40
            focus:ring-primary/20
            h-12 rounded-2xl backdrop-blur-xl transition-all
          "
          placeholder={t.conduct.form.witnessesPlaceholder()}
        />
      </motion.div>
    </>
  )
}
