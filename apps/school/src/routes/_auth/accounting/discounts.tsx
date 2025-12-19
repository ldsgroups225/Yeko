import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DiscountFormDialog, DiscountsTable } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { discountsOptions } from '@/lib/queries'

export const Route = createFileRoute('/_auth/accounting/discounts')({
  component: DiscountsPage,
})

function DiscountsPage() {
  const { t } = useTranslation()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data: discounts, isLoading } = useQuery(discountsOptions.list())

  const discountsList = discounts?.map(d => ({
    id: d.id,
    code: d.code,
    name: d.name,
    type: d.type,
    calculationType: d.calculationType,
    value: Number(d.value),
    requiresApproval: d.requiresApproval ?? false,
    autoApply: d.autoApply ?? false,
    status: d.status ?? 'active',
  })) ?? []

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t('nav.finance'), href: '/accounting' },
          { label: t('finance.discounts.title') },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('finance.discounts.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('finance.discounts.description')}
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('finance.discounts.create')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('finance.discounts.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DiscountsTable
            discounts={discountsList}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <DiscountFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  )
}
