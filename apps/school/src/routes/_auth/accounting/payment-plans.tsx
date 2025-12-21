import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { CalendarClock } from 'lucide-react'
import { motion } from 'motion/react'
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
    studentName: p.studentId, // Placeholder until backend returns actual name
    matricule: '',
    totalAmount: Number(p.totalAmount ?? 0),
    paidAmount: Number(p.paidAmount ?? 0),
    installmentsCount: 0,
    paidInstallments: 0,
    status: p.status ?? 'active',
  }))

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.finance(), href: '/accounting' },
          { label: t.finance.paymentPlans.title() },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
          <CalendarClock className="size-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.finance.paymentPlans.title()}</h1>
          <p className="text-sm font-medium text-muted-foreground italic max-w-lg">{t.finance.paymentPlans.description()}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden shadow-sm">
          <CardHeader className="border-b border-border/40 bg-muted/5">
            <CardTitle className="text-lg font-bold">{t.finance.paymentPlans.title()}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <PaymentPlansTable
              paymentPlans={paymentPlansList}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
