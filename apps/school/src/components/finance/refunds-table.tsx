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
  isPending?: boolean
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
  isPending,
  onApprove,
  onReject,
}: RefundsTableProps) {
  const t = useTranslations()

  if (isPending) {
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
      <div className="
        text-muted-foreground border-border/30 bg-card/10 m-4 flex flex-col
        items-center justify-center rounded-xl border-2 border-dashed py-16
        text-center
      "
      >
        <div className="bg-muted/20 mb-4 rounded-full p-4">
          <IconRotate className="text-muted-foreground/50 h-8 w-8" />
        </div>
        <p className="text-lg font-medium">{t.finance.refunds.noRefunds()}</p>
        <p className="text-muted-foreground/70 mt-1 max-w-sm text-sm">
          {t.finance.refunds.description()}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="
        hidden
        md:block
      "
      >
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="
              border-border/40
              hover:bg-transparent
            "
            >
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
                  className="
                    group
                    hover:bg-muted/30
                    border-border/40 transition-colors
                  "
                >
                  <TableCell className="text-foreground font-bold">
                    {refund.studentName}
                  </TableCell>
                  <TableCell className="text-right font-bold tabular-nums">
                    {formatCurrency(refund.amount)}
                    {' '}
                    <span className="text-muted-foreground ml-1 text-xs">
                      FCFA
                    </span>
                  </TableCell>
                  <TableCell className="
                    text-muted-foreground max-w-[200px] truncate font-medium
                  "
                  >
                    {refund.reason}
                  </TableCell>
                  <TableCell className="
                    text-muted-foreground text-sm font-medium
                  "
                  >
                    {formatDate(refund.requestedAt)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(refund.status)}
                      className="rounded-md capitalize"
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
                      <div className="
                        flex justify-end gap-2 opacity-0 transition-opacity
                        group-hover:opacity-100
                      "
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="
                            h-8 w-8 rounded-lg text-green-600
                            hover:bg-green-500/10 hover:text-green-700
                          "
                          onClick={() => onApprove?.(refund.id)}
                          aria-label={t.finance.refunds.approve()}
                        >
                          <IconCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="
                            h-8 w-8 rounded-lg text-red-600
                            hover:bg-red-500/10 hover:text-red-700
                          "
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

      <div className="
        space-y-4 p-4
        md:hidden
      "
      >
        <AnimatePresence>
          {refunds.map((refund, index) => (
            <motion.div
              key={refund.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="
                bg-card/50 border-border/40 space-y-4 rounded-2xl border p-4
                backdrop-blur-md
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold">{refund.studentName}</div>
                  <div className="text-muted-foreground mt-0.5 text-xs">
                    {formatDate(refund.requestedAt)}
                  </div>
                </div>
                <Badge
                  variant={getStatusVariant(refund.status)}
                  className="rounded-md capitalize"
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

              <div className="
                bg-muted/20 border-border/20 rounded-xl border p-3
              "
              >
                <div className="
                  text-muted-foreground mb-1 text-xs tracking-wider uppercase
                "
                >
                  {t.finance.amount()}
                </div>
                <div className="text-lg font-bold">
                  {formatCurrency(refund.amount)}
                  {' '}
                  <span className="text-muted-foreground text-sm font-normal">
                    FCFA
                  </span>
                </div>
              </div>

              {refund.reason && (
                <div className="
                  text-muted-foreground bg-muted/10 border-border/20 rounded-lg
                  border p-3 text-sm italic
                "
                >
                  &quot;
                  {refund.reason}
                  &quot;
                </div>
              )}

              {refund.status === 'pending' && (
                <div className="border-border/30 flex gap-2 border-t pt-2">
                  <Button
                    variant="outline"
                    className="
                      flex-1 rounded-xl border-green-200 bg-green-50
                      text-green-700
                      hover:bg-green-100 hover:text-green-800
                      dark:border-green-900/30 dark:bg-green-900/10
                      dark:text-green-400
                      dark:hover:bg-green-900/20
                    "
                    onClick={() => onApprove?.(refund.id)}
                  >
                    <IconCheck className="mr-2 h-4 w-4" />
                    {t.finance.refunds.approve()}
                  </Button>
                  <Button
                    variant="outline"
                    className="
                      flex-1 rounded-xl border-red-200 bg-red-50 text-red-700
                      hover:bg-red-100 hover:text-red-800
                      dark:border-red-900/30 dark:bg-red-900/10
                      dark:text-red-400
                      dark:hover:bg-red-900/20
                    "
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
