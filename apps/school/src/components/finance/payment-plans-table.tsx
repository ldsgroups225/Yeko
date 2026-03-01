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
      <div className="
        text-muted-foreground border-border/30 bg-card/10 m-4 flex flex-col
        items-center justify-center rounded-xl border-2 border-dashed py-16
        text-center
      "
      >
        <div className="bg-muted/20 mb-4 rounded-full p-4">
          <IconCalendarTime className="text-muted-foreground/50 h-8 w-8" />
        </div>
        <p className="text-lg font-medium">
          {t.finance.paymentPlans.noPaymentPlans()}
        </p>
        <p className="text-muted-foreground/70 mt-1 max-w-sm text-sm">
          {t.finance.paymentPlans.description()}
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
                      {plan.matricule || '-'}
                    </TableCell>
                    <TableCell className="text-foreground font-bold">
                      {plan.studentName}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(plan.totalAmount)}
                      {' '}
                      <span className="text-muted-foreground ml-1 text-xs">
                        FCFA
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={progressPercent}
                          className="h-2 w-20 rounded-full"
                        />
                        <span className="
                          text-muted-foreground text-sm font-medium
                        "
                        >
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
                        className="rounded-md capitalize"
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

      <div className="
        space-y-4 p-4
        md:hidden
      "
      >
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
                className="
                  bg-card/50 border-border/40 space-y-4 rounded-2xl border p-4
                  backdrop-blur-md
                "
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-bold">{plan.studentName}</div>
                    <div className="
                      text-muted-foreground mt-0.5 font-mono text-xs
                    "
                    >
                      {plan.matricule || 'N/A'}
                    </div>
                  </div>
                  <Badge
                    variant={getStatusVariant(plan.status)}
                    className="rounded-md capitalize"
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
                  <div className="
                    bg-muted/20 border-border/20 flex-1 rounded-xl border p-3
                  "
                  >
                    <div className="
                      text-muted-foreground mb-1 text-xs tracking-wider
                      uppercase
                    "
                    >
                      {t.finance.paymentPlans.totalAmount()}
                    </div>
                    <div className="text-lg font-bold">
                      {formatCurrency(plan.totalAmount)}
                      {' '}
                      <span className="
                        text-muted-foreground text-sm font-normal
                      "
                      >
                        FCFA
                      </span>
                    </div>
                  </div>
                  <div className="
                    bg-muted/20 border-border/20 flex-1 rounded-xl border p-3
                  "
                  >
                    <div className="
                      text-muted-foreground mb-1 text-xs tracking-wider
                      uppercase
                    "
                    >
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
