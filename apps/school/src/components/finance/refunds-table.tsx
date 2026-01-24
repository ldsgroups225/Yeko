import { IconCheck, IconRotate, IconX } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from '@/i18n'
import { generateUUID } from '@/utils/generateUUID'

interface Refund {
  id: string
  studentName: string
  amount: number
  reason: string
  status: string
  requestedAt: string
}

interface RefundsTableProps {
  refunds: Refund[]
  isLoading?: boolean
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'approved':
      return 'default'
    case 'pending':
      return 'outline'
    case 'rejected':
      return 'destructive'
    case 'processed':
      return 'secondary'
    default:
      return 'outline'
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function RefundsTable({
  refunds,
  isLoading,
  onApprove,
  onReject,
}: RefundsTableProps) {
  const t = useTranslations()

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map(() => (
          <Skeleton key={generateUUID()} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (refunds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border-2 border-dashed border-border/30 rounded-xl bg-card/10 m-4">
        <div className="p-4 rounded-full bg-muted/20 mb-4">
          <IconRotate className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-medium">{t.finance.refunds.noRefunds()}</p>
        <p className="text-sm max-w-sm mt-1 text-muted-foreground/70">
          {t.finance.refunds.description()}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="font-semibold">
                {t.students.student()}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {t.finance.amount()}
              </TableHead>
              <TableHead className="font-semibold">
                {t.finance.refunds.reason()}
              </TableHead>
              <TableHead className="font-semibold">{t.common.date()}</TableHead>
              <TableHead className="font-semibold">
                {t.common.status()}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {t.common.actions()}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {refunds.map((refund, index) => (
                <motion.tr
                  key={refund.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-muted/30 border-border/40 transition-colors"
                >
                  <TableCell className="font-bold text-foreground">
                    {refund.studentName}
                  </TableCell>
                  <TableCell className="text-right font-bold tabular-nums">
                    {formatCurrency(refund.amount)}
                    {' '}
                    <span className="text-xs text-muted-foreground ml-1">
                      FCFA
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate font-medium text-muted-foreground">
                    {refund.reason}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-medium">
                    {formatDate(refund.requestedAt)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(refund.status)}
                      className="capitalize rounded-md"
                    >
                      {{
                        pending: t.finance.refunds.status.pending,
                        approved: t.finance.refunds.status.approved,
                        rejected: t.finance.refunds.status.rejected,
                        processed: t.finance.refunds.status.processed,
                      }[
                        refund.status as
                        | 'pending'
                        | 'approved'
                        | 'rejected'
                        | 'processed'
                      ]()}
                    </Badge>
                  </TableCell>
                  {' '}
                  <TableCell className="text-right">
                    {refund.status === 'pending' && (
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-500/10 rounded-lg"
                          onClick={() => onApprove?.(refund.id)}
                          aria-label={t.finance.refunds.approve()}
                        >
                          <IconCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-500/10 rounded-lg"
                          onClick={() => onReject?.(refund.id)}
                          aria-label={t.finance.refunds.reject()}
                        >
                          <IconX className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-4 p-4">
        <AnimatePresence>
          {refunds.map((refund, index) => (
            <motion.div
              key={refund.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-md space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">{refund.studentName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(refund.requestedAt)}
                  </div>
                </div>
                <Badge
                  variant={getStatusVariant(refund.status)}
                  className="capitalize rounded-md"
                >
                  {{
                    pending: t.finance.refunds.status.pending,
                    approved: t.finance.refunds.status.approved,
                    rejected: t.finance.refunds.status.rejected,
                    processed: t.finance.refunds.status.processed,
                  }[
                    refund.status as
                    | 'pending'
                    | 'approved'
                    | 'rejected'
                    | 'processed'
                  ]()}
                </Badge>
              </div>

              <div className="p-3 rounded-xl bg-muted/20 border border-border/20">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {t.finance.amount()}
                </div>
                <div className="font-bold text-lg">
                  {formatCurrency(refund.amount)}
                  {' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    FCFA
                  </span>
                </div>
              </div>

              {refund.reason && (
                <div className="text-sm text-muted-foreground italic bg-muted/10 p-3 rounded-lg border border-border/20">
                  &quot;
                  {refund.reason}
                  &quot;
                </div>
              )}

              {refund.status === 'pending' && (
                <div className="flex gap-2 pt-2 border-t border-border/30">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400 dark:hover:bg-green-900/20"
                    onClick={() => onApprove?.(refund.id)}
                  >
                    <IconCheck className="mr-2 h-4 w-4" />
                    {t.finance.refunds.approve()}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl border-red-200 text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20"
                    onClick={() => onReject?.(refund.id)}
                  >
                    <IconX className="mr-2 h-4 w-4" />
                    {t.finance.refunds.reject()}
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
