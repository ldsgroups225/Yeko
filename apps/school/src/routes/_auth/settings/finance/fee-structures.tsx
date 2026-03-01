import type { FeeStructure } from '@/components/finance'
import { IconPlus } from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FeeStructureFormDialog, FeeStructuresTable } from '@/components/finance'
import { FinanceSubpageToolbar } from '@/components/finance/finance-subpage-toolbar'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { feeStructuresKeys, feeStructuresOptions } from '@/lib/queries'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { deleteExistingFeeStructure } from '@/school/functions/fee-structures'

export const Route = createFileRoute('/_auth/settings/finance/fee-structures')({
  component: FeeStructuresPage,
})

function FeeStructuresPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { schoolYearId } = useSchoolYearContext()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: feeStructures, isPending } = useQuery(
    feeStructuresOptions.withDetails({ schoolYearId: schoolYearId || undefined }),
  )

  const deleteMutation = useMutation({
    mutationKey: schoolMutationKeys.feeStructures.delete,
    mutationFn: (id: string) => deleteExistingFeeStructure({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeStructuresKeys.lists() })
      toast.success(t('finance.feeStructures.success.delete'))
      setDeletingId(null)
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : t('errors.generic')
      toast.error(message)
    },
  })

  const handleEdit = (id: string) => {
    const structure = feeStructures?.find(fs => fs.id === id)
    if (structure) {
      setEditingStructure(structure as unknown as FeeStructure)
      setIsCreateOpen(true)
    }
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
  }

  const feeStructuresList = (feeStructures ?? []).map(fs => ({
    id: fs.id,
    feeTypeName: fs.feeTypeName ?? '',
    feeTypeCode: fs.feeTypeCode ?? '',
    gradeName: (fs as { gradeName?: string | null }).gradeName ?? '',
    seriesName: (fs as { seriesName?: string | null }).seriesName ?? undefined,
    amount: Number(fs.amount ?? 0),
    newStudentAmount: fs.newStudentAmount
      ? Number(fs.newStudentAmount)
      : undefined,
    currency: fs.currency ?? 'XOF',
  }))

  return (
    <div className="space-y-8 p-1">
      <FinanceSubpageToolbar
        actions={(
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="shadow-primary/20 shadow-lg"
            >
              <IconPlus className="mr-2 h-4 w-4" />
              {t('finance.feeStructures.create')}
            </Button>
          </motion.div>
        )}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="
          border-border/40 bg-card/40 overflow-hidden shadow-sm backdrop-blur-xl
        "
        >
          <CardHeader className="border-border/40 bg-muted/5 border-b">
            <CardTitle className="text-lg font-bold">
              {t('finance.feeStructures.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <FeeStructuresTable
              feeStructures={feeStructuresList}
              isPending={isPending}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </motion.div>

      <FeeStructureFormDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open)
            setEditingStructure(null)
        }}
        initialData={editingStructure || undefined}
      />

      <DeleteConfirmationDialog
        open={!!deletingId}
        onOpenChange={open => !open && setDeletingId(null)}
        onConfirm={() => {
          if (deletingId)
            deleteMutation.mutate(deletingId)
        }}
        isPending={deleteMutation.isPending}
        title={t('finance.feeStructures.deleteFeeStructure')}
        description={t('finance.feeStructures.deleteFeeStructureConfirm')}
      />
    </div>
  )
}
