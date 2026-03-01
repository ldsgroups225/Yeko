import {
  IconArrowRight,
  IconBook,
  IconCalendarStats,
  IconCreditCard,
  IconFileText,
  IconGridDots,
  IconPlus,
  IconReportMoney,
  IconSettings,
  IconTag,
  IconUsers,
} from '@tabler/icons-react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button, buttonVariants } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { useState } from 'react'
import { AccountFormDialog } from '@/components/finance/account-form-dialog'
import { DiscountFormDialog } from '@/components/finance/discount-form-dialog'
import { FeeStructureFormDialog } from '@/components/finance/fee-structure-form-dialog'
import { FeeTypeFormDialog } from '@/components/finance/fee-type-form-dialog'
import { PaymentFormDialog } from '@/components/finance/payment-form-dialog'
import { PaymentPlanTemplateFormDialog } from '@/components/finance/payment-plan-template-form-dialog'

import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_auth/settings/finance/setup')({
  component: FinanceSettingsHubPage,
})

function FinanceSettingsHubPage() {
  const t = useTranslations()
  const navigate = useNavigate()
  const { schoolYearId } = useSchoolYearContext()

  const [createAccountOpen, setCreateAccountOpen] = useState(false)

  const [createFeeTypeOpen, setCreateFeeTypeOpen] = useState(false)
  const [createFeeStructureOpen, setCreateFeeStructureOpen] = useState(false)
  const [createDiscountOpen, setCreateDiscountOpen] = useState(false)
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false)
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false)

  const configModules = [
    {
      key: 'accounts',
      icon: IconBook,
      title: t.finance.accounts.title(),
      description: t.finance.accounts.description(),
      manageHref: '/settings/finance/accounts',
      onCreate: () => setCreateAccountOpen(true),
      createLabel: t.finance.accounts.create(),
    },
    {
      key: 'fiscal-years',
      icon: IconCalendarStats,
      title: t.finance.fiscalYears.title(),
      description: t.finance.fiscalYears.description(),
      manageHref: '/settings/finance/fiscal-years',
      onCreate: () => navigate({ to: '/settings/finance/fiscal-years' }),
      createLabel: t.finance.fiscalYears.create(),
    },
    {
      key: 'fee-types',
      icon: IconTag,
      title: t.finance.feeTypes.title(),
      description: t.finance.feeTypes.description(),
      manageHref: '/settings/finance/fee-types',
      onCreate: () => setCreateFeeTypeOpen(true),
      createLabel: t.finance.feeTypes.create(),
    },
    {
      key: 'fee-structures',
      icon: IconGridDots,
      title: t.finance.feeStructures.title(),
      description: t.finance.feeStructures.description(),
      manageHref: '/settings/finance/fee-structures',
      onCreate: () => setCreateFeeStructureOpen(true),
      createLabel: t.finance.feeStructures.create(),
    },
    {
      key: 'discounts',
      icon: IconReportMoney,
      title: t.finance.discounts.title(),
      description: t.finance.discounts.description(),
      manageHref: '/settings/finance/discounts',
      onCreate: () => setCreateDiscountOpen(true),
      createLabel: t.finance.discounts.create(),
    },
    {
      key: 'payment-plan-templates',
      icon: IconFileText,
      title: t.finance.paymentPlanTemplates.title(),
      description: t.finance.paymentPlanTemplates.description(),
      manageHref: '/settings/finance/payment-plan-templates',
      onCreate: () => setCreateTemplateOpen(true),
      createLabel: t.finance.paymentPlanTemplates.create(),
    },
  ] as const

  const operationalModules = [
    {
      key: 'payments',
      icon: IconCreditCard,
      title: t.finance.payments.title(),
      description: t.finance.payments.description(),
      href: '/accounting/dashboard',
      actionLabel: t.finance.payments.recordPayment(),
      onAction: () => setRecordPaymentOpen(true),
    },
    {
      key: 'payment-plans',
      icon: IconCalendarStats,
      title: t.finance.paymentPlans.title(),
      description: t.finance.paymentPlans.description(),
      href: '/settings/finance/payment-plans',
      actionLabel: t.finance.paymentPlans.create(),
      onAction: () => navigate({ to: '/settings/finance/payment-plans' }),
    },
    {
      key: 'student-fees',
      icon: IconUsers,
      title: t.finance.studentFees.title(),
      description: t.finance.studentFees.description(),
      href: '/settings/finance/student-fees',
      actionLabel: 'Voir les soldes',
      onAction: () => navigate({ to: '/settings/finance/student-fees' }),
    },
  ] as const

  return (
    <div className="space-y-8 p-1">

      <Card className="border-border/40 bg-card/40 rounded-2xl backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconSettings className="text-primary size-5" />
                Configuration
              </CardTitle>
              <CardDescription>
                Gérez les paramètres financiers essentiels depuis un seul écran.
              </CardDescription>
            </div>

            <Link
              to="/accounting/dashboard"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-xl gap-2')}
            >
              <IconCreditCard className="size-4" />
              Espace comptabilité
            </Link>
          </div>
        </CardHeader>
        <CardContent
          className="
            grid grid-cols-1 gap-4
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {configModules.map(module => (
            <Card
              key={module.key}
              className="
                border-border/40 bg-muted/10
                hover:bg-muted/20
                rounded-2xl border transition-colors
              "
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                    <module.icon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold">{module.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Button
                  onClick={module.onCreate}
                  size="sm"
                  className="rounded-xl"
                >
                  <IconPlus className="mr-2 size-4" />
                  {module.createLabel}
                </Button>
                <Link
                  to={module.manageHref}
                  className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'rounded-xl')}
                >
                  Gérer
                  <IconArrowRight className="ml-2 size-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/40 rounded-2xl backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg">Opérations rapides</CardTitle>
          <CardDescription>
            Accès direct aux actions comptables sans navigation complexe.
          </CardDescription>
        </CardHeader>
        <CardContent
          className="
            grid grid-cols-1 gap-4
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {operationalModules.map(module => (
            <div
              key={module.key}
              className="
                border-border/40 bg-muted/10
                rounded-2xl border p-4
              "
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-primary/10 text-primary rounded-xl p-2.5">
                  <module.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold">{module.title}</h3>
                  <p className="text-muted-foreground text-xs">{module.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" className="rounded-xl" onClick={module.onAction}>
                  {module.actionLabel}
                </Button>
                <Link
                  to={module.href}
                  className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'rounded-xl')}
                >
                  Ouvrir
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <AccountFormDialog
        open={createAccountOpen}
        onOpenChange={setCreateAccountOpen}
      />

      <FeeTypeFormDialog
        open={createFeeTypeOpen}
        onOpenChange={setCreateFeeTypeOpen}
      />

      <FeeStructureFormDialog
        open={createFeeStructureOpen}
        onOpenChange={setCreateFeeStructureOpen}
      />

      <DiscountFormDialog
        open={createDiscountOpen}
        onOpenChange={setCreateDiscountOpen}
      />

      {schoolYearId && (
        <PaymentPlanTemplateFormDialog
          open={createTemplateOpen}
          onOpenChange={setCreateTemplateOpen}
          schoolYearId={schoolYearId}
        />
      )}

      <PaymentFormDialog
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
      />
    </div>
  )
}
