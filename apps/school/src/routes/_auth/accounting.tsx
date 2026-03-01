import { IconPlus } from '@tabler/icons-react'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { PageHeader } from '@workspace/ui/components/page-header'
import { useState } from 'react'
import { PaymentFormDialog } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/accounting')({
  component: AccountingLayout,
})

function AccountingLayout() {
  const t = useTranslations()
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs items={[{ label: t.nav.finance() }]} />

      <PageHeader
        title={t.nav.finance()}
        description={t.finance.title()}
      >
        <Button onClick={() => setShowPaymentDialog(true)} className="rounded-xl">
          <IconPlus className="mr-2 h-4 w-4" />
          Nouveau Paiement
        </Button>
      </PageHeader>

      <Outlet />

      <PaymentFormDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
      />
    </div>
  )
}
