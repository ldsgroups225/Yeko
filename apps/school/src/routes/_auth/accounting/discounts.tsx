import { IconPlus, IconTag } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { motion } from 'motion/react'
import { useState } from 'react'
import { DiscountFormDialog, DiscountsTable } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { discountsOptions } from '@/lib/queries'

export const Route = createFileRoute('/_auth/accounting/discounts')({
  component: DiscountsPage,
})

function DiscountsPage() {
  const t = useTranslations()
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
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.finance(), href: '/accounting' },
          { label: t.finance.discounts.title() },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
            <IconTag className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.finance.discounts.title()}</h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-lg">{t.finance.discounts.description()}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button onClick={() => setIsCreateOpen(true)} className="h-10 rounded-xl shadow-lg shadow-primary/20">
            <IconPlus className="mr-2 h-4 w-4" />
            {t.finance.discounts.create()}
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden shadow-sm">
          <CardHeader className="border-b border-border/40 bg-muted/5">
            <CardTitle className="text-lg font-bold">{t.finance.discounts.title()}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DiscountsTable
              discounts={discountsList}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </motion.div>

      <DiscountFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  )
}
