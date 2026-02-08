import { IconCalendar, IconCircleCheck } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from '@/i18n'
import { schoolYearsOptions } from '@/lib/queries/school-years'

export function WizardStep0() {
  const t = useTranslations()
  const { data: schoolYears } = useSuspenseQuery(schoolYearsOptions())
  const activeYear = schoolYears?.find(y => y.isActive)

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <IconCalendar className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold">{t.finance.wizard.steps.step0ActiveYear()}</h4>
          {activeYear
            ? (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <IconCircleCheck className="h-4 w-4" />
                  <span>
                    {t.finance.wizard.steps.step0YearActive({ name: activeYear.template?.name ?? '' })}
                  </span>
                </div>
              )
            : (
                <p className="text-destructive font-medium">
                  {t.finance.wizard.steps.step0NoActiveYear()}
                </p>
              )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground leading-relaxed">
        {t.finance.wizard.steps.step0Explanation()}
      </div>
    </div>
  )
}
