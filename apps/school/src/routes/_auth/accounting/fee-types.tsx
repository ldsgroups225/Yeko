import { IconPlus, IconTag } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { motion } from 'motion/react'
import { useState } from 'react'
import { FeeTypeFormDialog, FeeTypesTable } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { useTranslations } from '@/i18n'
import { feeTypesOptions } from '@/lib/queries'

export const Route = createFileRoute('/_auth/accounting/fee-types')({
  component: FeeTypesPage,
})

function FeeTypesPage() {
  const t = useTranslations()
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
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.finance(), href: '/accounting' },
          { label: t.finance.feeTypes.title() },
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
            <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.finance.feeTypes.title()}</h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-lg">{t.finance.feeTypes.description()}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg shadow-primary/20">
            <IconPlus className="mr-2 h-4 w-4" />
            {t.finance.feeTypes.create()}
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
            <CardTitle className="text-lg font-bold">{t.finance.feeTypes.title()}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <FeeTypesTable
              feeTypes={feeTypesList}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </motion.div>

      <FeeTypeFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  )
}
