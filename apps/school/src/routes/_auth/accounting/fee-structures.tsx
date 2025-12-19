import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FeeStructuresTable } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { feeStructuresOptions } from '@/lib/queries'

export const Route = createFileRoute('/_auth/accounting/fee-structures')({
  component: FeeStructuresPage,
})

function FeeStructuresPage() {
  const { t } = useTranslation()
  const [_isCreateOpen, setIsCreateOpen] = useState(false)

  const { data: feeStructures, isLoading } = useQuery(feeStructuresOptions.withDetails())

  const feeStructuresList = (feeStructures ?? []).map(fs => ({
    id: fs.id,
    feeTypeName: fs.feeTypeName ?? '',
    feeTypeCode: fs.feeTypeCode ?? '',
    gradeName: (fs as { gradeName?: string | null }).gradeName ?? '',
    seriesName: (fs as { seriesName?: string | null }).seriesName ?? undefined,
    amount: Number(fs.amount ?? 0),
    newStudentAmount: fs.newStudentAmount ? Number(fs.newStudentAmount) : undefined,
    currency: fs.currency ?? 'XOF',
  }))

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.finance'), href: '/accounting' },
          { label: t('finance.feeStructures.title') },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('finance.feeStructures.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('finance.feeStructures.description')}
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('finance.feeStructures.create')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('finance.feeStructures.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FeeStructuresTable
            feeStructures={feeStructuresList}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
