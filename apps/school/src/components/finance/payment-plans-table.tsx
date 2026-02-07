import { IconCalendarTime } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { Progress } from '@workspace/ui/components/progress'
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

interface PaymentPlan {
  id: string
  studentName: string
  matricule: string
  totalAmount: number
  paidAmount: number
  installmentsCount: number
  paidInstallments: number
  status: string
}

interface PaymentPlansTableProps {
  paymentPlans: PaymentPlan[]
  isPending?: boolean
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'completed':
      return 'default'
    case 'active':
      return 'secondary'
    case 'overdue':
      return 'destructive'
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

export function PaymentPlansTable({
  paymentPlans,
  isPending,
}: PaymentPlansTableProps) {
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

  if (paymentPlans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border-2 border-dashed border-border/30 rounded-xl bg-card/10 m-4">
        <div className="p-4 rounded-full bg-muted/20 mb-4">
          <IconCalendarTime className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-medium">
          {t.finance.paymentPlans.noPaymentPlans()}
        </p>
        <p className="text-sm max-w-sm mt-1 text-muted-foreground/70">
          {t.finance.paymentPlans.description()}
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
              <TableHead className="text-right font-semibold">
                {t.finance.paymentPlans.totalAmount()}
              </TableHead>
              <TableHead className="font-semibold">
                {t.finance.paymentPlans.progress()}
              </TableHead>
              <TableHead className="font-semibold">
                {t.finance.paymentPlans.installments()}
              </TableHead>
              <TableHead className="font-semibold">
                {t.common.status()}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {paymentPlans.map((plan, index) => {
                const progressPercent
                  = plan.totalAmount > 0
                    ? Math.round((plan.paidAmount / plan.totalAmount) * 100)
                    : 0

                return (
                  <motion.tr
                    key={plan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-muted/30 border-border/40 transition-colors"
                  >
                    <TableCell className="font-mono text-sm text-muted-foreground font-medium">
                      {plan.matricule || '-'}
                    </TableCell>
                    <TableCell className="font-bold text-foreground">
                      {plan.studentName}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(plan.totalAmount)}
                      {' '}
                      <span className="text-xs text-muted-foreground ml-1">
                        FCFA
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={progressPercent}
                          className="h-2 w-20 rounded-full"
                        />
                        <span className="text-sm font-medium text-muted-foreground">
                          {progressPercent}
                          %
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className="text-primary">
                        {plan.paidInstallments}
                      </span>
                      <span className="text-muted-foreground mx-1">/</span>
                      <span>{plan.installmentsCount}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusVariant(plan.status)}
                        className="capitalize rounded-md"
                      >
                        {{
                          active: t.finance.paymentPlans.status.active,
                          completed: t.finance.paymentPlans.status.completed,
                          overdue: t.finance.paymentPlans.status.overdue,
                          cancelled: t.finance.paymentPlans.status.cancelled,
                        }[
                          plan.status as
                          | 'active'
                          | 'completed'
                          | 'overdue'
                          | 'cancelled'
                        ]()}
                      </Badge>
                    </TableCell>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-4 p-4">
        <AnimatePresence>
          {paymentPlans.map((plan, index) => {
            const progressPercent
              = plan.totalAmount > 0
                ? Math.round((plan.paidAmount / plan.totalAmount) * 100)
                : 0

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-md space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-lg">{plan.studentName}</div>
                    <div className="text-xs font-mono text-muted-foreground mt-0.5">
                      {plan.matricule || 'N/A'}
                    </div>
                  </div>
                  <Badge
                    variant={getStatusVariant(plan.status)}
                    className="capitalize rounded-md"
                  >
                    {{
                      active: t.finance.paymentPlans.status.active,
                      completed: t.finance.paymentPlans.status.completed,
                      overdue: t.finance.paymentPlans.status.overdue,
                      cancelled: t.finance.paymentPlans.status.cancelled,
                    }[
                      plan.status as
                      | 'active'
                      | 'completed'
                      | 'overdue'
                      | 'cancelled'
                    ]()}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t.finance.paymentPlans.progress()}
                    </span>
                    <span className="font-bold">
                      {progressPercent}
                      %
                    </span>
                  </div>
                  <Progress
                    value={progressPercent}
                    className="h-2 rounded-full"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/20 flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {t.finance.paymentPlans.totalAmount()}
                    </div>
                    <div className="font-bold text-lg">
                      {formatCurrency(plan.totalAmount)}
                      {' '}
                      <span className="text-sm font-normal text-muted-foreground">
                        FCFA
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/20 flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {t.finance.paymentPlans.installments()}
                    </div>
                    <div className="font-bold">
                      <span className="text-primary">
                        {plan.paidInstallments}
                      </span>
                      <span className="text-muted-foreground mx-1">/</span>
                      <span>{plan.installmentsCount}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </>
  )
}
