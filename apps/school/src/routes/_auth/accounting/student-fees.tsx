import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { StudentFeesTable } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    studentName: s.studentId,
    matricule: '',
    className: '',
    totalFees: Number(s.totalBalance ?? 0),
    paidAmount: 0,
    balance: Number(s.totalBalance ?? 0),
    status: Number(s.totalBalance ?? 0) === 0 ? 'paid' : 'pending',
  }))

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.nav.finance(), href: '/accounting' },
          { label: t.finance.studentFees.title() },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t.finance.studentFees.title()}
        </h1>
        <p className="text-muted-foreground">
          {t.finance.studentFees.description()}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.finance.studentFees.title()}</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentFeesTable
            studentFees={studentFeesList}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
