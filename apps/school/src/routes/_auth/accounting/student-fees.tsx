import { IconUsers } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { motion } from 'motion/react'
import { StudentFeesTable } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { studentFeesOptions } from '@/lib/queries'

export const Route = createFileRoute('/_auth/accounting/student-fees')({
  component: StudentFeesPage,
})

function StudentFeesPage() {
  const t = useTranslations()

  const { data: studentsWithBalance, isLoading } = useQuery(studentFeesOptions.withBalance())

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
      <Breadcrumbs
        items={[
          { label: t.nav.finance(), href: '/accounting' },
          { label: t.finance.studentFees.title() },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
          <IconUsers className="size-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.finance.studentFees.title()}</h1>
          <p className="text-sm font-medium text-muted-foreground italic max-w-lg">{t.finance.studentFees.description()}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden shadow-sm">
          <CardHeader className="border-b border-border/40 bg-muted/5">
            <CardTitle className="text-lg font-bold">{t.finance.studentFees.title()}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <StudentFeesTable
              studentFees={studentFeesList}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
