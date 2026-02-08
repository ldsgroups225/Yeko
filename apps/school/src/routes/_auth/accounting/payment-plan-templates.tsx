import {
  IconFileText,
  IconPlus,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { PaymentPlanTemplatesTable } from '@/components/finance/payment-plan-templates-table'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { paymentPlanTemplatesOptions } from '@/lib/queries/payment-plan-templates'

export const Route = createFileRoute('/_auth/accounting/payment-plan-templates')({
  component: PaymentPlanTemplatesPage,
})

function PaymentPlanTemplatesPage() {
  const t = useTranslations()
  const { schoolYearId, isPending: contextPending } = useSchoolYearContext()

  const { data: templates, isPending } = useQuery({
    ...paymentPlanTemplatesOptions(schoolYearId ?? ''),
    enabled: !!schoolYearId,
  })

  if (contextPending || isPending) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <IconFileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t.finance.paymentPlanTemplates.title()}
              </h1>
              <p className="text-muted-foreground">
                {t.finance.paymentPlanTemplates.description()}
              </p>
            </div>
          </div>

          <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
            <IconPlus className="h-4 w-4" />
            {t.common.create()}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
        <PaymentPlanTemplatesTable
          templates={(templates ?? []).map(t => ({ ...t, isDefault: t.isDefault ?? false, status: t.status ?? 'active' }))}
        />
      </div>
    </div>
  )
}
