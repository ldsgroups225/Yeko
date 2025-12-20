import type { AcademicSettings, GradingScale, SchoolSettings } from '@/schemas/school-profile'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    { key: 'excellent' as const, color: 'bg-green-500' },
    { key: 'good' as const, color: 'bg-blue-500' },
    { key: 'average' as const, color: 'bg-yellow-500' },
    { key: 'fail' as const, color: 'bg-red-500' },
  ]

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="passingGrade">
          {t.settings.profile.passingGrade()}
        </Label>
        <Input
          id="passingGrade"
          type="number"
          step="0.5"
          min="0"
          max="20"
          {...form.register('passingGrade')}
          className="w-24"
        />
        <p className="text-xs text-muted-foreground">
          {t.settings.profile.passingGradeHint()}
        </p>
      </div>

      <div className="space-y-4">
        <Label>{t.settings.profile.gradingThresholds()}</Label>

        {gradeCategories.map(({ key, color }) => (
          <div key={key} className="flex items-center gap-4">
            <div className={`h-4 w-4 rounded ${color}`} />
            <div className="grid flex-1 grid-cols-3 gap-2">
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
              />
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  {...form.register(`${key}.min`)}
                  className="w-20"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  {...form.register(`${key}.max`)}
                  className="w-20"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t.common.saving() : t.common.save()}
        </Button>
      </div>
    </form>
  )
}
