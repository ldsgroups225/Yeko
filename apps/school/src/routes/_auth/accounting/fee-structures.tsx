import { IconPlus, IconStack2 } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { DeleteConfirmationDialog } from "@workspace/ui/components/delete-confirmation-dialog";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  FeeStructureFormDialog,
  FeeStructuresTable,
} from "@/components/finance";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { useTranslations } from "@/i18n";
import { feeStructuresKeys, feeStructuresOptions } from "@/lib/queries";
import { deleteExistingFeeStructure } from "@/school/functions/fee-structures";

export const Route = createFileRoute("/_auth/accounting/fee-structures")({
  component: FeeStructuresPage,
});

function FeeStructuresPage() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: feeStructures, isLoading } = useQuery(
    feeStructuresOptions.withDetails(),
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExistingFeeStructure({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeStructuresKeys.lists() });
      toast.success("Structure de frais supprimée");
      setDeletingId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur lors de la suppression");
    },
  });

  const handleEdit = (id: string) => {
    const structure = feeStructures?.find((fs) => fs.id === id);
    if (structure) {
      setEditingStructure(structure);
      setIsCreateOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const feeStructuresList = (feeStructures ?? []).map((fs) => ({
    id: fs.id,
    feeTypeName: fs.feeTypeName ?? "",
    feeTypeCode: fs.feeTypeCode ?? "",
    gradeName: (fs as { gradeName?: string | null }).gradeName ?? "",
    seriesName: (fs as any).seriesName ?? undefined,
    amount: Number(fs.amount ?? 0),
    newStudentAmount: fs.newStudentAmount
      ? Number(fs.newStudentAmount)
      : undefined,
    currency: fs.currency ?? "XOF",
  }));

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.finance(), href: "/accounting" },
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
            <IconStack2 className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">
              {t.finance.feeStructures.title()}
            </h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-lg">
              {t.finance.feeStructures.description()}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="shadow-lg shadow-primary/20"
          >
            <IconPlus className="mr-2 h-4 w-4" />
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
            <CardTitle className="text-lg font-bold">
              {t.finance.feeStructures.title()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <FeeStructuresTable
              feeStructures={feeStructuresList}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </motion.div>

      <FeeStructureFormDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setEditingStructure(null);
        }}
        initialData={editingStructure}
      />

      <DeleteConfirmationDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteMutation.mutate(deletingId);
        }}
        isLoading={deleteMutation.isPending}
        title={t.accounting.feeStructures.deleteFeeStructure()}
        description={t.accounting.feeStructures.deleteFeeStructureConfirm()}
      />
    </div>
  );
}
