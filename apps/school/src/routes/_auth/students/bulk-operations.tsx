import { createFileRoute } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { BulkEnrollmentCard } from '@/components/students/bulk-enrollment-card'
import { BulkFeeAssignmentCard } from '@/components/students/bulk-fee-assignment-card'
import { StudentImportCard } from '@/components/students/student-import-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from '@/i18n'

export const Route = createFileRoute('/_auth/students/bulk-operations')({
  component: BulkOperationsPage,
})

function BulkOperationsPage() {
  const t = useTranslations()

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t.nav.students(), href: '/students' },
          { label: t.students.bulkOperations.title() },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t.students.bulkOperations.title()}
        </h1>
        <p className="text-muted-foreground">
          {t.students.bulkOperations.description()}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StudentImportCard />
        <BulkEnrollmentCard />
        <BulkFeeAssignmentCard />

        <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              {t.students.bulkReEnroll()}
            </CardTitle>
            <CardDescription>
              {t.students.bulkReEnrollDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t.common.comingSoon()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
