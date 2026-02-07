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
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border-2 border-dashed border-border/30 rounded-xl bg-card/10 m-4">
        <div className="p-4 rounded-full bg-muted/20 mb-4">
          <IconUsers className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-medium">
          {t.finance.studentFees.noStudentFees()}
        </p>
        <p className="text-sm max-w-sm mt-1 text-muted-foreground/70">
          {t.finance.studentFees.description()}
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
                  className="group hover:bg-muted/30 border-border/40 transition-colors"
                >
                  <TableCell className="font-mono text-sm text-muted-foreground font-medium">
                    {fee.matricule || '-'}
                  </TableCell>
                  <TableCell className="font-bold text-foreground">
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
                          <span className="text-muted-foreground italic text-sm">
                            -
                          </span>
                        )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(fee.totalFees)}
                    {' '}
                    <span className="text-xs text-muted-foreground ml-1">
                      FCFA
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600 dark:text-green-500">
                    {formatCurrency(fee.paidAmount)}
                    {' '}
                    <span className="text-xs ml-1 opacity-70">FCFA</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-orange-600 dark:text-orange-500">
                    {formatCurrency(fee.balance)}
                    {' '}
                    <span className="text-xs ml-1 opacity-70">FCFA</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(fee.status)}
                      className="capitalize rounded-md"
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

      <div className="md:hidden space-y-4 p-4">
        <AnimatePresence>
          {studentFees.map((fee, index) => (
            <motion.div
              key={fee.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-md space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">{fee.studentName}</div>
                  <div className="text-xs font-mono text-muted-foreground mt-0.5">
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
                <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                  <div className="text-xs text-green-700 dark:text-green-400 uppercase tracking-wider mb-1">
                    {t.finance.studentFees.paidAmount()}
                  </div>
                  <div className="font-bold text-lg text-green-700 dark:text-green-400">
                    {formatCurrency(fee.paidAmount)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/20">
                  <div className="text-xs text-orange-700 dark:text-orange-400 uppercase tracking-wider mb-1">
                    {t.finance.studentFees.balance()}
                  </div>
                  <div className="font-bold text-lg text-orange-700 dark:text-orange-400">
                    {formatCurrency(fee.balance)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/30">
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
                  className="capitalize rounded-md"
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
