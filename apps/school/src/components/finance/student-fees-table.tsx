import { IconUsers } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
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

interface StudentFee {
  id: string
  studentName: string
  matricule: string
  className: string
  totalFees: number
  paidAmount: number
  balance: number
  status: string
}

interface StudentFeesTableProps {
  studentFees: StudentFee[]
  isPending?: boolean
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'paid':
      return 'default'
    case 'partial':
      return 'secondary'
    case 'pending':
      return 'outline'
    case 'waived':
      return 'secondary'
    default:
      return 'destructive'
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function StudentFeesTable({
  studentFees,
  isPending,
}: StudentFeesTableProps) {
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

  if (studentFees.length === 0) {
    return (
      <div className="
        text-muted-foreground border-border/30 bg-card/10 m-4 flex flex-col
        items-center justify-center rounded-xl border-2 border-dashed py-16
        text-center
      "
      >
        <div className="bg-muted/20 mb-4 rounded-full p-4">
          <IconUsers className="text-muted-foreground/50 h-8 w-8" />
        </div>
        <p className="text-lg font-medium">
          {t.finance.studentFees.noStudentFees()}
        </p>
        <p className="text-muted-foreground/70 mt-1 max-w-sm text-sm">
          {t.finance.studentFees.description()}
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
                {t.students.matricule()}
              </TableHead>
              <TableHead className="font-semibold">
                {t.students.name()}
              </TableHead>
              <TableHead className="font-semibold">
                {t.students.class()}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {t.finance.studentFees.totalFees()}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {t.finance.studentFees.paidAmount()}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {t.finance.studentFees.balance()}
              </TableHead>
              <TableHead className="font-semibold">
                {t.common.status()}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {studentFees.map((fee, index) => (
                <motion.tr
                  key={fee.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="
                    group
                    hover:bg-muted/30
                    border-border/40 transition-colors
                  "
                >
                  <TableCell className="
                    text-muted-foreground font-mono text-sm font-medium
                  "
                  >
                    {fee.matricule || '-'}
                  </TableCell>
                  <TableCell className="text-foreground font-bold">
                    {fee.studentName}
                  </TableCell>
                  <TableCell>
                    {fee.className
                      ? (
                          <Badge variant="outline" className="font-medium">
                            {fee.className}
                          </Badge>
                        )
                      : (
                          <span className="text-muted-foreground text-sm italic">
                            -
                          </span>
                        )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(fee.totalFees)}
                    {' '}
                    <span className="text-muted-foreground ml-1 text-xs">
                      FCFA
                    </span>
                  </TableCell>
                  <TableCell className="
                    text-right font-bold text-green-600
                    dark:text-green-500
                  "
                  >
                    {formatCurrency(fee.paidAmount)}
                    {' '}
                    <span className="ml-1 text-xs opacity-70">FCFA</span>
                  </TableCell>
                  <TableCell className="
                    text-right font-bold text-orange-600
                    dark:text-orange-500
                  "
                  >
                    {formatCurrency(fee.balance)}
                    {' '}
                    <span className="ml-1 text-xs opacity-70">FCFA</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(fee.status)}
                      className="rounded-md capitalize"
                    >
                      {{
                        pending: t.finance.payments.status.pending,
                        completed: t.finance.payments.status.completed,
                        cancelled: t.finance.payments.status.cancelled,
                        refunded: t.finance.payments.status.refunded,
                        paid: t.finance.payments.status.completed,
                        partial: t.finance.payments.status.pending,
                        waived: t.finance.payments.status.cancelled,
                      }[
                        fee.status as
                        | 'pending'
                        | 'completed'
                        | 'cancelled'
                        | 'refunded'
                        | 'paid'
                        | 'partial'
                        | 'waived'
                      ]()}
                    </Badge>
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
          {studentFees.map((fee, index) => (
            <motion.div
              key={fee.id}
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
                  <div className="text-lg font-bold">{fee.studentName}</div>
                  <div className="
                    text-muted-foreground mt-0.5 font-mono text-xs
                  "
                  >
                    {fee.matricule || 'N/A'}
                  </div>
                </div>
                {fee.className && (
                  <Badge variant="outline" className="font-medium">
                    {fee.className}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="
                  rounded-xl border border-green-500/20 bg-green-500/5 p-3
                "
                >
                  <div className="
                    mb-1 text-xs tracking-wider text-green-700 uppercase
                    dark:text-green-400
                  "
                  >
                    {t.finance.studentFees.paidAmount()}
                  </div>
                  <div className="
                    text-lg font-bold text-green-700
                    dark:text-green-400
                  "
                  >
                    {formatCurrency(fee.paidAmount)}
                  </div>
                </div>
                <div className="
                  rounded-xl border border-orange-500/20 bg-orange-500/5 p-3
                "
                >
                  <div className="
                    mb-1 text-xs tracking-wider text-orange-700 uppercase
                    dark:text-orange-400
                  "
                  >
                    {t.finance.studentFees.balance()}
                  </div>
                  <div className="
                    text-lg font-bold text-orange-700
                    dark:text-orange-400
                  "
                  >
                    {formatCurrency(fee.balance)}
                  </div>
                </div>
              </div>

              <div className="
                border-border/30 flex items-center justify-between border-t pt-2
              "
              >
                <div className="text-sm">
                  <span className="text-muted-foreground mr-2">
                    {t.finance.studentFees.totalFees()}
                    :
                  </span>
                  <span className="font-bold">
                    {formatCurrency(fee.totalFees)}
                    {' '}
                    FCFA
                  </span>
                </div>
                <Badge
                  variant={getStatusVariant(fee.status)}
                  className="rounded-md capitalize"
                >
                  {{
                    pending: t.finance.payments.status.pending,
                    completed: t.finance.payments.status.completed,
                    cancelled: t.finance.payments.status.cancelled,
                    refunded: t.finance.payments.status.refunded,
                    paid: t.finance.payments.status.completed,
                    partial: t.finance.payments.status.pending,
                    waived: t.finance.payments.status.cancelled,
                  }[
                    fee.status as
                    | 'pending'
                    | 'completed'
                    | 'cancelled'
                    | 'refunded'
                    | 'paid'
                    | 'partial'
                    | 'waived'
                  ]()}
                </Badge>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
