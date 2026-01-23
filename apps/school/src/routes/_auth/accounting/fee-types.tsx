import type { feeCategories } from "@/schemas/fee-type";
import { IconPlus, IconTag } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
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
import { FeeTypeFormDialog, FeeTypesTable } from "@/components/finance";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { useTranslations } from "@/i18n";
import { feeTypesOptions } from "@/lib/queries";
import { deleteExistingFeeType } from "@/school/functions/fee-types";

export const Route = createFileRoute("/_auth/accounting/fee-types")({
  component: FeeTypesPage,
});

interface FeeTypeItem {
  id: string;
  code: string;
  name: string;
  category: string;
  isMandatory: boolean;
  isRecurring: boolean;
  status: string;
}

interface FeeTypeEditData {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  category: (typeof feeCategories)[number];
  isMandatory: boolean;
  isRecurring: boolean;
  displayOrder: number;
}

function FeeTypesPage() {
  const t = useTranslations();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editData, setEditData] = useState<FeeTypeEditData | null>(null);
  const [deleteData, setDeleteData] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    data: feeTypes,
    isLoading,
    refetch,
  } = useQuery(feeTypesOptions.list());

  const feeTypesList: FeeTypeItem[] =
    feeTypes?.map((ft) => ({
      id: ft.id,
      code: ft.code,
      name: ft.name,
      category: ft.category,
      isMandatory: ft.isMandatory ?? true,
      isRecurring: ft.isRecurring ?? true,
      status: ft.status ?? "active",
    })) ?? [];

  const handleEdit = (feeType: FeeTypeItem) => {
    setEditData({
      id: feeType.id,
      code: feeType.code,
      name: feeType.name,
      category: feeType.category as (typeof feeCategories)[number],
      isMandatory: feeType.isMandatory,
      isRecurring: feeType.isRecurring,
      displayOrder: 0,
    });
  };

  const handleDeleteClick = (feeType: FeeTypeItem) => {
    setDeleteData({ id: feeType.id, name: feeType.name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteData) return;
    try {
      await deleteExistingFeeType({ data: deleteData.id });
      await refetch();
      toast.success("Type de frais supprimé");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue",
      );
    }
  };

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.finance(), href: "/accounting" },
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
            <h1 className="text-3xl font-black tracking-tight uppercase italic">
              {t.finance.feeTypes.title()}
            </h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-lg">
              {t.finance.feeTypes.description()}
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
            <CardTitle className="text-lg font-bold">
              {t.finance.feeTypes.title()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <FeeTypesTable
              feeTypes={feeTypesList}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          </CardContent>
        </Card>
      </motion.div>

      <FeeTypeFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {editData && (
        <FeeTypeFormDialog
          open={true}
          onOpenChange={(open) => !open && setEditData(null)}
          editData={editData}
        />
      )}

      <DeleteConfirmationDialog
        open={!!deleteData}
        onOpenChange={(open) => !open && setDeleteData(null)}
        onConfirm={handleDeleteConfirm}
        title={t.accounting.feeTypes.deleteConfirmTitle()}
        description={
          deleteData
            ? t.accounting.feeTypes.deleteConfirmDescription({
                name: deleteData.name,
              })
            : ""
        }
        confirmText={t.common.delete()}
        cancelText={t.common.cancel()}
      />
    </div>
  );
}
