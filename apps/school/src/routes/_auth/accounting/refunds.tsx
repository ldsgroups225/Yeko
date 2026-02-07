import { IconRotate } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { RefundsTable } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { refundsKeys, refundsOptions } from '@/lib/queries'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { approveExistingRefund, rejectExistingRefund } from '@/school/functions/refunds'

export const Route = createFileRoute('/_auth/accounting/refunds')({
  component: RefundsPage,
})

function RefundsPage() {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const { data: refunds, isPending } = useQuery(refundsOptions.list())

  const approveMutation = useMutation({
    mutationKey: schoolMutationKeys.refunds.approve,
    mutationFn: (id: string) => approveExistingRefund({ data: { refundId: id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: refundsKeys.all })
      toast.success(t.finance.refunds.approved())
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const rejectMutation = useMutation({
    mutationKey: schoolMutationKeys.refunds.reject,
    mutationFn: (id: string) => rejectExistingRefund({ data: { refundId: id, rejectionReason: 'Rejected by admin' } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: refundsKeys.all })
      toast.success(t.finance.refunds.rejected())
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
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.finance(), href: '/accounting' },
          { label: t.finance.refunds.title() },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
          <IconRotate className="size-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.finance.refunds.title()}</h1>
          <p className="text-sm font-medium text-muted-foreground italic max-w-lg">{t.finance.refunds.description()}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden shadow-sm">
          <CardHeader className="border-b border-border/40 bg-muted/5">
            <CardTitle className="text-lg font-bold">{t.finance.refunds.title()}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <RefundsTable
              refunds={refundsList}
              isPending={isPending}
              onApprove={id => approveMutation.mutate(id)}
              onReject={id => rejectMutation.mutate(id)}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
