import type { ColumnDef } from "@tanstack/react-table";
import {
  IconDots,
  IconEdit,
  IconEye,
  IconSearch,
  IconShield,
  IconTrash,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/hr/empty-state";
import { TableSkeleton } from "@/components/hr/table-skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { useTranslations } from "@/i18n";
import { getRoles } from "@/school/functions/roles";

interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  scope: "school" | "system";
  isSystemRole: boolean;
  userCount: number;
  permissionCount: number;
}

interface RolesTableProps {
  filters: {
    page?: number;
    search?: string;
    scope?: "school" | "system";
  };
}

export function RolesTable({ filters }: RolesTableProps) {
  const t = useTranslations();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const debouncedSearch = useDebounce(searchInput, 500);

  const { data, isLoading } = useQuery({
    queryKey: ["roles", { ...filters, search: debouncedSearch }],
    queryFn: async () => {
      const result = await getRoles({
        data: {
          filters: {
            search: debouncedSearch,
            scope: filters.scope,
          },
          pagination: {
            page: filters.page || 1,
            limit: 20,
          },
        },
      });
      return result;
    },
  });

  const columns = useMemo<ColumnDef<Role>[]>(
    () => [
      {
        accessorKey: "name",
        header: t.hr.roles.name(),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconShield className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">
                {row.original.name}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                {row.original.slug}
              </span>
            </div>
            {row.original.isSystemRole && (
              <Badge
                variant="secondary"
                className="bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 transition-colors"
              >
                {t.hr.roles.system()}
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: t.hr.roles.description(),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground line-clamp-1 max-w-[300px]">
            {row.original.description || t.common.none()}
          </span>
        ),
      },
      {
        accessorKey: "permissionCount",
        header: t.hr.roles.permissions(),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-border/40 font-medium">
              {row.original.permissionCount}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {t.hr.roles.permissionsCount({
                count: row.original.permissionCount,
              })}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "userCount",
        header: t.hr.roles.users(),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="font-medium">{row.original.userCount || 0}</span>
            <span className="text-xs text-muted-foreground">
              {t.hr.roles.users()}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <IconDots className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent
              align="end"
              className="backdrop-blur-2xl bg-popover/90 border-border/40 min-w-[160px]"
            >
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() =>
                  navigate({ to: `/users/roles/${row.original.id}` })
                }
              >
                <IconEye className="h-4 w-4" />
                {t.common.view()}
              </DropdownMenuItem>
              {!row.original.isSystemRole && (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onClick={() =>
                      navigate({ to: `/users/roles/${row.original.id}/edit` })
                    }
                  >
                    <IconEdit className="h-4 w-4" />
                    {t.common.edit()}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10">
                    <IconTrash className="h-4 w-4" />
                    {t.common.delete()}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, navigate],
  );

  const table = useReactTable({
    data: data?.roles || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || 0,
  });

  if (isLoading) {
    return <TableSkeleton columns={5} rows={5} />;
  }

  const hasNoData = !data?.roles || data.roles.length === 0;
  const hasNoResults = hasNoData && (debouncedSearch || filters.scope);

  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-2xl font-serif">
              {t.hr.roles.listTitle()}
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.hr.roles.searchPlaceholder()}
                value={searchInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchInput(e.target.value)
                }
                className="pl-10 rounded-xl bg-background/50 border-border/40 focus:bg-background transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Empty State */}
          {hasNoData && !hasNoResults && (
            <div className="py-12">
              <EmptyState
                icon={IconShield}
                title={t.hr.roles.noRoles()}
                description={t.hr.roles.noRolesDescription()}
                action={{
                  label: t.hr.roles.addRole(),
                  onClick: () => navigate({ to: "/users/roles/new" }),
                }}
              />
            </div>
          )}

          {/* No Results State */}
          {hasNoResults && (
            <div className="py-12">
              <EmptyState
                icon={IconSearch}
                title={t.common.noResults()}
                description={t.common.noResultsDescription()}
              />
            </div>
          )}

          {/* Table */}
          {!hasNoData && (
            <div className="rounded-xl border border-border/40 bg-background/30 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50 backdrop-blur-md">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="hover:bg-transparent border-border/40"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="text-xs uppercase tracking-wider font-semibold py-4"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {table.getRowModel().rows.map((row, index) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{
                          duration: 0.2,
                          delay: index * 0.03,
                          ease: "easeOut",
                        }}
                        className="group hover:bg-primary/5 transition-colors border-border/40 cursor-pointer"
                        onClick={() =>
                          navigate({ to: `/users/roles/${row.original.id}` })
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-4">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!hasNoData && data && data.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <div className="text-sm text-muted-foreground font-medium">
                {t.common.showing()}{" "}
                <span className="text-foreground">
                  {(data.page - 1) * data.limit + 1}
                </span>{" "}
                -{" "}
                <span className="text-foreground">
                  {Math.min(data.page * data.limit, data.total)}
                </span>{" "}
                {t.common.of()}{" "}
                <span className="text-foreground">{data.total}</span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-border/40 bg-background/50 hover:bg-background transition-all px-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate({
                      to: "/users/roles",
                      search: { ...filters, page: data.page - 1 },
                    });
                  }}
                  disabled={data.page === 1}
                >
                  {t.common.previous()}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-border/40 bg-background/50 hover:bg-background transition-all px-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate({
                      to: "/users/roles",
                      search: { ...filters, page: data.page + 1 },
                    });
                  }}
                  disabled={data.page === data.totalPages}
                >
                  {t.common.next()}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
