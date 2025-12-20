import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { PaymentPlansTable } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from '@/i18n'
import { paymentPlansOptions } from '@/lib/queries'

export const Route = createFileRoute('/_auth/accounting/payment-plans')({
  component: PaymentPlansPage,
})

function PaymentPlansPage() {
  const t = useTranslations()

  const { data: paymentPlans, isLoading } = useQuery(paymentPlansOptions.list())

  const paymentPlansList = (paymentPlans ?? []).map((p: { id: string, totalAmount: string | null, paidAmount: string | null, status: string | null, studentId: string }) => ({
    id: p.id,
    studentName: p.studentId,
    matricule: '',
    totalAmount: Number(p.totalAmount ?? 0),
    paidAmount: Number(p.paidAmount ?? 0),
    installmentsCount: 0,
    paidInstallments: 0,
    status: p.status ?? 'active',
  }))

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.nav.finance(), href: '/accounting' },
          { label: t.finance.paymentPlans.title() },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t.finance.paymentPlans.title()}
        </h1>
        <p className="text-muted-foreground">
          {t.finance.paymentPlans.description()}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.finance.paymentPlans.title()}</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentPlansTable
            paymentPlans={paymentPlansList}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
