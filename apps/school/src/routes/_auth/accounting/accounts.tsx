import { IconBookmark, IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AccountFormDialog, AccountsTable } from "@/components/finance";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { useTranslations } from "@/i18n";
import { accountsKeys, accountsOptions } from "@/lib/queries";
import { deleteExistingAccount } from "@/school/functions/accounts";
import { DeleteConfirmationDialog } from "@workspace/ui/components/delete-confirmation-dialog";

export const Route = createFileRoute("/_auth/accounting/accounts")({
  component: AccountsPage,
});

interface AccountNode {
  id: string;
  code: string;
  name: string;
  type: string;
  level: number;
  balance: string | null;
  isHeader: boolean | null;
  status: string | null;
  children?: AccountNode[];
}

function flattenAccounts(accounts: AccountNode[]): AccountNode[] {
  const result: AccountNode[] = [];
  for (const account of accounts) {
    result.push(account);
    if (account.children && account.children.length > 0) {
      result.push(...flattenAccounts(account.children));
    }
  }
  return result;
}

function AccountsPage() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: accountsTree, isLoading } = useQuery(accountsOptions.tree());

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExistingAccount({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsKeys.all });
      toast.success("Compte supprimé");
      setDeletingId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur lors de la suppression");
    },
  });

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setIsCreateOpen(true);
  };

  const handleDelete = (account: any) => {
    setDeletingId(account.id);
  };

  const accountsList = accountsTree
    ? flattenAccounts(accountsTree as AccountNode[]).map((acc) => ({
        id: acc.id,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        level: acc.level,
        balance: Number(acc.balance ?? 0),
        isHeader: acc.isHeader ?? false,
        status: acc.status ?? "active",
      }))
    : [];

  return (
    <div className="space-y-8 p-1">
      <Breadcrumbs
        items={[
          { label: t.nav.finance(), href: "/accounting" },
          { label: t.finance.accounts.title() },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg backdrop-blur-xl">
            <IconBookmark className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">
              {t.finance.accounts.title()}
            </h1>
            <p className="text-sm font-medium text-muted-foreground italic max-w-lg">
              {t.finance.accounts.description()}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-10 rounded-xl shadow-lg shadow-primary/20"
          >
            <IconPlus className="mr-2 h-4 w-4" />
            {t.finance.accounts.create()}
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
              {t.finance.accounts.title()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <AccountsTable
              accounts={accountsList}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </motion.div>

      <AccountFormDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setEditingAccount(null);
        }}
        initialData={editingAccount}
      />

      <DeleteConfirmationDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteMutation.mutate(deletingId);
        }}
        isLoading={deleteMutation.isPending}
        title="Supprimer le compte"
        description="Voulez-vous vraiment supprimer ce compte ? Cette action est irréversible."
      />
    </div>
  );
}
