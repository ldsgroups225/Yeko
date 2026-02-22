import { IconCalendarStats, IconLayoutDashboard, IconReceipt2, IconReportMoney } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'
import { TabbedLayout } from '@/components/layout/tabbed-layout'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/accounting')({
  component: AccountingLayout,
})

function AccountingLayout() {
  const t = useTranslations()

  const tabs = [
    {
      label: t.finance.dashboard.title(),
      href: '/accounting/dashboard',
      icon: IconLayoutDashboard,
      permission: { resource: 'finance', action: 'view' },
    },
    {
      label: t.finance.payments.title(),
      href: '/accounting/payments',
      icon: IconReceipt2,
      permission: { resource: 'finance', action: 'view' },
    },
    {
      label: t.finance.paymentPlans.title(),
      href: '/accounting/payment-plans',
      icon: IconCalendarStats,
      permission: { resource: 'finance', action: 'view' },
    },
    {
      label: t.finance.feeStructures.title(),
      href: '/accounting/fee-structures',
      icon: IconReportMoney,
      permission: { resource: 'finance', action: 'view' },
    },
  ]

  return (
    <TabbedLayout
      title={t.nav.finance()}
      description={t.finance.title()}
      breadcrumbs={[{ label: t.nav.finance() }]}
      tabs={tabs}
    />
  )
}
