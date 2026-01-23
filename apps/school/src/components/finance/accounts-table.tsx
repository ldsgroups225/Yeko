import {
  IconBookmark,
  IconChevronRight,
  IconDots,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import { generateUUID } from "@/utils/generateUUID";

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  level: number;
  balance: number;
  isHeader: boolean;
  status: string;
}

interface AccountsTableProps {
  accounts: Account[];
  isLoading?: boolean;
  onEdit?: (account: Account) => void;
  onDelete?: (account: Account) => void;
}

export function AccountsTable({
  accounts,
  isLoading = false,
  onEdit,
  onDelete,
}: AccountsTableProps) {
  const t = useTranslations();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      asset: "Actif",
      liability: "Passif",
      equity: "Capitaux",
      revenue: "Produits",
      expense: "Charges",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "asset":
        return "bg-blue-500/10 text-blue-700 border-blue-200 dark:border-blue-900/30 dark:text-blue-400";
      case "liability":
        return "bg-red-500/10 text-red-700 border-red-200 dark:border-red-900/30 dark:text-red-400";
      case "equity":
        return "bg-purple-500/10 text-purple-700 border-purple-200 dark:border-purple-900/30 dark:text-purple-400";
      case "revenue":
        return "bg-green-500/10 text-green-700 border-green-200 dark:border-green-900/30 dark:text-green-400";
      case "expense":
        return "bg-orange-500/10 text-orange-700 border-orange-200 dark:border-orange-900/30 dark:text-orange-400";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 8 }).map(() => (
          <Skeleton key={generateUUID()} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border-2 border-dashed border-border/30 rounded-xl bg-card/10 m-4">
        <div className="p-4 rounded-full bg-muted/20 mb-4">
          <IconBookmark className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-medium">{t.finance.accounts.noAccounts()}</p>
        <p className="text-sm max-w-sm mt-1 text-muted-foreground/70">
          {t.finance.accounts.createDescription()}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="w-[120px] font-semibold">
                {t.finance.accounts.code()}
              </TableHead>
              <TableHead className="font-semibold">
                {t.finance.accounts.account()}
              </TableHead>
              <TableHead className="font-semibold">
                {t.finance.accounts.type()}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {t.finance.accounts.balance()}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {t.common.actions()}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {accounts.map((account, index) => (
                <motion.tr
                  key={account.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group hover:bg-muted/30 border-border/40 transition-colors",
                    {
                      "bg-muted/5": account.isHeader,
                    },
                  )}
                >
                  <TableCell className="font-mono text-sm font-medium text-muted-foreground">
                    {account.code}
                  </TableCell>
                  <TableCell>
                    <div
                      className={cn("flex items-center gap-2", {
                        "font-bold text-foreground": account.isHeader,
                        "font-medium": !account.isHeader,
                      })}
                      style={{ paddingLeft: `${(account.level - 1) * 24}px` }}
                    >
                      {account.level > 1 && (
                        <IconChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                      )}
                      {account.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium border",
                        getTypeColor(account.type),
                      )}
                    >
                      {getTypeLabel(account.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold tabular-nums">
                    {!account.isHeader && (
                      <>
                        {formatCurrency(account.balance)}{" "}
                        <span className="text-xs text-muted-foreground font-medium ml-1">
                          FCFA
                        </span>
                      </>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <IconDots className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent
                        align="end"
                        className="backdrop-blur-xl bg-card/95 border-border/40 shadow-xl rounded-xl p-1"
                      >
                        <DropdownMenuItem
                          onClick={() => onEdit?.(account)}
                          className="rounded-lg cursor-pointer focus:bg-primary/10 font-medium"
                        >
                          <IconEdit className="mr-2 h-4 w-4 text-muted-foreground" />
                          {t.common.edit()}
                        </DropdownMenuItem>
                        {!account.isHeader && (
                          <>
                            <DropdownMenuSeparator className="bg-border/40" />
                            <DropdownMenuItem
                              onClick={() => onDelete?.(account)}
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer font-medium"
                            >
                              <IconTrash className="mr-2 h-4 w-4" />
                              {t.common.delete()}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-4 p-4">
        <AnimatePresence>
          {accounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "p-4 rounded-2xl border border-border/40 backdrop-blur-md space-y-3",
                {
                  "bg-muted/10": account.isHeader,
                  "bg-card/50": !account.isHeader,
                },
              )}
              style={{ marginLeft: `${(account.level - 1) * 16}px` }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="font-mono text-xs font-bold text-muted-foreground bg-muted/20 px-2 py-1 rounded-md">
                    {account.code}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium border text-[10px]",
                      getTypeColor(account.type),
                    )}
                  >
                    {getTypeLabel(account.type)}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg -mr-2 -mt-2"
                      >
                        <IconDots className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent
                    align="end"
                    className="backdrop-blur-xl bg-card/95 border-border/40 shadow-xl rounded-xl p-1"
                  >
                    <DropdownMenuItem
                      onClick={() => onEdit?.(account)}
                      className="rounded-lg cursor-pointer focus:bg-primary/10 font-medium"
                    >
                      <IconEdit className="mr-2 h-4 w-4 text-muted-foreground" />
                      {t.common.edit()}
                    </DropdownMenuItem>
                    {!account.isHeader && (
                      <>
                        <DropdownMenuSeparator className="bg-border/40" />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(account)}
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer font-medium"
                        >
                          <IconTrash className="mr-2 h-4 w-4" />
                          {t.common.delete()}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="font-bold text-lg">{account.name}</div>

              {!account.isHeader && (
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <span className="text-sm text-muted-foreground">
                    {t.finance.accounts.balance()}
                  </span>
                  <div className="font-bold text-lg">
                    {formatCurrency(account.balance)}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      FCFA
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
