import type { ColumnDef } from "@tanstack/react-table";
import {
  IconBook,
  IconCalendar,
  IconDots,
  IconEdit,
  IconEye,
  IconMail,
  IconSchool,
  IconSearch,
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
import { format } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/hr/empty-state";
import { TableSkeleton } from "@/components/hr/table-skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { useTranslations } from "@/i18n";
import { getTeachers } from "@/school/functions/teachers";

interface TeachersTableProps {
  filters: {
    page?: number;
    search?: string;
    subjectId?: string;
    status?: "active" | "inactive" | "on_leave";
  };
}

export function TeachersTable({ filters }: TeachersTableProps) {
  const t = useTranslations();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const debouncedSearch = useDebounce(searchInput, 500);

  const { data, isLoading } = useQuery({
    queryKey: ["teachers", { ...filters, search: debouncedSearch }],
    queryFn: async () => {
      const result = await getTeachers({
        data: {
          filters: {
            search: debouncedSearch,
            subjectId: filters.subjectId,
            status: filters.status,
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

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "user.name",
        header: t.hr.teachers.name(),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {row.original.user.name}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <IconMail className="h-3 w-3" />
              {row.original.user.email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "subjects",
        header: t.hr.teachers.subjects(),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5 max-w-[240px]">
            {row.original.subjects && row.original.subjects.length > 0 ? (
              row.original.subjects.slice(0, 3).map((subject: string) => (
                <Badge
                  key={subject}
                  variant="outline"
                  className="bg-primary/5 border-primary/10 text-primary text-[10px] font-medium px-2 py-0"
                >
                  {subject}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">-</span>
            )}
            {row.original.subjects && row.original.subjects.length > 3 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                + {row.original.subjects.length - 3}
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "specialization",
        header: t.hr.teachers.specialization(),
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-sm">
            <IconBook className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">
              {row.original.specialization || "-"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t.hr.teachers.status(),
        cell: ({ row }) => {
          const status = row.original.status as
            | "active"
            | "inactive"
            | "on_leave";
          const variants = {
            active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
            inactive: "bg-slate-500/10 text-slate-600 border-slate-500/20",
            on_leave: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          } as const;
          return (
            <Badge
              variant="outline"
              className={`rounded-full border ${variants[status]} transition-colors`}
            >
              {{
                active: t.hr.status.active,
                inactive: t.hr.status.inactive,
                on_leave: t.hr.status.on_leave,
              }[status]()}
            </Badge>
          );
        },
      },
      {
        accessorKey: "hireDate",
        header: t.hr.teachers.hireDate(),
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconCalendar className="h-3.5 w-3.5" />
            {row.original.hireDate
              ? format(new Date(row.original.hireDate), "dd MMM yyyy")
              : "-"}
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
                  navigate({ to: `/users/teachers/${row.original.id}` })
                }
              >
                <IconEye className="h-4 w-4" />
                {t.common.view()}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() =>
                  navigate({ to: `/users/teachers/${row.original.id}/edit` })
                }
              >
                <IconEdit className="h-4 w-4" />
                {t.common.edit()}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10">
                <IconTrash className="h-4 w-4" />
                {t.common.delete()}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, navigate],
  );

  const table = useReactTable({
    data: data?.teachers || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || 0,
  });

  if (isLoading) {
    return <TableSkeleton columns={6} rows={5} />;
  }

  const hasNoData = !data?.teachers || data.teachers.length === 0;
  const hasNoResults =
    hasNoData && (debouncedSearch || filters.subjectId || filters.status);

  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-2xl font-serif">
              {t.hr.teachers.listTitle()}
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.hr.teachers.searchPlaceholder()}
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
                icon={IconSchool}
                title={t.hr.teachers.noTeachers()}
                description={t.hr.teachers.noTeachersDescription()}
                action={{
                  label: t.hr.teachers.addTeacher(),
                  onClick: () => navigate({ to: "/users/teachers/new" }),
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
                          navigate({ to: `/users/teachers/${row.original.id}` })
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
                      to: "/users/teachers",
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
                      to: "/users/teachers",
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
