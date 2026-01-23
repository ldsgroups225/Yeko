import { IconDots, IconEdit, IconTag, IconTrash } from "@tabler/icons-react";
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
import { generateUUID } from "@/utils/generateUUID";

interface Discount {
  id: string;
  code: string;
  name: string;
  type: string;
  calculationType: string;
  value: number;
  requiresApproval: boolean;
  autoApply: boolean;
  status: string;
}

interface DiscountsTableProps {
  discounts: Discount[];
  isLoading?: boolean;
  onEdit?: (discount: Discount) => void;
  onDelete?: (discount: Discount) => void;
}

export function DiscountsTable({
  discounts,
  isLoading = false,
  onEdit,
  onDelete,
}: DiscountsTableProps) {
  const t = useTranslations();

  const getTypeLabel = (type: string) => {
    const typeTranslations = {
      sibling: t.finance.discountTypes.sibling,
      scholarship: t.finance.discountTypes.scholarship,
      staff: t.finance.discountTypes.staff,
      early_payment: t.finance.discountTypes.early_payment,
      financial_aid: t.finance.discountTypes.financial_aid,
      other: t.finance.discountTypes.other,
    };
    return typeTranslations[type as keyof typeof typeTranslations]?.() || type;
  };

  const formatValue = (discount: Discount) => {
    if (discount.calculationType === "percentage") {
      return `${discount.value}%`;
    }
    return `${new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(discount.value)} FCFA`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map(() => (
          <Skeleton key={generateUUID()} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (discounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border-2 border-dashed border-border/30 rounded-xl bg-card/10 m-4">
        <div className="p-4 rounded-full bg-muted/20 mb-4">
          <IconTag className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-medium">
          {t.finance.discounts.noDiscounts()}
        </p>
        <p className="text-sm max-w-sm mt-1 text-muted-foreground/70">
          {t.finance.discounts.createDescription()}
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
              <TableHead className="font-semibold">
                {t.finance.discounts.code()}
              </TableHead>
              <TableHead className="font-semibold">{t.common.name()}</TableHead>
              <TableHead className="font-semibold">
                {t.finance.discounts.type()}
              </TableHead>
              <TableHead className="font-semibold">
                {t.finance.discounts.value()}
              </TableHead>
              <TableHead className="font-semibold">
                {t.common.status()}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {t.common.actions()}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {discounts.map((discount, index) => (
                <motion.tr
                  key={discount.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-muted/30 border-border/40 transition-colors"
                >
                  <TableCell className="font-mono text-sm font-medium text-muted-foreground">
                    {discount.code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-bold text-foreground">
                        {discount.name}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {discount.autoApply && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-1.5 bg-blue-500/10 text-blue-700 border-blue-200 dark:border-blue-900/30 dark:text-blue-400"
                          >
                            Auto
                          </Badge>
                        )}
                        {discount.requiresApproval && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-1.5 bg-orange-500/10 text-orange-700 border-orange-200 dark:border-orange-900/30 dark:text-orange-400"
                          >
                            Approbation
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-medium">
                      {getTypeLabel(discount.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    {formatValue(discount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        discount.status === "active" ? "default" : "secondary"
                      }
                      className="capitalize rounded-md"
                    >
                      {discount.status === "active"
                        ? t.common.active()
                        : t.common.inactive()}
                    </Badge>
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
                          onClick={() => onEdit?.(discount)}
                          className="rounded-lg cursor-pointer focus:bg-primary/10 font-medium"
                        >
                          <IconEdit className="mr-2 h-4 w-4 text-muted-foreground" />
                          {t.common.edit()}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/40" />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(discount)}
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer font-medium"
                        >
                          <IconTrash className="mr-2 h-4 w-4" />
                          {t.common.delete()}
                        </DropdownMenuItem>
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
          {discounts.map((discount, index) => (
            <motion.div
              key={discount.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-md space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="font-mono text-xs font-bold text-muted-foreground bg-muted/20 px-2 py-1 rounded-md">
                    {discount.code}
                  </div>
                  <Badge
                    variant={
                      discount.status === "active" ? "default" : "secondary"
                    }
                    className="capitalize rounded-md text-[10px]"
                  >
                    {discount.status === "active"
                      ? t.common.active()
                      : t.common.inactive()}
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
                      onClick={() => onEdit?.(discount)}
                      className="rounded-lg cursor-pointer focus:bg-primary/10 font-medium"
                    >
                      <IconEdit className="mr-2 h-4 w-4 text-muted-foreground" />
                      {t.common.edit()}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/40" />
                    <DropdownMenuItem
                      onClick={() => onDelete?.(discount)}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer font-medium"
                    >
                      <IconTrash className="mr-2 h-4 w-4" />
                      {t.common.delete()}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <div className="font-bold text-lg">{discount.name}</div>
                <div className="flex gap-1 mt-2">
                  <Badge variant="secondary" className="font-medium text-xs">
                    {getTypeLabel(discount.type)}
                  </Badge>
                  {discount.autoApply && (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-blue-500/10 text-blue-700 border-blue-200 dark:border-blue-900/30 dark:text-blue-400"
                    >
                      Auto
                    </Badge>
                  )}
                  {discount.requiresApproval && (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-orange-500/10 text-orange-700 border-orange-200 dark:border-orange-900/30 dark:text-orange-400"
                    >
                      Approbation
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/20 border border-border/20 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {t.finance.discounts.value()}
                </span>
                <span className="font-bold text-lg text-primary">
                  {formatValue(discount)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
