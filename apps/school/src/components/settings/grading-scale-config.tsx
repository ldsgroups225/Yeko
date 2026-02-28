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
      <div className="
        bg-muted/10 border-border/40 space-y-3 rounded-2xl border p-4
      "
      >
        <Label
          htmlFor="passingGrade"
          className="text-foreground text-sm font-semibold"
        >
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
            className={`
              w-32 font-mono text-lg font-bold
              ${inputClass}
            `}
          />
          <p className="
            text-muted-foreground/80 max-w-[200px] text-xs leading-snug
          "
          >
            {t.settings.profile.passingGradeHint()}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <Label className="
          text-muted-foreground text-xs font-bold tracking-wider uppercase
        "
        >
          {t.settings.profile.gradingThresholds()}
        </Label>

        <div className="space-y-3">
          {gradeCategories.map(({ key, color, shadow }) => (
            <div
              key={key}
              className="
                bg-muted/10 border-border/40
                hover:bg-muted/20
                group flex flex-col gap-4 rounded-2xl border p-3
                transition-colors
                sm:flex-row sm:items-center
              "
            >
              <div className="flex min-w-[140px] items-center gap-3">
                <div className={`
                  h-3 w-3 rounded-full
                  ${color}
                  shadow-lg
                  ${shadow}
                `}
                />
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
                  className="
                    focus:bg-background/50
                    hover:bg-background/30
                    h-9 rounded-lg border-transparent bg-transparent px-2
                    font-medium transition-colors
                  "
                />
              </div>

              <div className="flex flex-1 items-center gap-2">
                <div className="
                  bg-background/40 border-border/20
                  group-hover:bg-background/60
                  flex items-center gap-2 rounded-xl border p-1.5
                  transition-colors
                "
                >
                  <span className="text-muted-foreground pl-2 font-mono text-xs">Min</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="20"
                    {...form.register(`${key}.min`)}
                    className="
                      focus:bg-background
                      h-8 w-20 rounded-lg border-transparent bg-transparent
                      text-center font-mono font-medium
                    "
                  />
                </div>
                <span className="text-muted-foreground/50 font-light">to</span>
                <div className="
                  bg-background/40 border-border/20
                  group-hover:bg-background/60
                  flex items-center gap-2 rounded-xl border p-1.5
                  transition-colors
                "
                >
                  <span className="text-muted-foreground pl-2 font-mono text-xs">Max</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="20"
                    {...form.register(`${key}.max`)}
                    className="
                      focus:bg-background
                      h-8 w-20 rounded-lg border-transparent bg-transparent
                      text-center font-mono font-medium
                    "
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="shadow-primary/20 rounded-xl px-8 shadow-lg"
        >
          {isSubmitting ? t.common.saving() : t.common.save()}
        </Button>
      </div>
    </form>
  )
}
