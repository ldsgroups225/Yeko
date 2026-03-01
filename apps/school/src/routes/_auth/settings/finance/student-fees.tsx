import { IconPlus } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { motion } from 'motion/react'
import { FinanceSubpageToolbar, StudentFeesTable } from '@/components/finance'
import { useTranslations } from '@/i18n'
import { studentFeesOptions } from '@/lib/queries'

export const Route = createFileRoute('/_auth/settings/finance/student-fees')({
  component: StudentFeesPage,
})

function StudentFeesPage() {
  const t = useTranslations()
  const navigate = useNavigate()

  const { data: studentsWithBalance, isPending } = useQuery(studentFeesOptions.withBalance())

  const studentFeesList = (studentsWithBalance ?? []).map(s => ({
    id: s.studentId,
    studentName: `${s.firstName} ${s.lastName}`,
    matricule: s.matricule,
    className: s.className,
    totalFees: Number(s.totalBalance ?? 0),
    paidAmount: 0,
    balance: Number(s.totalBalance ?? 0),
    status: Number(s.totalBalance ?? 0) === 0 ? 'paid' : 'pending',
  }))

  return (
    <div className="space-y-8 p-1">
      <FinanceSubpageToolbar
        actions={(
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              onClick={() => navigate({ to: '/settings/finance/fee-structures' })}
              className="gap-2"
            >
              <IconPlus className="size-4" />
              Assigner des frais
            </Button>
          </motion.div>
        )}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="
          border-border/40 bg-card/40 overflow-hidden shadow-sm backdrop-blur-xl
        "
        >
          <CardHeader className="border-border/40 bg-muted/5 border-b">
            <CardTitle className="text-lg font-bold">{t.finance.studentFees.title()}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <StudentFeesTable
              studentFees={studentFeesList}
              isPending={isPending}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
