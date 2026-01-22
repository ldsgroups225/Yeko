"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";

import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslations } from "@/i18n";
import { accountsKeys } from "@/lib/queries/accounts";
import {
  accountTypeLabels,
  accountTypes,
  normalBalanceLabels,
  normalBalances,
} from "@/schemas/account";
import {
  createNewAccount,
  updateExistingAccount,
} from "@/school/functions/accounts";

const accountFormSchema = z.object({
  code: z.string().min(1, "Code requis").max(20, "Code trop long"),
  name: z.string().min(1, "Nom requis").max(100, "Nom trop long"),
  nameEn: z.string().max(100).optional(),
  type: z.enum(accountTypes, { message: "Type de compte invalide" }),
  normalBalance: z.enum(normalBalances, { message: "Solde normal invalide" }),
  isHeader: z.boolean(),
  description: z.string().max(500).optional(),
});

type AccountFormData = z.infer<typeof accountFormSchema>;

interface AccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

export function AccountFormDialog({
  open,
  onOpenChange,
  initialData,
}: AccountFormDialogProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          code: initialData.code || "",
          name: initialData.name || "",
          nameEn: initialData.nameEn || "",
          type: initialData.type || "asset",
          normalBalance: initialData.normalBalance || "debit",
          isHeader: !!initialData.isHeader,
          description: initialData.description || "",
        });
      } else {
        form.reset({
          code: "",
          name: "",
          nameEn: "",
          type: "asset",
          normalBalance: "debit",
          isHeader: false,
          description: "",
        });
      }
    }
  }, [open, initialData, form]);

  const isEditing = !!initialData;

  const mutation = useMutation({
    mutationFn: (data: AccountFormData) => {
      if (isEditing) {
        return updateExistingAccount({
          data: {
            id: initialData.id,
            ...data,
          },
        });
      }
      return createNewAccount({
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountsKeys.all });
      toast.success(
        isEditing ? "Compte mis à jour" : t.finance.accounts.created(),
      );
      form.reset();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (data: AccountFormData) => {
    mutation.mutate(data);
  };

  // Auto-set normal balance based on account type
  const getDefaultNormalBalance = (type: string) => {
    if (type === "asset" || type === "expense") return "debit";
    return "credit";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-xl bg-card/95 border-border/40 shadow-2xl rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Modifier le compte" : t.finance.accounts.create()}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            {isEditing
              ? "Modifier les paramètres de ce compte"
              : t.finance.accounts.createDescription()}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                      {t.common.code()} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="1000"
                        className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                      {t.finance.accounts.type()} *
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value) {
                          form.setValue(
                            "normalBalance",
                            getDefaultNormalBalance(value),
                          );
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl backdrop-blur-xl bg-popover/95 border-border/40 shadow-xl">
                        {accountTypes.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="rounded-lg cursor-pointer focus:bg-primary/10"
                          >
                            {accountTypeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    {t.common.name()} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t.finance.accounts.placeholders.name()}
                      className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    {t.common.nameEn()}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t.finance.accounts.placeholders.nameEn()}
                      className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    {t.common.optionalEnglishName()}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="normalBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    {t.finance.accounts.normalBalance()} *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl backdrop-blur-xl bg-popover/95 border-border/40 shadow-xl">
                      {normalBalances.map((balance) => (
                        <SelectItem
                          key={balance}
                          value={balance}
                          className="rounded-lg cursor-pointer focus:bg-primary/10"
                        >
                          {normalBalanceLabels[balance]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                    {t.common.description()}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      className="rounded-xl border-border/40 bg-muted/20 focus:bg-background transition-colors resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isHeader"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0 p-3 rounded-xl border border-border/40 bg-muted/10">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-0.5">
                    <FormLabel className="font-bold text-sm">
                      {t.finance.accounts.isHeader()}
                    </FormLabel>
                    <FormDescription className="text-xs">
                      {t.finance.accounts.isHeaderDescription()}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl border-border/40"
              >
                {t.common.cancel()}
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="rounded-xl shadow-lg shadow-primary/20"
              >
                {mutation.isPending && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t.common.save()}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
