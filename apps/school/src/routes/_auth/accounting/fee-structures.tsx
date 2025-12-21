import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Layers, Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { FeeStructuresTable } from '@/components/finance'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from '@/i18n'
import { feeStructuresOptions } from '@/lib/queries'

export const Route = createFileRoute('/_auth/accounting/fee-structures')({
  component: FeeStructuresPage,
})

function FeeStructuresPage() {
  const t = useTranslations()
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
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.finance(), href: '/accounting' },
          { label: t.finance.feeStructures.title() },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
            <Layers className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">{t.finance.feeStructures.title()}</h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-lg">{t.finance.feeStructures.description()}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" />
            {t.finance.feeStructures.create()}
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
            <CardTitle className="text-lg font-bold">{t.finance.feeStructures.title()}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <FeeStructuresTable
              feeStructures={feeStructuresList}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
