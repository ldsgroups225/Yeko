import { IconDownload, IconPlus } from '@tabler/icons-react'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { PageHeader } from '@workspace/ui/components/page-header'
import { useState } from 'react'
import { toast } from 'sonner'
import { PaymentFormDialog } from '@/components/finance/payment-form-dialog'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { getPaymentsList } from '@/school/functions/payments'

export const Route = createFileRoute('/_auth/accounting')({
  component: AccountingLayout,
})

function AccountingLayout() {
  const t = useTranslations()
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs items={[{ label: t.nav.finance() }]} />

      <PageHeader
        title={t.nav.finance()}
        description={t.finance.title()}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={isExporting}
            onClick={async () => {
              try {
                setIsExporting(true)
                const toastId = toast.loading(t.common.exporting())
                const res = await getPaymentsList({ data: { pageSize: 10000 } })

                if (!res.success) {
                  toast.error(t.common.error(), { id: toastId })
                  return
                }

                const dataForExport = res.data.data.map(p => ({
                  receiptNumber: p.receiptNumber ?? 'N/A',
                  studentName: p.studentName ?? 'N/A',
                  studentMatricule: p.studentMatricule ?? 'N/A',
                  amount: Number(p.amount),
                  method: p.method === 'cash' ? t.finance.cash() : p.method === 'bank_transfer' ? t.finance.transfer() : p.method === 'mobile_money' ? t.finance.mobile() : p.method === 'check' ? 'Chèque' : p.method === 'card' ? t.finance.card() : 'Autre',
                  status: p.status === 'completed' ? t.finance.payments.status.completed() : p.status === 'refunded' ? t.finance.payments.status.refunded() : p.status === 'cancelled' ? t.finance.payments.status.cancelled() : t.finance.payments.status.pending(),
                  date: new Date(p.paymentDate).toLocaleDateString(),
                  createdAt: new Date(p.createdAt).toLocaleDateString(),
                  notes: p.notes ?? '',
                }))

                const translations = {
                  receiptNumber: t.finance.receipt(),
                  studentName: 'Élève',
                  studentMatricule: t.students.matricule(),
                  amount: t.finance.amount(),
                  method: t.finance.method(),
                  status: 'Statut',
                  date: 'Date de paiement',
                  createdAt: 'Date d\'enregistrement',
                  notes: t.finance.description(),
                  sheetName: t.finance.payments.title(),
                }

                const { exportPaymentsToExcel, downloadExcelFile } = await import('@/lib/excel-export')
                const buffer = await exportPaymentsToExcel(dataForExport, translations)

                downloadExcelFile(buffer, `Paiements_${new Date().toISOString().split('T')[0]}.xlsx`)
                toast.success(t.common.success(), { id: toastId })
              }
              catch (error) {
                console.error('Export error:', error)
                toast.error(t.common.error())
              }
              finally {
                setIsExporting(false)
              }
            }}
          >
            <IconDownload className="mr-2 h-4 w-4" />
            {t.common.export()}
          </Button>
          <Button onClick={() => setShowPaymentDialog(true)} className="rounded-xl">
            <IconPlus className="mr-2 h-4 w-4" />
            Nouveau Paiement
          </Button>
        </div>
      </PageHeader>

      <Outlet />

      <PaymentFormDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
      />
    </div>
  )
}
