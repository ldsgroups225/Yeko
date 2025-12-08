import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FeeTypeFormDialog, FeeTypesTable } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { feeTypesOptions } from '@/lib/queries'

export const Route = createFileRoute('/_auth/app/finance/fee-types')({
  component: FeeTypesPage,
})

function FeeTypesPage() {
  const { t } = useTranslation()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data: feeTypes, isLoading } = useQuery(feeTypesOptions.list())

  const feeTypesList = feeTypes?.map(ft => ({
    id: ft.id,
    code: ft.code,
    name: ft.name,
    category: ft.category,
    isMandatory: ft.isMandatory ?? true,
    isRecurring: ft.isRecurring ?? true,
    status: ft.status ?? 'active',
  })) ?? []

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.finance'), href: '/app/finance' },
          { label: t('finance.feeTypes.title') },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('finance.feeTypes.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('finance.feeTypes.description')}
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('finance.feeTypes.create')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('finance.feeTypes.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <FeeTypesTable
            feeTypes={feeTypesList}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <FeeTypeFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  )
}
