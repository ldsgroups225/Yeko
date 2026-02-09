import type { AcademicSettings, GradingScale, SchoolSettings } from '@/schemas/school-profile'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTranslations } from '@/i18n'
import {
  defaultGradingScale,
} from '@/schemas/school-profile'

const formSchema = z.object({
  passingGrade: z.coerce.number().min(0).max(20),
  excellent: z.object({
    min: z.coerce.number().min(0).max(20),
    max: z.coerce.number().min(0).max(20),
    label: z.string().min(1),
  }),
  good: z.object({
    min: z.coerce.number().min(0).max(20),
    max: z.coerce.number().min(0).max(20),
    label: z.string().min(1),
  }),
  average: z.object({
    min: z.coerce.number().min(0).max(20),
    max: z.coerce.number().min(0).max(20),
    label: z.string().min(1),
  }),
  fail: z.object({
    min: z.coerce.number().min(0).max(20),
    max: z.coerce.number().min(0).max(20),
    label: z.string().min(1),
  }),
})

type FormData = z.infer<typeof formSchema>

interface GradingScaleConfigProps {
  gradingScale?: GradingScale
  academic?: AcademicSettings
  onUpdate: (data: Partial<SchoolSettings>) => void
  isSubmitting: boolean
}

export function GradingScaleConfig({
  gradingScale = defaultGradingScale,
  academic,
  onUpdate,
  isSubmitting,
}: GradingScaleConfigProps) {
  const t = useTranslations()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passingGrade: academic?.passingGrade ?? 10,
      excellent: gradingScale.excellent,
      good: gradingScale.good,
      average: gradingScale.average,
      fail: gradingScale.fail,
    },
  })

  const handleSubmit = (data: FormData) => {
    onUpdate({
      gradingScale: {
        excellent: data.excellent,
        good: data.good,
        average: data.average,
        fail: data.fail,
      },
      academic: {
        ...academic,
        passingGrade: data.passingGrade,
        maxAbsences: academic?.maxAbsences ?? 10,
        termWeights: academic?.termWeights ?? { term1: 1, term2: 1, term3: 1 },
      },
    })
  }

  const gradeCategories = [
    { key: 'excellent' as const, color: 'bg-green-500', shadow: 'shadow-green-500/20' },
    { key: 'good' as const, color: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
    { key: 'average' as const, color: 'bg-accent', shadow: 'shadow-accent/20' },
    { key: 'fail' as const, color: 'bg-red-500', shadow: 'shadow-red-500/20' },
  ]

  const inputClass = 'rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors'

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
      <div className="space-y-3 p-4 rounded-2xl bg-muted/10 border border-border/40">
        <Label htmlFor="passingGrade" className="text-sm font-semibold text-foreground">
          {t.settings.profile.passingGrade()}
        </Label>
        <div className="flex items-center gap-4">
          <Input
            id="passingGrade"
            type="number"
            step="0.5"
            min="0"
            max="20"
            {...form.register('passingGrade')}
            className={`w-32 font-mono text-lg font-bold ${inputClass}`}
          />
          <p className="text-xs text-muted-foreground/80 max-w-[200px] leading-snug">
            {t.settings.profile.passingGradeHint()}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">{t.settings.profile.gradingThresholds()}</Label>

        <div className="space-y-3">
          {gradeCategories.map(({ key, color, shadow }) => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 rounded-2xl bg-muted/10 border border-border/40 hover:bg-muted/20 transition-colors group">
              <div className="flex items-center gap-3 min-w-[140px]">
                <div className={`h-3 w-3 rounded-full ${color} shadow-lg ${shadow}`} />
                <Input
                  {...form.register(`${key}.label`)}
                  placeholder={
                    {
                      excellent: t.settings.profile.gradeLabels.excellent,
                      good: t.settings.profile.gradeLabels.good,
                      average: t.settings.profile.gradeLabels.average,
                      fail: t.settings.profile.gradeLabels.fail,
                    }[key]()
                  }
                  className="h-9 border-transparent bg-transparent font-medium focus:bg-background/50 hover:bg-background/30 transition-colors px-2 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2 bg-background/40 p-1.5 rounded-xl border border-border/20 group-hover:bg-background/60 transition-colors">
                  <span className="text-xs font-mono text-muted-foreground pl-2">Min</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="20"
                    {...form.register(`${key}.min`)}
                    className="w-20 h-8 border-transparent bg-transparent text-center font-mono font-medium focus:bg-background rounded-lg"
                  />
                </div>
                <span className="text-muted-foreground/50 font-light">to</span>
                <div className="flex items-center gap-2 bg-background/40 p-1.5 rounded-xl border border-border/20 group-hover:bg-background/60 transition-colors">
                  <span className="text-xs font-mono text-muted-foreground pl-2">Max</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="20"
                    {...form.register(`${key}.max`)}
                    className="w-20 h-8 border-transparent bg-transparent text-center font-mono font-medium focus:bg-background rounded-lg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting} className="rounded-xl shadow-lg shadow-primary/20 px-8">
          {isSubmitting ? t.common.saving() : t.common.save()}
        </Button>
      </div>
    </form>
  )
}
