import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { RefundsTable } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { refundsKeys, refundsOptions } from '@/lib/queries'
import { approveExistingRefund, rejectExistingRefund } from '@/school/functions/refunds'

export const Route = createFileRoute('/_auth/app/finance/refunds')({
  component: RefundsPage,
})

function RefundsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: refunds, isLoading } = useQuery(refundsOptions.list())

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveExistingRefund({ data: { refundId: id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: refundsKeys.all })
      toast.success(t('finance.refunds.approved'))
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectExistingRefund({ data: { refundId: id, rejectionReason: 'Rejected by admin' } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: refundsKeys.all })
      toast.success(t('finance.refunds.rejected'))
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const refundsList = (refunds?.data ?? []).map((r: { id: string, amount: string | null, reason: string | null, status: string | null, createdAt: Date }) => ({
    id: r.id,
    studentName: 'N/A',
    amount: Number(r.amount ?? 0),
    reason: r.reason ?? '',
    status: r.status ?? 'pending',
    requestedAt: r.createdAt?.toISOString() ?? new Date().toISOString(),
  }))

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.finance'), href: '/app/finance' },
          { label: t('finance.refunds.title') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('finance.refunds.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('finance.refunds.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('finance.refunds.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <RefundsTable
            refunds={refundsList}
            isLoading={isLoading}
            onApprove={id => approveMutation.mutate(id)}
            onReject={id => rejectMutation.mutate(id)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
