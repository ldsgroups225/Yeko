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
      <div className="
        bg-primary/5 border-primary/20 flex items-start gap-4 rounded-2xl border
        p-6
      "
      >
        <div className="bg-primary/10 rounded-xl p-3">
          <IconCalendar className="text-primary h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold">{t.finance.wizard.steps.step0ActiveYear()}</h4>
          {activeYear
            ? (
                <div className="
                  flex items-center gap-2 font-medium text-green-600
                "
                >
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

      <div className="text-muted-foreground text-sm leading-relaxed">
        {t.finance.wizard.steps.step0Explanation()}
      </div>
    </div>
  )
}
