import type { UseFormReturn } from 'react-hook-form'
import type { ConductRecordFormData } from './conduct-record-schema'
import {
  IconAlertCircle,
  IconTag,
  IconUsers,
} from '@tabler/icons-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Textarea } from '@workspace/ui/components/textarea'
import { motion } from 'motion/react'
import { StudentCombobox } from '@/components/attendance/student/student-combobox'
import { useTranslations } from '@/i18n'
import { ConductRecordIncidentFields } from './conduct-record-incident-fields'
import {
  conductCategories,

  conductTypes,
  severityLevels,
} from './conduct-record-schema'

interface ConductRecordFormInnerProps {
  form: UseFormReturn<ConductRecordFormData>
  initialStudentId?: string
  onSubmit: (data: ConductRecordFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function ConductRecordFormInner({
  form,
  initialStudentId,
  onSubmit,
  onCancel,
  isSubmitting,
}: ConductRecordFormInnerProps) {
  const t = useTranslations()
  const watchType = form.watch('type')
  const showSeverity = watchType === 'incident' || watchType === 'sanction'

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {!initialStudentId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <Label className="
            text-muted-foreground/60 ml-1 flex items-center gap-2 text-[10px]
            font-black tracking-[0.2em] uppercase
          "
          >
            <IconUsers className="size-3.5" />
            {t.conduct.student()}
          </Label>
          <StudentCombobox
            value={form.watch('studentId')}
            onSelect={id => form.setValue('studentId', id)}
          />
          {form.formState.errors.studentId && (
            <p className="
              text-destructive ml-1 text-[10px] font-black tracking-widest
              uppercase
            "
            >
              {form.formState.errors.studentId.message}
            </p>
          )}
        </motion.div>
      )}

      <div className="
        grid gap-6
        md:grid-cols-2
      "
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          <Label className="
            text-muted-foreground/60 ml-1 flex items-center gap-2 text-[10px]
            font-black tracking-[0.2em] uppercase
          "
          >
            <IconTag className="size-3.5" />
            {t.conduct.form.type()}
          </Label>
          <Select
            value={form.watch('type')}
            onValueChange={v =>
              form.setValue('type', v as (typeof conductTypes)[number])}
          >
            <SelectTrigger className="
              bg-card/50 border-border/40
              focus:ring-primary/20
              h-12 rounded-2xl backdrop-blur-xl transition-all
            "
            >
              <SelectValue placeholder={t.conduct.form.type()}>
                {form.watch('type') && (
                  <span className="
                    text-[10px] font-bold tracking-widest uppercase
                  "
                  >
                    {t.conduct.type[form.watch('type') as (typeof conductTypes)[number]]()}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="
              bg-popover/90 border-border/40 rounded-2xl backdrop-blur-2xl
            "
            >
              {conductTypes.map(type => (
                <SelectItem
                  key={type}
                  value={type}
                  className="
                    rounded-xl py-3 text-[10px] font-bold tracking-widest
                    uppercase
                  "
                >
                  {t.conduct.type[type]()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          <Label className="
            text-muted-foreground/60 ml-1 flex items-center gap-2 text-[10px]
            font-black tracking-[0.2em] uppercase
          "
          >
            <IconTag className="size-3.5" />
            {t.conduct.form.category()}
          </Label>
          <Select
            value={form.watch('category')}
            onValueChange={v =>
              form.setValue('category', v as (typeof conductCategories)[number])}
          >
            <SelectTrigger className="
              bg-card/50 border-border/40
              focus:ring-primary/20
              h-12 rounded-2xl backdrop-blur-xl transition-all
            "
            >
              <SelectValue placeholder={t.conduct.form.category()}>
                {form.watch('category') && (
                  <span className="
                    text-[10px] font-bold tracking-widest uppercase
                  "
                  >
                    {t.conduct.category[form.watch('category') as (typeof conductCategories)[number]]()}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="
              bg-popover/90 border-border/40 max-h-[300px] overflow-y-auto
              rounded-2xl backdrop-blur-2xl
            "
            >
              {conductCategories.map(cat => (
                <SelectItem
                  key={cat}
                  value={cat}
                  className="
                    rounded-xl py-3 text-[10px] font-bold tracking-widest
                    uppercase
                  "
                >
                  {t.conduct.category[cat]()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <Label className="
          text-muted-foreground/60 ml-1 flex items-center gap-2 text-[10px]
          font-black tracking-[0.2em] uppercase
        "
        >
          <IconTag className="size-3.5" />
          {t.conduct.form.title()}
        </Label>
        <Input
          id="title"
          {...form.register('title')}
          className="
            bg-card/50 border-border/40
            focus:ring-primary/20
            h-12 rounded-2xl font-bold backdrop-blur-xl transition-all
          "
          placeholder={t.conduct.form.title()}
        />
        {form.formState.errors.title && (
          <p className="
            text-destructive ml-1 text-[10px] font-black tracking-widest
            uppercase
          "
          >
            {form.formState.errors.title.message}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <Label className="
          text-muted-foreground/60 ml-1 flex items-center gap-2 text-[10px]
          font-black tracking-[0.2em] uppercase
        "
        >
          <IconTag className="size-3.5" />
          {t.conduct.form.description()}
        </Label>
        <Textarea
          id="description"
          {...form.register('description')}
          className="
            bg-card/50 border-border/40
            focus:ring-primary/20
            min-h-[120px] rounded-2xl font-medium italic backdrop-blur-xl
            transition-all
          "
          placeholder={t.conduct.form.description()}
        />
        {form.formState.errors.description && (
          <p className="
            text-destructive ml-1 text-[10px] font-black tracking-widest
            uppercase
          "
          >
            {form.formState.errors.description.message}
          </p>
        )}
      </motion.div>

      {showSeverity && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3 overflow-hidden"
        >
          <Label className="
            text-muted-foreground/60 ml-1 flex items-center gap-2 text-[10px]
            font-black tracking-[0.2em] uppercase
          "
          >
            <IconAlertCircle className="size-3.5" />
            {t.conduct.form.severity()}
          </Label>
          <Select
            value={form.watch('severity') ?? ''}
            onValueChange={v =>
              form.setValue('severity', v as (typeof severityLevels)[number])}
          >
            <SelectTrigger className="
              bg-card/50 border-border/40
              focus:ring-primary/20
              text-destructive h-12 rounded-2xl font-black backdrop-blur-xl
              transition-all
            "
            >
              <SelectValue placeholder={t.conduct.form.selectSeverity()}>
                {form.watch('severity') && (() => {
                  const severityConfig = {
                    low: { color: 'bg-secondary', label: t.conduct.severity.low(), icon: '🔵' },
                    medium: { color: 'bg-accent', label: t.conduct.severity.medium(), icon: '🟡' },
                    high: { color: 'bg-accent', label: t.conduct.severity.high(), icon: '🟠' },
                    critical: { color: 'bg-destructive', label: t.conduct.severity.critical(), icon: '🔴' },
                  }
                  const config = severityConfig[form.watch('severity') as keyof typeof severityConfig]
                  return (
                    <div className="flex items-center gap-2">
                      <div className={`
                        h-2 w-2 rounded-full
                        ${config.color}
                      `}
                      />
                      <span>
                        {config.icon}
                        {' '}
                        {config.label}
                      </span>
                    </div>
                  )
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="
              bg-popover/90 border-border/40 rounded-2xl backdrop-blur-2xl
            "
            >
              {severityLevels.map(level => (
                <SelectItem
                  key={level}
                  value={level}
                  className="
                    text-destructive rounded-xl py-3 text-[10px] font-bold
                    tracking-widest uppercase
                  "
                >
                  {t.conduct.severity[level]()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      )}

      <ConductRecordIncidentFields form={form} />

      <div className="border-border/10 flex justify-end gap-3 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="
            border-border/40
            hover:bg-muted/50
            h-12 rounded-2xl px-8 text-[10px] font-black tracking-widest
            uppercase transition-all
          "
        >
          {t.common.cancel()}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="
            bg-primary shadow-primary/20 h-12 rounded-2xl px-10 text-[10px]
            font-black tracking-widest uppercase shadow-xl transition-all
            hover:scale-105
            active:scale-95
          "
        >
          {isSubmitting ? t.common.saving() : t.common.save()}
        </Button>
      </div>
    </form>
  )
}
