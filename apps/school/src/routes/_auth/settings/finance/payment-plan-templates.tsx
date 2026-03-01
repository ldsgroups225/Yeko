import type { PaymentPlanTemplateTableItem } from '@/components/finance/payment-plan-templates-table'
import {
  IconPlus,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { DeleteConfirmationDialog } from '@workspace/ui/components/delete-confirmation-dialog'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { FinanceSubpageToolbar } from '@/components/finance/finance-subpage-toolbar'
import { PaymentPlanTemplateFormDialog } from '@/components/finance/payment-plan-template-form-dialog'
import { PaymentPlanTemplatesTable } from '@/components/finance/payment-plan-templates-table'
import { useSchoolYearContext } from '@/hooks/use-school-year-context'
import { useTranslations } from '@/i18n'
import { schoolMutationKeys } from '@/lib/queries/keys'
import { paymentPlanTemplatesKeys, paymentPlanTemplatesOptions } from '@/lib/queries/payment-plan-templates'
import { deletePaymentPlanTemplate } from '@/school/functions/payment-plan-templates'

export const Route = createFileRoute('/_auth/settings/finance/payment-plan-templates')({
  component: PaymentPlanTemplatesPage,
})

function PaymentPlanTemplatesPage() {
  const t = useTranslations()
  const { schoolYearId, isPending: contextPending } = useSchoolYearContext()
  const queryClient = useQueryClient()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<PaymentPlanTemplateTableItem | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: templates, isPending } = useQuery({
    ...paymentPlanTemplatesOptions(schoolYearId ?? ''),
    enabled: !!schoolYearId,
  })

  const deleteMutation = useMutation({
    mutationKey: schoolMutationKeys.paymentPlanTemplates.delete,
    mutationFn: async (id: string) => {
      const result = await deletePaymentPlanTemplate({ data: { id } })
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentPlanTemplatesKeys.all })
      toast.success('Modèle supprimé avec succès')
      setIsDeleteDialogOpen(false)
      setSelectedTemplate(null)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const handleEdit = (template: PaymentPlanTemplateTableItem) => {
    setSelectedTemplate(template)
    setIsCreateDialogOpen(true)
  }

  const handleDelete = (template: PaymentPlanTemplateTableItem) => {
    setSelectedTemplate(template)
    setIsDeleteDialogOpen(true)
  }

  const handleCreateOpenChange = (open: boolean) => {
    setIsCreateDialogOpen(open)
    if (!open) {
      setTimeout(() => setSelectedTemplate(null), 300) // Reset after animation
    }
  }

  if (contextPending || isPending) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8 p-1">
      <FinanceSubpageToolbar
        actions={(
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              className="shadow-primary/20 gap-2 rounded-xl shadow-lg"
              onClick={() => {
                setSelectedTemplate(null)
                setIsCreateDialogOpen(true)
              }}
            >
              <IconPlus className="h-4 w-4" />
              {t.common.create()}
            </Button>
          </motion.div>
        )}
      />

      <div className="
        border-border/40 bg-card/30 overflow-hidden rounded-2xl border
        backdrop-blur-md
      "
      >
        <PaymentPlanTemplatesTable
          templates={(templates ?? []).map(tpl => ({ ...tpl, isDefault: tpl.isDefault ?? false, status: tpl.status ?? 'active' }))}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {schoolYearId && (
        <PaymentPlanTemplateFormDialog
          open={isCreateDialogOpen}
          onOpenChange={handleCreateOpenChange}
          schoolYearId={schoolYearId}
          initialData={selectedTemplate ? { ...selectedTemplate, nameEn: selectedTemplate.nameEn ?? undefined, schedule: selectedTemplate.schedule } : undefined}
        />
      )}

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={async () => {
          if (selectedTemplate)
            deleteMutation.mutate(selectedTemplate.id)
        }}
        isPending={deleteMutation.isPending}
        title="Supprimer le modèle"
        description="Êtes-vous sûr de vouloir supprimer ce modèle ? Cette action est irréversible."
      />
    </div>
  )
}
