import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { StudentFeesTable } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { studentFeesOptions } from '@/lib/queries'

export const Route = createFileRoute('/_auth/app/finance/student-fees')({
  component: StudentFeesPage,
})

function StudentFeesPage() {
  const { t } = useTranslation()

  const { data: studentsWithBalance, isLoading } = useQuery(studentFeesOptions.withBalance())

  const studentFeesList = (studentsWithBalance ?? []).map((s: { studentId: string, firstName: string, lastName: string, matricule: string | null, className: string | null, totalFees: string | null, paidAmount: string | null, balance: string | null }) => ({
    id: s.studentId,
    studentName: `${s.firstName} ${s.lastName}`,
    matricule: s.matricule ?? '',
    className: s.className ?? '',
    totalFees: Number(s.totalFees ?? 0),
    paidAmount: Number(s.paidAmount ?? 0),
    balance: Number(s.balance ?? 0),
    status: Number(s.balance ?? 0) === 0 ? 'paid' : Number(s.paidAmount ?? 0) > 0 ? 'partial' : 'pending',
  }))

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.finance'), href: '/app/finance' },
          { label: t('finance.studentFees.title') },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('finance.studentFees.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('finance.studentFees.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('finance.studentFees.title')}</CardTitle>
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
