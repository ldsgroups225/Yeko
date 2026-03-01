import { IconPlus } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { motion } from 'motion/react'
import { FinanceSubpageToolbar, PaymentPlansTable } from '@/components/finance'
import { useTranslations } from '@/i18n'
import { paymentPlansOptions } from '@/lib/queries'

export const Route = createFileRoute('/_auth/settings/finance/payment-plans')({
  component: PaymentPlansPage,
})

function PaymentPlansPage() {
  const t = useTranslations()
  const navigate = useNavigate()

  const { data: paymentPlans, isPending } = useQuery(paymentPlansOptions.list())

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
      <FinanceSubpageToolbar
        actions={(
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              onClick={() => navigate({ to: '/settings/finance/payment-plan-templates' })}
              className="gap-2"
            >
              <IconPlus className="size-4" />
              {t.finance.paymentPlans.create()}
            </Button>
          </motion.div>
        )}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="
          border-border/40 bg-card/40 overflow-hidden shadow-sm backdrop-blur-xl
        "
        >
          <CardHeader className="border-border/40 bg-muted/5 border-b">
            <CardTitle className="text-lg font-bold">{t.finance.paymentPlans.title()}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <PaymentPlansTable
              paymentPlans={paymentPlansList}
              isPending={isPending}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
